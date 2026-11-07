// PROTOTYPE (DOTMSD-1675): the Vite config every Calypso consumer starts from: the dev server
// (dev.mjs), the dev Node server's SSR build (server.mjs) and Vitest (test.mjs). Throwaway.
//
// Only things that are the same for every consumer live here. `mergeConfig` concatenates arrays
// (aliases excepted: the overlay's come first), so anything a consumer must *replace*, like
// `resolve.conditions`, `resolve.mainFields` or `resolve.extensions`, is exported as a constant
// for each overlay to set itself instead of being set here.
import fs from 'node:fs';
import path from 'node:path';
import { defaultClientConditions, defaultServerConditions } from 'vite';

export const root = path.resolve( import.meta.dirname, '../..' );
export const client = path.join( root, 'client' );

// Workspace packages publish their source under this export condition.
export const CALYPSO_SRC = 'calypso:src';
export const clientConditions = [ CALYPSO_SRC, ...defaultClientConditions ];
export const serverConditions = [ CALYPSO_SRC, ...defaultServerConditions ];

// Deep imports through wildcard `exports` (`@automattic/foo/src/bar`, Sass included) need explicit
// aliases under Vite (DOTMSD-1652). One alias per wildcard pattern.
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

/** @returns {import('vite').UserConfig} */
export function calypsoBase() {
	return {
		root,
		oxc: {
			jsx: { runtime: 'automatic', importSource: '@emotion/react' },
		},
		define: {
			__i18n_text_domain__: JSON.stringify( 'default' ),
		},
		resolve: {
			alias: [ ...workspaceDeepImportAliases(), { find: /^calypso\//, replacement: client + '/' } ],
		},
	};
}
