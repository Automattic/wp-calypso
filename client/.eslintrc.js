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
						group: [ '**/*.png', '**/*.jpg', '**/*.jpeg' ],
						message:
							"Please use 'webp' files instead. You can convert using `brew install webp && cwebp -q 90 -alpha_q 85 -m 6 <input>.png -o <output>.webp`",
					},
					{
						group: [ '@testing-library/jest-dom*' ],
						message:
							'@testing-library/jest-dom is already globally provided by our test setup framework.',
					},
					{
						// Deep `lodash/<fn>` imports bypass the named-import guard below.
						group: [
							'lodash/keyBy',
							'lodash/shuffle',
							'lodash/uniqBy',
							'lodash/times',
							'lodash/pick',
							'lodash/omit',
							'lodash/mapValues',
							'lodash/pickBy',
							'lodash/omitBy',
							'lodash/groupBy',
							'lodash/mapKeys',
						],
						message: 'Please use the equivalent from `@automattic/js-utils` instead.',
					},
					{
						// Deep `lodash/<fn>` imports bypass the named-import guard below.
						group: [ 'lodash/flatMap', 'lodash/flatten' ],
						message: 'Please use native `array.flatMap()` / `array.flat()` instead.',
					},
				],
				paths: [
					// Use Redux's `compose` instead of lodash's `flowRight`.
					{
						name: 'lodash',
						importNames: [ 'flowRight' ],
						message: "Please use `compose` from 'redux' instead.",
					},
					// Use the equivalents from `@automattic/js-utils` instead of lodash.
					{
						name: 'lodash',
						importNames: [
							'keyBy',
							'shuffle',
							'uniqBy',
							'times',
							'pick',
							'omit',
							'mapValues',
							'pickBy',
							'omitBy',
							'groupBy',
							'mapKeys',
						],
						message: 'Please use the equivalent from `@automattic/js-utils` instead.',
					},
					// Use native equivalents instead of lodash.
					{
						name: 'lodash',
						importNames: [ 'compact' ],
						message: 'Please use `array.filter( Boolean )` instead of lodash `compact`.',
					},
					{
						name: 'lodash',
						importNames: [ 'flatMap', 'flatten' ],
						message: 'Please use native `array.flatMap()` / `array.flat()` instead.',
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
