module.exports = {
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
		'import/no-nodejs-modules': 0,
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
