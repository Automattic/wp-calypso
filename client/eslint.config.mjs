import path from 'node:path';
import calypso, {
	browserGlobals,
	nodeConfig,
	restrictedImports,
} from '@automattic/calypso-eslint-config';
import vitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';
import jest from 'eslint-plugin-jest';
import { eslintFiles, eslintIgnores } from '../test/client/vitest-directories.js';

const [ , { patterns } ] = restrictedImports;

export default defineConfig(
	[
		...calypso( import.meta.dirname ),
		{
			name: 'calypso/client',
			// Allow fetch api function usage (and similar)
			languageOptions: { globals: browserGlobals },
			rules: {
				// We have lots of "fake" packages (directories with a package.json that don't declare dependencies),
				// we need to configure this rule to look into this directory's node_modules, otherwise it will stop
				// looking up when it finds a package.json
				'import/no-extraneous-dependencies': [
					'error',
					{ packageDir: [ import.meta.dirname, path.join( import.meta.dirname, '..' ) ] },
				],
				// No need to import @testing-library/jest-dom - it is already globally provided by our test setup framework.
				'no-restricted-imports': [
					'error',
					{
						patterns: [
							...patterns,
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
		},
		{ ...nodeConfig, files: [ 'webpack.*.js', 'server/**', '**/test/**' ] },
		// ESLint rejects an empty `files`.
		...( eslintFiles.length
			? [
					{
						name: 'calypso/client/vitest',
						files: eslintFiles,
						ignores: eslintIgnores,
						plugins: { vitest },
						rules: {
							...Object.fromEntries(
								Object.keys( jest.rules ).map( ( rule ) => [ `jest/${ rule }`, 'off' ] )
							),
							...vitest.configs.recommended.rules,
							'vitest/no-mocks-import': 'off',
							'no-restricted-globals': [
								'error',
								{
									name: 'jest',
									message:
										'These tests run on Vitest (see test/client/vitest-directories.js). Use `vi` from `vitest` instead.',
								},
							],
						},
					},
				]
			: [] ),
		{
			files: [ '**/docs/example.jsx' ],
			rules: {
				// We use a log of console.log() in examples.
				'no-console': 'off',
			},
		},
		{
			files: [ '**/*.stories.{ts,tsx}' ],
			rules: {
				'import/no-extraneous-dependencies': 'off',
			},
		},
	].map(
		// Directories below build on this config: keep its patterns relative to this directory.
		( entry ) => ( { basePath: import.meta.dirname, ...entry } )
	)
);
