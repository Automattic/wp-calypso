const nodeConfig = require( '@automattic/calypso-eslint-overrides/node' );

module.exports = {
	env: {
		browser: true,
	},
	overrides: [
		{
			files: [ './examples/server/**/*', './examples/node/**/*' ],
			...nodeConfig,
		},
		{
			files: [ './examples/**/package.json' ],
			rules: {
				'@automattic/json/require-repository-directory': 'off',
				'@automattic/json/require-license': 'off',
				'@automattic/json/valid-values-name-scope': 'off',
				'@automattic/json/description-format': 'off',
				'@automattic/json/valid-values-author': 'off',
			},
		},

		{
			files: './test/**/*',
			rules: {
				// These files use a weird mixture of CJS and ESM. Disabling the rules for now until they can
				// get refactored.
				'import/default': 'off',
			},
		},
	],
	rules: {
		'jsdoc/no-undefined-types': [
			'error',
			{
				definedTypes: [ 'WPCOM' ],
			},
		],
	},
};
