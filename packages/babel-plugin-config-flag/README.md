# Babel plugin config flag

A Babel plugin to replace `config.isEnabled` flag checks with literals.

## Usage

Include in your Babel configuration as a plugin.

Be sure to specify the flags you want to replace, as well as the value you want
to replace them with, in the `flags` parameter.

Example Babel config file:

```js
{
	"plugins": [
		[ "@automattic/babel-plugin-config-flag", { flags: { flagName: flagValue } } ]
	]
}
```

The above configuration will replace any `isEnabled( 'flagName' )` calls with
the value provided by `flagValue`.
