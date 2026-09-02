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
	rules: {
		// This app imports `combineReducers` from redux directly, so the root
		// `no-restricted-imports` rule (which forbids it) is turned off here.
		'no-restricted-imports': 'off',
	},
};
