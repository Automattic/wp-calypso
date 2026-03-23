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
		// The no-conditional-expect rule is disabled for the same reason as
		// no-conditional-in-test: E2E tests legitimately use conditional expects
		// to handle environment variations (Atomic/Simple/Private), viewports,
		// and locale-specific assertions.
		'playwright/no-conditional-expect': 'off',
		// Allow conditional test.skip() calls (e.g. test.skip(condition, reason))
		// while still flagging unconditional skips.
		'playwright/no-skipped-test': [ 'warn', { allowConditional: true } ],

		'jsdoc/tag-lines': [ 'off' ],
	},
};
