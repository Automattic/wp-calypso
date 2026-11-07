// PROTOTYPE (DOTMSD-1675): the Vite config every Calypso consumer starts from: the dev server
// (dev.mjs), the dev Node server's SSR build (server.mjs) and Vitest (test.mjs). Throwaway.
//
// Only things that are the same for every consumer live here. `mergeConfig` concatenates arrays
// (aliases excepted: the overlay's come first), so anything a consumer must *replace*, like
// `resolve.conditions`, `resolve.mainFields` or `resolve.extensions`, is exported as a constant
// for each overlay to set itself instead of being set here.
import path from 'node:path';
import { defaultClientConditions, defaultServerConditions } from 'vite';

export const root = path.resolve( import.meta.dirname, '../..' );
export const client = path.join( root, 'client' );

// Workspace packages publish their source under this export condition.
export const CALYPSO_SRC = 'calypso:src';
export const clientConditions = [ CALYPSO_SRC, ...defaultClientConditions ];
export const serverConditions = [ CALYPSO_SRC, ...defaultServerConditions ];

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
			// Redundant while node_modules/calypso links to client/, but doesn't depend on the install.
			alias: [ { find: /^calypso\//, replacement: client + '/' } ],
		},
	};
}
