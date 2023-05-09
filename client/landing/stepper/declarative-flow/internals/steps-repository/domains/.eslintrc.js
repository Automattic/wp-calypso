const nodeConfig = require( '@automattic/calypso-eslint-overrides/node' );

module.exports = {
	...nodeConfig,
	rules: {
		...nodeConfig.rules,
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ argsIgnorePattern: '^_', ignoreRestSiblings: true },
		],
	},
};
