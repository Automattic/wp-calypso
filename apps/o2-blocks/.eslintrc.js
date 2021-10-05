const nodeConfig = require( '@automattic/calypso-build/eslint/node' );

module.exports = {
	env: {
		browser: true,
	},
	rules: {
		'react/react-in-jsx-scope': 0,
		'wpcalypso/jsx-classname-namespace': 0,
	},
	overrides: [
		{
			files: [ './bin/**/*', './webpack.config.js' ],
			...nodeConfig,
		},
	],
};
