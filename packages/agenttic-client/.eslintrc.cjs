module.exports = {
	extends: ['plugin:@wordpress/eslint-plugin/recommended'],
	settings: {
		jsdoc: {
			mode: 'typescript',
		},
		'import/resolver': {
			typescript: {
				project: './tsconfig.json',
			},
			node: {},
		},
	},
	rules: {
		// Allow console statements in CLI tools
		'no-console': 'off',
		// WordPress specific overrides for TypeScript projects
		camelcase: 'off',
		'@wordpress/dependency-group': 'off',
		'@wordpress/no-unsafe-wp-apis': 'off',
		// JSDoc overrides for this package
		'jsdoc/check-tag-names': 'off',
		'jsdoc/require-param': 'off',
	},
};
