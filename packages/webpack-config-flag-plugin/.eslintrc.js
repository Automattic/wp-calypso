module.exports = {
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
		'import/no-nodejs-modules': 0,
	},
	overrides: [
		{
			files: [ '**/fixtures/**/*' ],
			rules: {
				'wpcalypso/no-relative-imports': 'off',
			},
		},
	],
};
