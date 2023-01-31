#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const process = require("process");
const SVGR = require("@svgr/core");

function help() {
  console.log(
    "# svg-to-react-tsx <Folder path of SVGs> [TSX Output Folder (optional)] [--lazy]"
  );
  console.log("--lazy flag to use lazy importing for your index.ts");
}

if (process.argv.length === 2) {
  console.error("Expected at least one argument!");
  help();
  process.exit(1);
}

const flags = [];
const fpath = { in: null, out: null };
const paths = process.argv.forEach((p, index) => {
  if (index > 1 && !p.startsWith("-")) {
    if (fpath.in) {
      if (fpath.out) {
        console.log("Unexpected argument.");
        process.exit(1);
      }
      fpath, (out = p);
    } else {
      fpath.in = p;
    }
  } else if (p.startsWith("-")) {
    flags.push(p);
  }
});

if (!fpath.in) {
  console.log("No path.");
  help();
  process.exit(1);
}

if (!path.out) fpath.out = fpath.in;

function formatFileName(filename) {
  const s = path.basename(filename, path.extname(filename));
  return s
    .replace(/^[a-z]|[^a-zA-Z0-9]+[a-z]/g, (match, index) => {
      return index === 0
        ? match.toUpperCase()
        : match.toUpperCase().replace(" ", "");
    })
    .replace(/[^a-zA-Z0-9]+/g, "");
}

if (flags.indexOf("--help") > -1) {
  help();
  process.exit(0);
}

// Loop through all the files in the temp directory
fs.readdir(fpath.in, function (err, files) {
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

    const newFN = formatFileName(file);
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

    fs.readFile(
      path.join(fpath.in, file),
      "utf8",
      async (err, fileContents) => {
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
          path.join(fpath.out, newFN + ".tsx"),
          jsCode,
          "utf8",
          (err) => {
            if (err) {
              console.error("Could not write TSX file.", err);
              process.exit(1);
            }
          }
        );
      }
    );
  });
  tsIndex += keys
    .map((key, i) => (i === 0 ? '"' + key + '"' : ' | "' + key + '"'))
    .join("");
  tsIndex += "\n\n";
  keys.forEach((key) => {
    if (flags.indexOf("--lazy") > -1) {
      tsIndex += `export const ${key} = React.lazy(() => import('./${key}'));\n`;
    } else {
      tsIndex += `export const ${key} = import('./${key}');\n`;
    }
  });
  fs.writeFile(path.join(fpath.out, "index.ts"), tsIndex, "utf8", (err) => {
    if (err) {
      console.error("Could not write index file.", err);
      process.exit(1);
    }
  });
});
