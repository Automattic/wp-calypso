const path = require( 'path' );
module.exports = {
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
	},
	overrides: [
		{
			files: [ '**/test/**/*' ],
			rules: {
				'import/no-extraneous-dependencies': [
					'error',
					{
						devDependencies: true,
						packageDir: [ __dirname, path.join( __dirname, '..' ) ],
					},
				],
				'import/no-nodejs-modules': 'off',
			},
		},
	],
};
