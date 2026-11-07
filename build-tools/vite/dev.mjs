// PROTOTYPE (DOTMSD-1675): dev-server overlay, for Vite in middleware mode inside Express
// (DOTMSD-1655). Mirrors the browser side of client/webpack.config.js. Throwaway.
import fs from 'node:fs';
import path from 'node:path';
import { mergeConfig } from 'vite';
import { CALYPSO_SRC, calypsoBase, client, clientConditions, root } from './base.mjs';

// Sass deep imports through wildcard `exports` (`@import '@automattic/foo/src/styles/bar'`) don't
// match Vite's Sass conditions, so alias each wildcard pattern. JS deep imports resolve without them.
let deepImportAliases;
export function workspaceDeepImportAliases() {
	if ( deepImportAliases ) {
		return deepImportAliases;
	}
	deepImportAliases = [];
	for ( const base of [ 'packages', 'apps' ] ) {
		for ( const dir of fs.readdirSync( path.join( root, base ) ) ) {
			const file = path.join( root, base, dir, 'package.json' );
			if ( ! fs.existsSync( file ) ) {
				continue;
			}
			const pkg = JSON.parse( fs.readFileSync( file, 'utf8' ) );
			if ( ! pkg.exports || typeof pkg.exports !== 'object' ) {
				continue;
			}
			for ( const [ key, value ] of Object.entries( pkg.exports ) ) {
				if ( ! key.endsWith( '/*' ) ) {
					continue;
				}
				const target =
					typeof value === 'string' ? value : value[ CALYPSO_SRC ] ?? value.default ?? value.import;
				if ( typeof target !== 'string' || ! target.endsWith( '/*' ) ) {
					continue;
				}
				const escaped = pkg.name.replace( /[/\\^$*+?.()|[\]{}]/g, '\\$&' );
				deepImportAliases.push( {
					find: new RegExp( `^${ escaped }/${ key.slice( 2, -2 ) }/` ),
					replacement: path.join( root, base, dir, target.slice( 2, -2 ) ) + '/',
				} );
			}
		}
	}
	return deepImportAliases;
}

/**
 * @param {object}   options
 * @param {string[]} options.entries      Entry files, relative to the repo root, for the deps scan.
 * @param {object}   [options.httpServer] Express's http.Server, so HMR shares its port.
 * @returns {import('vite').UserConfig}
 */
export function devOverlay( { entries, httpServer } = {} ) {
	return {
		cacheDir: path.join( root, '.cache/vite' ),
		appType: 'custom',
		define: {
			'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			'process.env.FORCE_REDUCED_MOTION': JSON.stringify( !! process.env.FORCE_REDUCED_MOTION ),
		},
		resolve: {
			conditions: clientConditions,
			alias: [
				...workspaceDeepImportAliases(),
				{
					find: /^calypso\/server\/lib\/logger$/,
					replacement: `${ client }/lib/explat/internals/logger-browser-replacement`,
				},
				// Vite's error overlay replaces webpack's build monitor.
				{
					find: /^calypso\/components\/webpack-build-monitor$/,
					replacement: `${ client }/components/empty-component`,
				},
				{ find: /^path$/, replacement: 'path-browserify' },
			],
		},
		css: {
			preprocessorOptions: {
				scss: {
					quietDeps: true,
					silenceDeprecations: [ 'import', 'global-builtin', 'mixed-decls', 'color-functions', 'slash-div' ],
				},
			},
		},
		optimizeDeps: { entries },
		server: {
			middlewareMode: true,
			hmr: httpServer ? { server: httpServer } : false,
			ws: httpServer ? undefined : false,
		},
	};
}

export const dashboardEntries = [ 'client/dashboard/app-dotcom/index.ts', 'client/dashboard/app-a4a/index.ts' ];

export function dashboardDevConfig( options = {} ) {
	return mergeConfig( calypsoBase(), devOverlay( { entries: dashboardEntries, ...options } ) );
}
