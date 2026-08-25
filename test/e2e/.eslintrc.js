const nodeConfig = require( '@automattic/calypso-eslint-overrides/node' );

module.exports = {
	...nodeConfig,
	env: {
		...nodeConfig.env,
	},
	overrides: [
		{
			files: [ 'specs/**/*' ],
			rules: {
				// Specs that create a test account (getNewTestUser + a signup helper) must register
				// an afterAll apiCloseAccount teardown, or the account and its blogs leak. Opt out
				// via `allow` only with justification.
				'wpcalypso/e2e-require-account-teardown': [ 'error', { allow: [] } ],
			},
		},
		{
			files: [ 'specs/**/*.spec.ts' ],
			extends: [ 'plugin:playwright/recommended' ],
			rules: {
				// Specs frequently leave the browser in a state asserted by a later
				// step rather than making an explicit top-level expect().
				'playwright/expect-expect': 'off',
				// Test titles are composed dynamically.
				'playwright/valid-title': 'off',
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

		'jsdoc/tag-lines': [ 'off' ],
	},
};
