const nodeConfig = require( '@automattic/calypso-eslint-overrides/node' );

module.exports = {
	...nodeConfig,
	plugins: [ 'playwright' ],
	env: {
		...nodeConfig.env,
	},
	extends: [ 'plugin:playwright/recommended' ],
	overrides: [
		{
			files: [ 'specs/**/*' ],
			rules: {
				'jsdoc/check-tag-names': [ 'error', { definedTags: [ 'group', 'browser' ] } ],
			},
		},
		{
			files: [ 'docs/tests_local.md' ],
			rules: {
				'lint-no-multiple-toplevel-headings': 'off',
			},
		},
	],
	rules: {
		...nodeConfig.rules,

		// Many tests put the browser in a certain state without an explicit expect.
		'playwright/expect-expect': 'off',
		// We compose test titles dynamically.
		'playwright/valid-title': 'off',
		// The no-conditional-in-test rule is disabled because E2E tests legitimately
		// use conditionals to handle multiple environments (Atomic/Simple/Private),
		// viewports (mobile/desktop), non-deterministic UI flows, and runtime
		// feature flags.
		'playwright/no-conditional-in-test': 'off',

		'jsdoc/tag-lines': [ 'off' ],
	},
};
