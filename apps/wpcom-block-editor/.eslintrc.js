const { nodeConfig } = require( '@automattic/calypso-eslint-overrides' );

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
