module.exports = {
	overrides: [
		{
			files: [ '*.md.js' ],
			rules: {
				'import/no-extraneous-dependencies': 'off',
			},
		},
	],
};
