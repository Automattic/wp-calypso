import os from 'node:os';
import path from 'node:path';
import { mergeConfig } from 'vitest/config';
import { CALYPSO_SRC, calypsoBase, root } from './base.mjs';

const setupDir = path.join( import.meta.dirname, 'test-setup' );

/** @returns {import('vitest/config').ViteUserConfig} */
export function testOverlay() {
	return {
		cacheDir: path.join( root, '.cache/vitest' ),
		resolve: {
			conditions: [ CALYPSO_SRC, 'browser', 'development' ],
			mainFields: [ 'module', 'main' ],
			alias: [
				{
					find: /^@automattic\/calypso-config$/,
					replacement: path.join( setupDir, 'calypso-config.ts' ),
				},
				// Externalized, the CJS browser build `require()`s @emotion/react through Node, loading a
				// second copy with its own ThemeContext. The ESM build imports it through Vite.
				{
					find: /^@emotion\/styled$/,
					replacement: path.join(
						root,
						'node_modules/@emotion/styled/dist/emotion-styled.browser.development.esm.js'
					),
				},
				{
					find: /^@mswjs\/interceptors\/presets\/node$/,
					replacement: path.join(
						root,
						'packages/calypso-jest/src/mswjs-interceptors-node-preset.js'
					),
				},
			],
		},
		ssr: {
			// The vm pools hand these to Vitest's CommonJS executor as `--conditions` flags.
			resolve: { conditions: [ CALYPSO_SRC, 'node', 'development' ] },
		},
		test: {
			environment: 'node',
			environmentOptions: { jsdom: { url: 'https://example.com' } },
			globals: true,
			// The pool, memory limit and worker count were found in testing to make the suite faster.
			pool: 'vmForks',
			vmMemoryLimit: '1.5GB',
			maxWorkers: Math.max( 2, Math.round( os.availableParallelism() * 1.5 ) ),
			setupFiles: [ path.join( setupDir, 'setup-globals.ts' ) ],
			taskTitleValueFormatTruncate: 0,
			server: {
				deps: {
					// user-event must share RTL's copy of @testing-library/dom (the ESM build Vite resolves).
					inline: [ 'nock', '@testing-library/user-event' ],
				},
			},
		},
	};
}

export function calypsoTestConfig( project ) {
	return mergeConfig( mergeConfig( calypsoBase(), testOverlay() ), project );
}
