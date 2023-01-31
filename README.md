# svg-to-react-tsx

A simple Node.js terminal app for bulk converting SVG files to TypeScript React (TSX) files using SVGR.

## Installation

```bash
npm install -g svg-to-react-tsx
```

## Usage

```bash
svg-to-react-tsx <Folder path of SVGs> [TSX Output Folder] [--lazy]
```

## Parameters

    <Folder path of SVGs>: Required. The path to the folder containing the SVG files that you want to convert.
    <TSX Output Folder>: Optional. The path to the folder where the converted TSX files will be saved. If not provided, the files will be saved in the same folder as the SVG files.
    --lazy: Optional flag to use lazy importing for your index.ts.

## Example

```bash
svg-to-react-tsx ./svgs ./tsx-output --lazy
```

## Contributing

Feel free to contribute to this project by opening a pull request or an issue.