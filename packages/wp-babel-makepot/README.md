# wp-babel-makepot

A utility for extracting translatable strings from JavaScript source.

## Using the CLI

`wp-babel-makepot "<input_files>" -i "<ignore_patterns>" -b "<base_dir>" -d "<output_segments_dir>" -o "<output_file>" -p <babel_preset>`

Example:
`wp-babel-makepot "./src/**/*.{js,jsx,ts,tsx}" -i "**/*.d.ts" -b "./src" -d "./build" -o "./build/bundle-strings.pot"`

Docker:

```
docker run --init -it -v ~/path/to/source/files:/src -v ~/path/to/output:/build wp-babel-makepot
```

## Develop

Locally (without docker)

```
yarn install
yarn run start "some/src/**/*.js{,x}" -- --ignore "**/node_modules/**,**/*.spec.js,**/*.test.js" --output "./strings.pot"
```

With Docker

```
docker build -t wp-babel-makepot .
docker run --init -it -v ~/path/to/source/files:/src -v ~/path/to/output:/build wp-babel-makepot
```
