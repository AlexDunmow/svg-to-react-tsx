#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const process = require("process");
const SVGR = require("@svgr/core");

function help() {
  console.log(
    "# svg-to-react-tsx <Folder path of SVGs> [TSX Output Folder] [--lazy]"
  );
  console.log("--lazy flag to use lazy importing for your index.ts");
  console.log("--prefix=Prefix output filename and component prefix");
  console.log("--suffix=Suffix output filename and component suffix");
}

if (process.argv.length === 2) {
  console.error("Expected at least one argument!");
  help();
  process.exit(1);
}

const flags = [];
const opts = { in: null, out: null, prefix: "Icon", suffix: "", lazy: false };
process.argv.forEach((p, index) => {
  if (index > 1 && !p.startsWith("--")) {
    if (opts.in) {
      if (opts.out) {
        console.log("Unexpected argument.");
        process.exit(1);
      }
      opts, (out = p);
    } else {
      opts.in = p;
    }
  } else if (p.startsWith("--")) {
    if (p === "--help") {
      help();
      process.exit(0);
    } else if (p.startsWith("--suffix") || p.startsWith("--prefix")) {
      const flagParts = p.split("=");
      if (flagParts.length !== 2) {
        console.log(
          "Error! Flag needs to formatted as such: " + flagParts[0] + "=Example"
        );
        help();
        process.exit(1);
      }
      opts[flagParts[0].replace("--", "")] = flagParts[1];
    } else if (p === "--lazy") {
      opts.lazy = true;
    }
  }
});

if (!opts.in) {
  console.log("Error! No path provided.");
  help();
  process.exit(1);
}

if (!path.out) opts.out = opts.in;

function formatFileName(filename, prefix, suffix) {
  const s = path.basename(filename, path.extname(filename));
  return (
    prefix +
    s
      .replace(/^[a-z]|[^a-zA-Z0-9]+[a-z]/g, (match, index) => {
        return index === 0
          ? match.toUpperCase()
          : match.toUpperCase().replace(" ", "");
      })
      .replace(/[^a-zA-Z0-9]+/g, "") +
    suffix
  );
}

if (flags.indexOf("--help") > -1) {
  help();
  process.exit(0);
}

// Loop through all the files in the temp directory
fs.readdir(opts.in, function (err, files) {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }

  let tsIndex =
    "import React, { Suspense } from 'react';\n\nexport type IconKey = ";
  let keys = [];

  files = files.filter((file) => file.endsWith(".svg"));

  files.forEach(async function (file, index) {
    // Make one pass and make the file complete

    const newFN = formatFileName(file, opts.prefix, opts.suffix);
    keys.push(newFN);

    process.stdout.write(
      "Converting " +
        index +
        "/" +
        files.length +
        " - " +
        file +
        " >> " +
        newFN +
        ".tsx                  \r"
    );

    fs.readFile(path.join(opts.in, file), "utf8", async (err, fileContents) => {
      // TODO: Handle error case here

      if (err) {
        console.error("Could not open the file.", err);
        process.exit(1);
      }

      const jsCode = await SVGR.transform(
        fileContents,
        { icon: true, typescript: true, prettier: true },
        { componentName: newFN }
      );

      fs.writeFile(
        path.join(opts.out, newFN + ".tsx"),
        jsCode,
        "utf8",
        (err) => {
          if (err) {
            console.error("Could not write TSX file.", err);
            process.exit(1);
          }
        }
      );
    });
  });
  tsIndex += keys
    .map((key, i) => (i === 0 ? '"' + key + '"' : ' | "' + key + '"'))
    .join("");
  tsIndex += "\n\n";
  keys.forEach((key) => {
    if (opts.lazy) {
      tsIndex += `export const ${key} = React.lazy(() => import('./${key}'));\n`;
    } else {
      tsIndex += `export const ${key} = import('./${key}');\n`;
    }
  });
  fs.writeFile(path.join(opts.out, "index.ts"), tsIndex, "utf8", (err) => {
    if (err) {
      console.error("Could not write index file.", err);
      process.exit(1);
    }
  });
});
