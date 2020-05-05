# Babel plugin i18n Calypso

A Babel plugin to generate a POT file for translate calls. Works with [i18n-calypso](https://www.npmjs.com/package/i18n-calypso) `translate` and [@wordpress/i18n](https://www.npmjs.com/package/@wordpress/i18n) `__`, `_n`, `_x`, `_nx` calls.

## Usage

Include in your Babel configuration as a plugin.

Example Babel config file:

```json
{
	"plugins": [ "@automattic/babel-plugin-i18n-calypso" ]
}
```

## Options

- `dir` - Set the output directory for the POT files.
- `base` - Set a base path that will be used as a base for the relative path to the source file in the reference comment.
