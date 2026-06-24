const { nodeConfig, lodashRestrictedImports } = require( '@automattic/calypso-eslint-overrides' );

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
		// restriction on it is intentionally not applied here. The shared lodash
		// guard still applies.
		'no-restricted-imports': [
			'error',
			{ paths: lodashRestrictedImports.paths, patterns: lodashRestrictedImports.patterns },
		],
	},
};
