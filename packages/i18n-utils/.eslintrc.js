module.exports = {
	rules: {
		'no-restricted-imports': [
			'warn',
			{
				paths: [
					{
						name: 'lodash',
						message: 'Please use native JavaScript instead of lodash in this package.',
					},
				],
				patterns: [
					{
						group: [ 'lodash/*' ],
						message: 'Please use native JavaScript instead of lodash in this package.',
					},
				],
			},
		],
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
