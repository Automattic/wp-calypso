module.exports = {
	root: true,
	'extends': 'wpcalypso/react',
	parser: 'babel-eslint',
	env: {
		browser: true,
		mocha: true,
		node: true
	},
	globals: {
		asyncRequire: true
	},
	// Ideally, we should not have a `rules` block here at all, save for some
	// Calypso-specific rules (no-unused-expressions, camelcase). The remainder
	// are rules we cannot yet flag as errors, and should be removed over time
	// as outstanding issues are resolved.
	rules: {
		'brace-style': [ 1, '1tbs' ],
		// REST API objects include underscores
		camelcase: 0,
		'comma-spacing': 1,
		curly: 1,
		'computed-property-spacing': [ 1, 'always' ],
		'func-call-spacing': 1,
		indent: [ 1, 'tab', { SwitchCase: 1 } ],
		'jsx-quotes': [ 1, 'prefer-double' ],
		'key-spacing': 1,
		'keyword-spacing': 1,
		'max-len': [ 1, { code: 140 } ],
		'new-cap': [ 1, { capIsNew: false, newIsCap: true } ],
		'no-else-return': 1,
		'no-extra-semi': 1,
		'no-multiple-empty-lines': [ 1, { max: 1 } ],
		'no-multi-spaces': 1,
		'no-restricted-imports': [ 1, 'lib/sites-list', 'lib/mixins/data-observe' ],
		'no-restricted-modules': [ 1, 'lib/sites-list', 'lib/mixins/data-observe' ],
		'no-shadow': 1,
		'no-spaced-func': 1,
		'no-trailing-spaces': 1,
		// Allows Chai `expect` expressions
		'no-unused-expressions': 0,
		'no-var': 1,
		'object-curly-spacing': [ 1, 'always' ],
		'operator-linebreak': [ 1, 'after', { overrides: {
			'?': 'before',
			':': 'before'
		} } ],
		'padded-blocks': [ 1, 'never' ],
		'prefer-const': 1,
		'quote-props': [ 1, 'as-needed', { keywords: true } ],
		quotes: [ 1, 'single', 'avoid-escape' ],
		'react/jsx-curly-spacing': [ 1, 'always' ],
		'react/jsx-no-bind': 1,
		'react/jsx-space-before-closing': 1,
		'react/no-did-mount-set-state': 1,
		'react/no-did-update-set-state': 1,
		'react/no-is-mounted': 1,
		'react/prefer-es6-class': 1,
		semi: 1,
		'semi-spacing': 1,
		'space-before-blocks': [ 1, 'always' ],
		'space-before-function-paren': [ 1, 'never' ],
		'space-in-parens': [ 1, 'always' ],
		'space-infix-ops': [ 1, { int32Hint: false } ],
		'space-unary-ops': [ 1, {
			overrides: {
				'!': true
			}
		} ],
		'template-curly-spacing': [ 1, 'always' ],
		'valid-jsdoc': [ 1, { requireReturn: false } ],
		'wpcalypso/i18n-ellipsis': 1,
		'wpcalypso/i18n-no-collapsible-whitespace': 1,
		'wpcalypso/i18n-no-this-translate': 1,
		'wpcalypso/i18n-no-variables': 1,
		'wpcalypso/i18n-mismatched-placeholders': 1,
		'wpcalypso/import-docblock': 1,
		'wpcalypso/jsx-gridicon-size': 1,
		'wpcalypso/jsx-classname-namespace': 1,
	}
};
