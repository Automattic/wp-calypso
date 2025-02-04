module.exports = {
	rules: {
		'import/order': 'off', // Disable import order rule
		'import/no-nodejs-modules': 'off', // Disable node modules import rule
		'jest/no-conditional-expect': 'off', // Disable conditional expect rule in Jest
		'jest/no-jasmine-globals': 'off', // Disable Jasmine globals rule
		'jest/no-done-callback': 'off', // Disable done callback rule in Jest
		'jest/expect-expect': 'off', // Disable expect expect rule in Jest
		'jsdoc/check-tag-names': 'off', // Disable JSDoc tag name checks
		'no-else-return': 'off', // Disable no-else-return rule
		'no-lonely-if': 'off', // Disable no-lonely-if rule
		'jsdoc/empty-tags': 'off', // Disable empty JSDoc tags rule
		'json-es/no-comments': 'off', // Disable comments in JSON files
		'inclusive-language/use-inclusive-words': 'off', // Disable inclusive language rules
		'jsdoc/tag-lines': 'off', // Disable JSDoc tag lines
		'md/remark': 'off', // Disable specific markdown linting rules
		'prettier/prettier': [
			// Disable Prettier rules for markdown files
			'off',
			{
				files: [ '*.md', '*.json' ],
			},
		],
	},
	overrides: [
		{
			files: [ '**/*.md' ],
			rules: {
				// Disable all ESLint rules for Markdown files
				'no-unreachable': 'off',
				'no-constant-condition': 'off',
				'no-cond-assign': 'off',
				'prettier/prettier': 'off',
				'md/remark': 'off',
			},
		},
		{
			files: [ '**/*.json' ],
			rules: {
				'json-es/no-comments': 'off', // Allow comments in JSON files
			},
		},
		{
			files: [ '**/*.ts' ],
			rules: {
				'jsdoc/tag-lines': 'off', // Disable JSDoc tag lines in TypeScript files
				'inclusive-language/use-inclusive-words': 'off', // Disable inclusive language rules in TypeScript files
			},
		},
	],
};
