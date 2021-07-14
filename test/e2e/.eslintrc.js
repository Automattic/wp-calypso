module.exports = {
	env: {
		node: true,
		mocha: false,
	},
	overrides: [
		{
			plugins: [ 'mocha' ],
			files: [
				'test/e2e/specs/specs-jetpack/*',
				'test/e2e/specs/specs-calypso/*',
				'test/e2e/specs/specs-wpcom/*',
			],
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
			globals: {
				step: false,
			},
			env: {
				mocha: true,
			},
		},
	],
	rules: {
		'import/no-nodejs-modules': 'off',
		'no-console': 'off',

		// We have many tests that don't make an explicit `expect`, but instead puts the browser
		// in certain state that will be used by the next test, or asserted by WebDriver
		'jest/expect-expect': 'off',

		// We compose the test titles dynamically
		'jest/valid-title': 'off',
	},
};
