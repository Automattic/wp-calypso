const nodeConfig = require( '@automattic/calypso-eslint-overrides/node' );

module.exports = {
	...nodeConfig,
	env: {
		...nodeConfig.env,
		mocha: false,
	},
	overrides: [
		{
			plugins: [ 'mocha' ],
			files: [ 'specs/jetpack/*', 'specs/wpcom-old/*', 'lib/mocha-hooks.js' ],
			rules: {
				'mocha/no-exclusive-tests': 'error',
				'mocha/handle-done-callback': [ 'error', { ignoreSkipped: true } ],
				'mocha/no-global-tests': 'error',
				'mocha/no-async-describe': 'error',
				'mocha/no-top-level-hooks': 'error',
				'mocha/max-top-level-suites': [ 'error', { limit: 1 } ],
				// Disable all rules from "plugin:jest/recommended", as e2e tests use mocha
				...Object.keys( require( 'eslint-plugin-jest' ).configs.recommended.rules ).reduce(
					( disabledRules, key ) => ( { ...disabledRules, [ key ]: 'off' } ),
					{}
				),
			},
			env: {
				mocha: true,
			},
			globals: {
				step: false,
			},
		},
		{
			files: [ 'specs/**/*' ],
			rules: {
				// We use jest-runner-groups to run spec suites, and these involve a custom doc header tag.
				'jsdoc/check-tag-names': [ 'error', { definedTags: [ 'group' ] } ],
				'jest/no-standalone-expect': [ 'error', { additionalTestBlockFunctions: [ 'skipItIf' ] } ],
			},
		},
		{
			files: [ 'specs/**/shared/**/*', 'lib/shared-steps/**/*' ],
			rules: {
				// This directory is used to create shared specs that can be re-used in multiple places.
				'jest/no-export': 'off',
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

		// We have many tests that don't make an explicit `expect`, but instead puts the browser
		// in certain state that will be used by the next test, or asserted by WebDriver
		'jest/expect-expect': 'off',

		// We compose the test titles dynamically
		'jest/valid-title': 'off',
	},
};
