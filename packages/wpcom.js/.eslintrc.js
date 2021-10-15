const nodeConfig = require( '@automattic/calypso-eslint-overrides/node' );

module.exports = {
	env: {
		browser: true,
	},
	overrides: [
		{
			files: './examples/server/**/*',
			...nodeConfig,
		},
		{
			files: './test/**/*',
			rules: {
				// These files use a weird mixture of CJS and ESM. Disabling the rules for now until they can
				// get refactored.
				'import/default': 'off',

				// Test can use Node modules
				'import/no-nodejs-modules': 'off',
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
