// PROTOTYPE (DOTMSD-1656): Vitest config for the Dashboard tests, mirroring the `dashboard`
// project in test/client/jest.config.js. Throwaway; not for merging as-is.
import path from 'node:path';
import { defineConfig } from 'vitest/config';

const root = path.resolve( import.meta.dirname, '../..' );
const client = path.join( root, 'client' );

process.env.TZ = 'UTC';

export default defineConfig( {
	root: client,
	cacheDir: path.join( root, '.cache/vitest' ),
	oxc: {
		jsx: { runtime: 'automatic', importSource: '@emotion/react' },
	},
	define: {
		__i18n_text_domain__: JSON.stringify( 'default' ),
	},
	resolve: {
		// Jest's jsdom env matches the `browser` export condition but never the `browser` field in
		// package.json, so `calypso/lib/wp` and superagent stay on their Node builds.
		conditions: [ 'calypso:src', 'browser', 'development' ],
		mainFields: [ 'module', 'main' ],
		alias: [
			{
				find: /^@automattic\/calypso-config$/,
				replacement: path.join( client, 'server/config/index.js' ),
			},
			// Externalized, the CJS browser build `require()`s @emotion/react through Node (no `browser`
			// condition), loading a second copy with its own ThemeContext. The ESM build imports it via Vite.
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
		resolve: {
			conditions: [ 'calypso:src', 'node', 'development' ],
		},
	},
	test: {
		include: [ 'dashboard/**/test/*.test.{js,jsx,ts,tsx}' ],
		environment: 'node',
		environmentOptions: {
			jsdom: { url: 'https://example.com' },
		},
		globals: true,
		setupFiles: [ path.join( root, 'test/dashboard/vitest-setup.ts' ) ],
		deps: {
			optimizer: { client: { enabled: !! process.env.VITEST_OPTIMIZE } },
		},
		server: {
			deps: {
				// user-event must share RTL's copy of @testing-library/dom (the ESM build Vite resolves);
				// externalized, Node gives it the CJS build, which RTL never configures with act().
				inline: [ 'nock', '@testing-library/user-event' ],
			},
		},
	},
} );
