const path = require( 'path' );
const { nodeConfig } = require( '@automattic/calypso-eslint-overrides' );

module.exports = {
	// Allow fetch api function usage (and similar)
	env: { browser: true },
	rules: {
		// We have lots of "fake" packages (directories with a package.json that don't declare dependencies),
		// we need to configure this rule to look into __dirname/node_modules, otherwise it will stop
		// looking up when it finds a package.json
		'import/no-extraneous-dependencies': [
			'error',
			{ packageDir: [ __dirname, path.join( __dirname, '..' ) ] },
		],
		// No need to import @testing-library/jest-dom - it is already globally provided by our test setup framework.
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: [ '@testing-library/jest-dom*' ],
						message:
							'@testing-library/jest-dom is already globally provided by our test setup framework.',
					},
				],
			},
		],
		'jest/no-mocks-import': 'off',
		'no-restricted-syntax': [
			'error',
			{
				selector: [
					'CallExpression[callee.name="useSelector"][arguments.length=1] > ArrowFunctionExpression > :matches(ObjectExpression, ArrayExpression)',
					'CallExpression[callee.name="useSelector"][arguments.length=1] > ArrowFunctionExpression > BlockStatement > ReturnStatement > :matches(ObjectExpression, ArrayExpression)',
				].join(),
				message:
					'Object return values cause unnecessary re-renders. Use separate useSelector calls instead, or pass equalityFn to useSelector.',
			},
		],
	},
	overrides: [
		{
			files: [ './webpack.*.js', './server/**/*', '**/test/**/*' ],
			...nodeConfig,
		},
		{
			files: [ './**/docs/example.jsx' ],
			rules: {
				// We use a log of console.log() in examples.
				'no-console': 'off',
			},
		},
		{
			files: [ '**/*.stories.tsx' ],
			rules: {
				'import/no-extraneous-dependencies': 'off',
			},
		},
	],
};
