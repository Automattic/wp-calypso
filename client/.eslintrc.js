module.exports = {
	rules: {
		'import/no-extraneous-dependencies': [
			'error',
			{ packageDir: [ __dirname, __dirname + '/..' ] },
		],
	},
	overrides: [
		{
			files: [ '**/test/**/*' ],
			rules: {
				'import/no-nodejs-modules': 'off',
			},
		},
	],
};
