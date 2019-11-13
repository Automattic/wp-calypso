module.exports = {
	env: {
		es6: true,
	},
	parser: 'babel-eslint',
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	extends: [ 'eslint:recommended', 'plugin:jsdoc/recommended' ],
	plugins: [ 'jsdoc', 'wpcalypso' ],
	rules: {
		'array-bracket-spacing': [ 2, 'always' ],
		'brace-style': [ 2, '1tbs' ],
		camelcase: 2,
		'comma-dangle': [ 2, 'always-multiline' ],
		'comma-spacing': 2,
		'comma-style': 2,
		'computed-property-spacing': [ 2, 'always' ],
		'constructor-super': 2,
		// Allows returning early as undefined
		'consistent-return': 0,
		curly: 2,
		'dot-notation': 2,
		eqeqeq: [ 2, 'allow-null' ],
		'eol-last': 2,
		'func-call-spacing': 2,
		indent: [ 2, 'tab', { SwitchCase: 1 } ],
		'jsx-quotes': [ 2, 'prefer-double' ],
		'key-spacing': 2,
		'keyword-spacing': 2,
		'max-len': [ 2, { code: 100 } ],
		'new-cap': [ 2, { capIsNew: false, newIsCap: true } ],
		'no-cond-assign': 2,
		'no-const-assign': 2,
		'no-console': 2,
		'no-debugger': 2,
		'no-dupe-args': 2,
		'no-dupe-keys': 2,
		'no-duplicate-case': 2,
		'no-duplicate-imports': 2,
		'no-else-return': 2,
		'no-empty': [ 2, { allowEmptyCatch: true } ],
		'no-extra-semi': 2,
		'no-fallthrough': 0,
		'no-lonely-if': 2,
		'no-mixed-requires': 0,
		'no-mixed-spaces-and-tabs': 2,
		'no-multiple-empty-lines': [ 2, { max: 1 } ],
		'no-multi-spaces': 2,
		'no-negated-in-lhs': 2,
		'no-nested-ternary': 2,
		'no-new': 2,
		'no-process-exit': 2,
		'no-redeclare': 2,
		'no-shadow': 2,
		'no-spaced-func': 2,
		'no-trailing-spaces': 2,
		'no-undef': 2,
		'no-underscore-dangle': 0,
		'no-unreachable': 2,
		// Ignore rest siblings used to omit properties from objects: const { a, b, ...rest } = props
		'no-unused-vars': [ 2, { ignoreRestSiblings: true } ],
		// Allows function use before declaration
		'no-use-before-define': [ 2, 'nofunc' ],
		'no-var': 2,
		'object-curly-spacing': [ 2, 'always' ],
		'one-var': 0,
		'operator-linebreak': [
			2,
			'after',
			{
				overrides: {
					'?': 'before',
					':': 'before',
				},
			},
		],
		'padded-blocks': [ 2, 'never' ],
		'prefer-const': 2,
		'quote-props': [ 2, 'as-needed' ],
		quotes: [ 2, 'single', 'avoid-escape' ],
		semi: 2,
		'semi-spacing': 2,
		'space-before-blocks': [ 2, 'always' ],
		'space-before-function-paren': [
			'error',
			{
				anonymous: 'never',
				asyncArrow: 'always',
				named: 'never',
			},
		],
		'space-in-parens': [ 2, 'always' ],
		'space-infix-ops': [ 2, { int32Hint: false } ],
		'space-unary-ops': [
			2,
			{
				overrides: {
					'!': true,
				},
			},
		],
		// Assumed by default with Babel
		strict: [ 2, 'never' ],
		'template-curly-spacing': [ 2, 'always' ],

		// jsdoc plugin
		'jsdoc/check-access': 2,
		'jsdoc/check-alignment': 2,
		'jsdoc/check-param-names': 2,
		'jsdoc/check-tag-names': 0,
		'jsdoc/check-types': 2,
		'jsdoc/check-values': 2,
		'jsdoc/empty-tags': 2,
		'jsdoc/implements-on-classes': 2,
		'jsdoc/newline-after-description': 2,
		'jsdoc/no-undefined-types': 2,
		'jsdoc/require-jsdoc': 0,
		'jsdoc/require-param': 2,
		'jsdoc/require-param-description': 2,
		'jsdoc/require-param-name': 2,
		'jsdoc/require-param-type': 0,
		'jsdoc/require-returns': 0,
		'jsdoc/require-returns-check': 2,
		'jsdoc/require-returns-description': 2,
		'jsdoc/require-returns-type': 0,
		'jsdoc/valid-types': 0,

		// wpcalypso plugin
		'wpcalypso/i18n-ellipsis': 2,
		'wpcalypso/i18n-no-collapsible-whitespace': 2,
		'wpcalypso/i18n-no-variables': 2,
		'wpcalypso/i18n-no-placeholders-only': 2,
		'wpcalypso/i18n-no-this-translate': 2,
		'wpcalypso/i18n-mismatched-placeholders': 2,
		'wpcalypso/i18n-named-placeholders': 2,
		'wpcalypso/import-docblock': 2,
		'wpcalypso/jsx-gridicon-size': 2,
		'wpcalypso/jsx-classname-namespace': 2,
		'wpcalypso/redux-no-bound-selectors': 2,
		yoda: 0,
	},
};
