import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { transformWithOxc } from 'vite';
import { defineConfig } from 'vitest/config';

const root = path.resolve( import.meta.dirname, '../..' );
const client = path.join( root, 'client' );
const main = root;
process.env.TZ = 'UTC';

const list = process.env.SLICE ? fs.readFileSync( process.env.SLICE, 'utf8' ).trim().split( '\n' ).map( ( f ) => f.replace( /^client\//, '' ) ) : [ '**/test/*.{js,jsx,ts,tsx}' ];

// Jest's asset transform: export the file's basename.
const assetBasename = {
	name: 'asset-basename',
	enforce: 'pre' as const,
	load( id: string ) {
		const file = id.split( '?' )[ 0 ];
		if ( /\.(gif|jpe?g|png|svg|webp|mp4)$/.test( file ) && ! file.includes( '/node_modules/' ) ) {
			return `export default ${ JSON.stringify( path.basename( file ) ) };`;
		}
	},
};

// Calypso has JSX in .js files; oxc only enables JSX for .jsx/.tsx.
const jsxInJs = {
	name: 'jsx-in-js',
	enforce: 'pre' as const,
	async transform( code: string, id: string ) {
		if ( ! /\.js$/.test( id ) || id.includes( '/node_modules/' ) ) return;
		return transformWithOxc( code, id, { lang: 'jsx', jsx: { runtime: 'automatic', importSource: '@emotion/react' } } );
	},
};

export default defineConfig( {
	root: client,
	cacheDir: path.join( root, '.cache/vitest' ),
	plugins: [ assetBasename, jsxInJs ],
	oxc: {
		include: /\.(m?ts|[jt]sx)$/,
		exclude: /node_modules/,
		jsx: { runtime: 'automatic', importSource: '@emotion/react' },
	},
	define: {
		__i18n_text_domain__: JSON.stringify( 'default' ),
	},
	resolve: {
		conditions: [ 'calypso:src', 'browser', 'development' ],
		mainFields: [ 'module', 'main' ],
		alias: [
			{ find: /^@automattic\/calypso-config$/, replacement: path.join( import.meta.dirname, 'calypso-config.ts' ) },
			{ find: /^@emotion\/styled$/, replacement: path.join( main, 'node_modules/@emotion/styled/dist/emotion-styled.browser.development.esm.js' ) },
			{ find: /^@mswjs\/interceptors\/presets\/node$/, replacement: path.join( main, 'packages/calypso-jest/src/mswjs-interceptors-node-preset.js' ) },
			{ find: /^react-router$/, replacement: path.join( main, 'node_modules/react-router/dist/development/index.mjs' ) },
			{ find: /^react-router-dom$/, replacement: path.join( main, 'node_modules/react-router-dom/dist/index.mjs' ) },
			{ find: /^calypso\//, replacement: client + '/' },
			{ find: /^react-markdown$/, replacement: path.join( client, 'node_modules/react-markdown/react-markdown.min.js' ) },
		],
	},
	ssr: { resolve: { conditions: [ 'calypso:src', 'node', 'module-sync', 'development' ] } },
	test: {
		include: list,
		exclude: [ 'dashboard/**', 'server/**', '**/node_modules/**' ],
		environment: 'node',
		environmentOptions: { jsdom: { url: 'https://example.com' } },
		globals: true,
		clearMocks: process.env.CLEAR_MOCKS === '1',
		pool: ( process.env.POOL as any ) || 'vmForks',
		vmMemoryLimit: '1.5GB',
		maxWorkers: Math.max( 2, Math.round( os.availableParallelism() * 1.5 ) ),
		snapshotFormat: { escapeString: true, printBasicPrototype: true },
		setupFiles: [ path.join( import.meta.dirname, 'vitest-setup-globals.ts' ), path.join( import.meta.dirname, 'vitest-setup.ts' ) ],
		server: { deps: { inline: [ 'nock', '@testing-library/user-event', 'react-router', 'react-router-dom' ] } },
	},
} );
