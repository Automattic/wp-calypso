const { nodeConfig } = require( '@automattic/calypso-eslint-overrides' );

module.exports = {
	overrides: [
		{
			files: [ 'bin/**/*', 'test/**/*' ],
			...nodeConfig,
		},
		{
			files: [ './package.json' ],
			rules: {
				'@automattic/json/valid-values-name-scope': 'off',
				'@automattic/json/name-format': 'off',
			},
		},
	],
};
