module.exports = {
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
	},
	overrides: [
		{
			files: [ '*.md.jsx', '*.md.js', '*.stories.jsx' ],
			rules: {
				'import/no-extraneous-dependencies': 'off',
			},
		},
		{
			files: [ '**/test/**/*' ],
			rules: {
				'import/no-extraneous-dependencies': [
					'error',
					{ packageDir: [ __dirname, __dirname + '/../..' ] },
				],
				'import/no-nodejs-modules': 'off',
			},
		},
	],
};
