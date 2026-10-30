# Changelog

## 1.0.0

- Initial release. Extracts the same strings as `@automattic/wp-babel-makepot` 1.2.0, with the same CLI options except `--preset`, by parsing files with oxc-parser instead of compiling them with Babel. On Calypso's sources it's about 5 times faster with `--jobs 1` and 3 times faster with `--jobs auto`.
- When a `Plural-Forms` header is passed in `headers`, plural strings get one empty `msgstr` per plural form; `wp-babel-makepot` gives a single one.
