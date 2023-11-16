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
				// We use jest-runner-groups to run spec suites, and these involve a custom doc header tag.
				'jsdoc/check-tag-names': [ 'error', { definedTags: [ 'group', 'browser' ] } ],
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

		// The rule hasn't had the intended results (encouraging owners to re-enable and fix their tests).
		// See GitHub issue #64870 for context (https://github.com/Automattic/wp-calypso/issues/64870).
		'jest/no-disabled-tests': 'off',

		'jsdoc/tag-lines': [ 'off' ],
	},
};
