# Config flag webpack plugin

A webpack plugin to replace `config.isEnabled` flag checks with literals.

## Usage

Include in your webpack configuration as a plugin.

Be sure to specify the flags you want to replace, as well as the value you want
to replace them with, in the `flags` parameter.

Example Babel config file:

```js
const babelConfig = {
	plugins: [
		new ConfigFlagPlugin( {
			flags: { flagName: config.isEnabled( flagName ) },
		} ),
	],
};
```

The above example will replace any `isEnabled( 'flagName' )` calls with the
current value for that flag in the config.
