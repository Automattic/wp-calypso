import calypso, { nodeConfig } from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{
		...nodeConfig,
		name: 'calypso/e2e',
		rules: {
			...nodeConfig.rules,

			'jsdoc/tag-lines': [ 'off' ],
			// Playwright fixtures name their callback `use`, which this rule mistakes for React's `use` hook.
			'react-hooks/rules-of-hooks': 'off',
		},
	},
	{
		files: [ 'specs/**' ],
		rules: {
			// Specs that create a test account (getNewTestUser + a signup helper) must register
			// an afterAll apiCloseAccount teardown, or the account and its blogs leak. Opt out
			// via `allow` only with justification.
			'wpcalypso/e2e-require-account-teardown': [ 'error', { allow: [] } ],
		},
	},
	{
		files: [ 'specs/**/*.spec.ts' ],
		extends: [ playwright.configs[ 'flat/recommended' ] ],
		rules: {
			// Specs frequently leave the browser in a state asserted by a later
			// step rather than making an explicit top-level expect().
			'playwright/expect-expect': 'off',
			// Test titles are composed dynamically.
			'playwright/valid-title': 'off',
		},
	},
] );
