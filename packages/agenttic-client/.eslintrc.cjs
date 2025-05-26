module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [ '@typescript-eslint' ],
	extends: [
		'plugin:@wordpress/eslint-plugin/recommended',
		'@typescript-eslint/recommended',
	],
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
		project: './tsconfig.json',
	},
	settings: {
		jsdoc: {
			mode: 'typescript',
		},
	},
	rules: {
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ argsIgnorePattern: '^_' },
		],
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'warn',
		// WordPress specific overrides for TypeScript projects
		camelcase: 'off',
		'@wordpress/dependency-group': 'off',
		'@wordpress/no-unsafe-wp-apis': 'off',
	},
	env: {
		node: true,
		es2022: true,
	},
};
