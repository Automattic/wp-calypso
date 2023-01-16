const { nodeConfig } = require( '@automattic/calypso-eslint-overrides' );

module.exports = {
	env: {
		browser: true,
	},
	overrides: [
		{
			files: [ './bin/**/*', './webpack.config.js' ],
			...nodeConfig,
		},
	],
};
