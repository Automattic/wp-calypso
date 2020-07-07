const path = require( 'path' );

module.exports = {
	env: {
		browser: true,
	},
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
	},
	overrides: [
		{
			files: [ '**/test/**/*' ],
			rules: {
				'import/no-extraneous-dependencies': [
					'error',
					{ packageDir: [ __dirname, path.join( __dirname, '..', '..' ) ] },
				],
			},
		},
	],
};
