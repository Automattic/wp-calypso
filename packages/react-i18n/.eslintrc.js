module.exports = {
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
	},
	overrides: [
		{
			files: [ '*.md.js' ],
			rules: {
				'import/no-extraneous-dependencies': 'off',
			},
		},
	],
};
