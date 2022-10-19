const { nodeConfig } = require( '@automattic/calypso-eslint-overrides' );

module.exports = {
	env: {
		browser: true,
	},
	rules: {
		'react/react-in-jsx-scope': 0,
		'wpcalypso/jsx-classname-namespace': 'off',
	},
	overrides: [
		{
			files: [ './bin/**/*', './webpack.config.js' ],
			...nodeConfig,
		},
	],
};
