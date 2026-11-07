// PROTOTYPE (DOTMSD-1675): client/ tests on the shared Vite base + test overlay, checked against the
// DOTMSD-1673 slice. Throwaway.
import fs from 'node:fs';
import path from 'node:path';
import { transformWithOxc } from 'vite';
import { calypsoTestConfig } from '../../build-tools/vite/test.mjs';

const root = path.resolve( import.meta.dirname, '../..' );
const client = path.join( root, 'client' );
process.env.TZ = 'UTC';

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

// Babel parses JSX in .js; Oxc only for .jsx/.tsx, whatever `oxc.include` says.
const jsxInJs = {
	name: 'jsx-in-js',
	enforce: 'pre' as const,
	async transform( code: string, id: string ) {
		if ( ! /\.js$/.test( id ) || id.includes( '/node_modules/' ) || ! /<[A-Za-z>]/.test( code ) ) {
			return;
		}
		return transformWithOxc( code, id, {
			lang: 'jsx',
			jsx: { runtime: 'automatic', importSource: '@emotion/react' },
		} );
	},
};

const slice = process.env.SLICE
	? fs.readFileSync( process.env.SLICE, 'utf8' ).trim().split( '\n' ).map( ( f ) => f.replace( /^client\//, '' ) )
	: [ '**/test/*.{js,jsx,ts,tsx}' ];

export default calypsoTestConfig( {
	root: client,
	plugins: [ assetBasename, jsxInJs ],
	resolve: {
		alias: [
			{ find: /^react-router$/, replacement: path.join( root, 'node_modules/react-router/dist/development/index.mjs' ) },
			{ find: /^react-router-dom$/, replacement: path.join( root, 'node_modules/react-router-dom/dist/index.mjs' ) },
			{ find: /^react-markdown$/, replacement: path.join( client, 'node_modules/react-markdown/react-markdown.min.js' ) },
		],
	},
	test: {
		include: slice,
		exclude: [ 'dashboard/**', 'server/**', '**/node_modules/**' ],
		snapshotFormat: { escapeString: true, printBasicPrototype: true },
		setupFiles: [ path.join( root, 'tmp/dotmsd-1673/configs/vitest-setup.ts' ) ],
		server: { deps: { inline: [ 'react-router', 'react-router-dom' ] } },
	},
} );
