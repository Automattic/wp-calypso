// PROTOTYPE (DOTMSD-1675): Vitest overlay, shared by the Dashboard, client/ and package test
// configs. Mirrors what calypso-jest's preset gives Jest. Throwaway.
import os from 'node:os';
import path from 'node:path';
import { mergeConfig } from 'vitest/config';
import { CALYPSO_SRC, calypsoBase, root } from './base.mjs';

const here = path.join( import.meta.dirname, 'test' );

// Jest's jsdom environment matches the `browser` export condition but never the `browser` field in
// package.json, so `calypso/lib/wp` and superagent stay on their Node builds. Vite's client default
// adds `module`, which Jest doesn't match either.
export const testConditions = [ CALYPSO_SRC, 'browser', 'development' ];
// Vitest hands these to the vm pools' CommonJS executor as `--conditions` flags.
export const testServerConditions = ( process.env.PROTOTYPE_SSR_CONDITIONS ?? `${ CALYPSO_SRC },node,development` )
	.split( ',' )
	.filter( Boolean );

/** @returns {import('vitest/config').ViteUserConfig} */
export function testOverlay() {
	return {
		cacheDir: path.join( root, '.cache/vitest' ),
		resolve: {
			conditions: testConditions,
			mainFields: [ 'module', 'main' ],
			alias: [
				{
					find: /^@automattic\/calypso-config$/,
					replacement: path.join( here, 'calypso-config.ts' ),
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
					replacement: path.join( root, 'packages/calypso-jest/src/mswjs-interceptors-node-preset.js' ),
				},
			],
		},
		ssr: {
			resolve: { conditions: testServerConditions },
		},
		test: {
			environment: 'node',
			environmentOptions: { jsdom: { url: 'https://example.com' } },
			globals: true,
			pool: 'vmForks',
			vmMemoryLimit: '1.5GB',
			maxWorkers: Math.max( 2, Math.round( os.availableParallelism() * 1.5 ) ),
			setupFiles: [ path.join( here, 'vitest-setup-globals.ts' ) ],
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
