module.exports = {
	overrides: [
		{
			files: [ '**/test/**/*' ],
			rules: {
				'import/no-nodejs-modules': 'off',
			},
		},
	],
};
