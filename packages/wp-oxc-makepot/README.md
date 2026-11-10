# @automattic/wp-oxc-makepot

Extracts translatable strings from JavaScript and TypeScript source into POT files: i18n-calypso's `translate()` and `@wordpress/i18n`'s `__()`, `_n()`, `_x()` and `_nx()`, with their contexts, plurals and `translators:` comments.

Files are parsed with [oxc-parser](https://www.npmjs.com/package/oxc-parser), which reads JavaScript, JSX, TypeScript and decorators without any configuration. It extracts the same strings as [`@automattic/wp-babel-makepot`](https://www.npmjs.com/package/@automattic/wp-babel-makepot), which compiles each file with Babel to find them, several times faster.

Requires Node.js `^20.19.0` or `>=22.12.0`.

## Using the CLI

`wp-oxc-makepot "<input_files>" -i "<ignore_patterns>" -b "<base_dir>" -d "<output_segments_dir>" -o "<output_file>" -l "<lines_filter_file>" -j <jobs>`

Example:
`wp-oxc-makepot "./src/**/*.{js,jsx,ts,tsx}" -i "**/*.d.ts" -b "./src" -d "./build" -o "./build/bundle-strings.pot" -j auto`

`--jobs` accepts a positive integer or `auto`. The options are the same as `wp-babel-makepot`'s, except `--preset`, which isn't needed.

## Develop

```
yarn workspace @automattic/wp-oxc-makepot test
yarn workspace @automattic/wp-oxc-makepot start "some/src/**/*.{js,jsx,ts,tsx}" --ignore "**/node_modules/**" --output "./strings.pot"
```
