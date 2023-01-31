# svg-to-react-tsx

A simple Node.js terminal app for bulk converting SVG files to TypeScript React (TSX) files using SVGR.

## Installation

```bash
npm install -g svg-to-react-tsx
```

## Usage

```bash
svg-to-react-tsx <Folder path of SVGs> [TSX Output Folder] [--lazy] [--suffix="Suffix"] []
```

## Options

### --lazy
Use lazy importing for your index.ts.
### --prefix=Prefix
Prefix output filename and component prefix (default is "Icon").
### --suffix=Suffix
Suffix output filename and component suffix.

## Parameters

    <Folder path of SVGs>: Required. The path to the folder containing the SVG files that you want to convert.
    <TSX Output Folder>: Optional. The path to the folder where the converted TSX files will be saved. If not provided, the files will be saved in the same folder as the SVG files.
    --lazy: Optional flag to use lazy importing for your index.ts.

## Example

To convert all the SVG files in the folder svgs and save the resulting TSX files to the folder components, use the following command:

```bash
svg-to-react-tsx svgs components
```

To convert all the SVG files in the folder svgs, save the resulting TSX files to the same folder, and give the components a suffix of "SVG", use the following command:

```bash
svg-to-react-tsx svgs --suffix="SVG" --lazy
```

## Requirements

This script requires Node.js and SVGR to be installed on your system. Please refer to the official documentation for installation instructions.

## Contributing

Feel free to contribute to this project by opening a pull request or an issue.