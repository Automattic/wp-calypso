import path from 'node:path';
import { transformWithOxc, type Plugin } from 'vite';
import { calypsoTestConfig } from '../../build-tools/vite/test.mjs';
import { vitestExclude, vitestInclude } from './vitest-directories.js';

process.env.TZ = 'UTC';

const root = path.resolve( import.meta.dirname, '../..' );
const client = path.join( root, 'client' );
const jsonValidMock = path.join( client, '__mocks__/is-my-json-valid.js' );

const plugins: Plugin[] = [
	{
		// Matches Jest's asset transform, which exports the file's basename.
		name: 'asset-basename',
		enforce: 'pre',
		load( id ) {
			const file = id.split( '?' )[ 0 ];
			if ( /\.(gif|jpe?g|png|svg|webp|mp4)$/.test( file ) && ! file.includes( '/node_modules/' ) ) {
				return `export default ${ JSON.stringify( path.basename( file ) ) };`;
			}
		},
	},
	{
		// Babel parses JSX in `.js` files. Oxc only does for `.jsx` and `.tsx`, whatever
		// `oxc.include` says.
		name: 'jsx-in-js',
		enforce: 'pre',
		async transform( code, id ) {
			if (
				! id.endsWith( '.js' ) ||
				id.includes( '/node_modules/' ) ||
				! /<[A-Za-z>]/.test( code )
			) {
				return;
			}
			return transformWithOxc( code, id, {
				lang: 'jsx',
				jsx: { runtime: 'automatic', importSource: '@emotion/react' },
			} );
		},
	},
	{
		// Jest picks up `client/__mocks__` for node modules by itself. The mock imports the real
		// module, so it can't be an alias.
		name: 'is-my-json-valid-mock',
		enforce: 'pre',
		resolveId( source, importer ) {
			if ( source === 'is-my-json-valid' && importer !== jsonValidMock ) {
				return jsonValidMock;
			}
		},
	},
];

export default calypsoTestConfig( {
	root: client,
	plugins,
	resolve: {
		alias: [
			// agenttic-client has no `calypso:src` export, and CI doesn't build it before the tests.
			{
				find: /^@automattic\/agenttic-client$/,
				replacement: path.join( root, 'packages/agenttic-client/src/index.ts' ),
			},
			{
				find: /^react-router$/,
				replacement: path.join( root, 'node_modules/react-router/dist/development/index.mjs' ),
			},
			{
				find: /^react-router-dom$/,
				replacement: path.join( root, 'node_modules/react-router-dom/dist/index.mjs' ),
			},
		],
	},
	test: {
		include: vitestInclude,
		exclude: [ ...vitestExclude, 'dashboard/**', 'server/**', '**/node_modules/**' ],
		passWithNoTests: true,
		snapshotFormat: { escapeString: true, printBasicPrototype: true },
		setupFiles: [ path.join( import.meta.dirname, 'vitest-setup.ts' ) ],
		server: { deps: { inline: [ 'react-router', 'react-router-dom' ] } },
		// nock can schedule the reply to a request after the file's `afterAll` aborted its pending
		// replies. The reply then lands in the torn-down context, where nothing awaits it.
		onUnhandledError: ( error: Error ) =>
			! (
				error.message === 'ReadableStream is not defined' &&
				error.stack?.includes( 'nock/lib/create_response.js' )
			),
	},
} );
