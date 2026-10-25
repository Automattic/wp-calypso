# wp-babel-makepot

A utility for extracting translatable strings from JavaScript source.

## Using the CLI

`wp-babel-makepot "<input_files>" -i "<ignore_patterns>" -b "<base_dir>" -d "<output_segments_dir>" -o "<output_file>" -j <jobs>`

Example:
`wp-babel-makepot "./src/**/*.{js,jsx,ts,tsx}" -i "**/*.d.ts" -b "./src" -d "./build" -o "./build/bundle-strings.pot" -j auto`

`--jobs` accepts a positive integer or `auto`.

Requires Node.js `^20.19.0` or `>=22.12.0`. Strings are found by parsing the files with [oxc-parser](https://www.npmjs.com/package/oxc-parser), which reads JavaScript, JSX, TypeScript and decorators without any configuration.

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
