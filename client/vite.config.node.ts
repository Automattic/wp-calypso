import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { vitePluginSections } from '@automattic/vite-plugin-calypso-sections';
import react from '@vitejs/plugin-react';
import { defineConfig, transformWithOxc } from 'vite';
const require = createRequire( import.meta.url );

const __dirname = fileURLToPath( new URL( '.', import.meta.url ) );
const projectRoot = path.join( __dirname, '..' );

function findPackage( pkgName: string ): string {
	return path.dirname( require.resolve( pkgName + '/package.json' ) );
}

/**
 * Returns the names of all workspace packages in packages/.
 * These are bundled rather than externalized so the server gets their
 * TypeScript source (via calypso:src) rather than any pre-built dist.
 */
function getMonorepoPackageNames(): string[] {
	const packagesDir = path.join( projectRoot, 'packages' );
	return fs
		.readdirSync( packagesDir, { withFileTypes: true } )
		.filter( ( d ) => d.isDirectory() )
		.map( ( d ) => path.join( packagesDir, d.name, 'package.json' ) )
		.filter( ( p ) => fs.existsSync( p ) )
		.map( ( p ) => ( JSON.parse( fs.readFileSync( p, 'utf8' ) ) as { name?: string } ).name )
		.filter( ( name ): name is string => Boolean( name ) );
}

const monorepoPackageNames = getMonorepoPackageNames();

export default defineConfig( {
	root: projectRoot,

	resolve: {
		conditions: [ 'calypso:src', 'node', 'import', 'require' ],
		mainFields: [ 'calypso:src', 'module', 'main' ],

		alias: [
			// `calypso/*` → `client/*`
			{ find: 'calypso', replacement: __dirname },

			// Server config replaces the browser shim.
			{ find: '@automattic/calypso-config', replacement: path.join( __dirname, 'server/config' ) },

			// Pin debug to the project-level copy.
			{ find: 'debug', replacement: findPackage( 'debug' ) },

			// Replace lodash with the tree-shakeable build.
			{ find: 'lodash', replacement: 'lodash-es' },

			// See comment in vite.config.ts.
			{
				find: /^fast-deep-equal\/es6(\/index\.js)?$/,
				replacement: require.resolve( 'fast-deep-equal/es6/index.js' ),
			},
		],
	},

	plugins: [
		// OXC handles JSX for .ts/.tsx/.jsx files.
		react(),

		// OXC's lang is determined by file extension and cannot be overridden via OxcOptions.
		// Use transformWithOxc directly with lang:'jsx' for plain .js files that contain JSX.
		// @automattic/react-virtualized/dist/jsx ships JSX in .js files, so it's included.
		{
			name: 'calypso-transform-jsx-in-js',
			enforce: 'pre' as const,
			async transform( code: string, id: string ) {
				if (
					! id.endsWith( '.js' ) ||
					( /[/\\]node_modules[/\\]/.test( id ) &&
						! /[/\\]@automattic[/\\]react-virtualized[/\\]dist[/\\]jsx/.test( id ) ) ||
					/^\0rolldown[/\\]runtime\.js$/.test( id )
				) {
					return null;
				}
				return transformWithOxc( code, id, { lang: 'jsx' } );
			},
		},

		// Same as in the browser config: OXC erases interface/type-alias exports
		// entirely, so .js files that import them get a MISSING_EXPORT hard error
		// in ESM output. Append `export const X = undefined` stubs before OXC
		// runs so rolldown sees a valid binding.
		{
			name: 'calypso-type-export-stubs',
			enforce: 'pre' as const,
			transform( code: string, id: string ) {
				if (
					! id.endsWith( '.ts' ) ||
					id.endsWith( '.d.ts' ) ||
					( ! code.includes( 'export interface' ) && ! code.includes( 'export type ' ) )
				) {
					return;
				}

				const typeNames = new Set< string >(
					[
						...code.matchAll( /^export\s+(?:default\s+)?(?:interface|abstract\s+class)\s+(\w+)/gm ),
					].map( ( m ) => m[ 1 ] )
				);
				for ( const m of code.matchAll( /^export\s+type\s+(\w+)\s*[=<]/gm ) ) {
					typeNames.add( m[ 1 ] );
				}

				if ( typeNames.size === 0 ) {
					return;
				}

				for ( const m of code.matchAll(
					/^export\s+(?:(?:declare\s+)?(?:const|let|var|function|class|enum|abstract\s+class))\s+(\w+)/gm
				) ) {
					typeNames.delete( m[ 1 ] );
				}

				if ( typeNames.size === 0 ) {
					return;
				}

				const stubs = [ ...typeNames ]
					.map( ( n ) => `export const ${ n } = undefined;` )
					.join( '\n' );
				return { code: code + '\n' + stubs, map: null };
			},
		},

		vitePluginSections( { root: projectRoot } ),
	],

	ssr: {
		// Bundle workspace packages so their calypso:src TypeScript source is included.
		// Also bundle any non-workspace @automattic packages that import CSS — the
		// calypso-ignore-css plugin stubs those imports so Node.js doesn't crash at runtime.
		noExternal: [ ...monorepoPackageNames, '@automattic/agenttic-ui', '@automattic/charts' ],
		resolve: {
			// Mirror resolve.conditions — calypso:src must be included so workspace
			// package subpath exports (e.g. ./src/constants) resolve correctly.
			conditions: [ 'calypso:src', 'node', 'import', 'require' ],
			externalConditions: [ 'node', 'import', 'require' ],
		},
	},

	build: {
		ssr: true,

		outDir: path.join( projectRoot, 'build' ),
		emptyOutDir: false,

		rolldownOptions: {
			input: { server: path.join( __dirname, 'server/index.js' ) },

			output: {
				entryFileNames: '[name].mjs',
				chunkFileNames: '[name].[hash].mjs',
				format: 'esm',
			},

			onLog( _level, log, handler ) {
				if ( log.code === 'MISSING_EXPORT' ) {
					return;
				}
				handler( _level, log );
			},
		},
	},
} );
