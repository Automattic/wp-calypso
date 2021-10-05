const nodeConfig = require( '@automattic/calypso-build/eslint/node' );

module.exports = {
	rules: {
		'react/react-in-jsx-scope': 0,
	},
	overrides: [
		{
			files: [ './bin/**/*', './webpack.config.js' ],
			...nodeConfig,
		},
	],
};
