const nodeConfig = require( '@automattic/calypso-build/eslint/node' );

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
