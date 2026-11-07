// PROTOTYPE (DOTMSD-1675): dev-server overlay, for Vite in middleware mode inside Express
// (DOTMSD-1655). Mirrors the browser side of client/webpack.config.js. Throwaway.
import path from 'node:path';
import { mergeConfig } from 'vite';
import { calypsoBase, client, clientConditions, root } from './base.mjs';

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
