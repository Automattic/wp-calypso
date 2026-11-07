// PROTOTYPE (DOTMSD-1675): dev-server overlay, for Vite in middleware mode inside Express
// (DOTMSD-1655). Mirrors the browser side of client/webpack.config.js. Throwaway.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import react from '@vitejs/plugin-react';
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
					typeof value === 'string'
						? value
						: ( value[ CALYPSO_SRC ] ?? value.default ?? value.import );
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

const require = createRequire( import.meta.url );

// PROTOTYPE (DOTMSD-1679): client twin of build-tools/webpack/sections-loader.js. client/sections.js
// is CJS (`module.exports = [...]`); emit an ESM list with `load: () => import()` per enabled section.
function sectionsPlugin( { isEnabled } ) {
	const sectionsFile = path.join( client, 'sections.js' );
	return {
		name: 'calypso-sections',
		enforce: 'pre',
		transform( code, id ) {
			if ( id !== sectionsFile ) {
				return;
			}
			delete require.cache[ sectionsFile ];
			const entries = require( sectionsFile )
				.filter( isEnabled )
				.map( ( s ) =>
					JSON.stringify( s ).replace(
						/}$/,
						`, "load": () => import( ${ JSON.stringify( s.module ) } ) }`
					)
				);
			return { code: `export default [\n${ entries.join( ',\n' ) }\n];`, map: null };
		},
	};
}

// PROTOTYPE (DOTMSD-1679): Express renders the HTML, so Vite's transformIndexHtml never injects
// plugin-react's Fast Refresh preamble. Serve it as a module the Document loads before the entry.
export const REACT_PREAMBLE_URL = '/@calypso/react-preamble.js';
const reactPreamble = {
	name: 'calypso-react-preamble',
	configureServer( server ) {
		server.middlewares.use( REACT_PREAMBLE_URL, ( req, res ) => {
			res.setHeader( 'Content-Type', 'text/javascript' );
			res.end( react.preambleCode.replace( '__BASE__', '/' ) );
		} );
	},
};

/**
 * @param {Object}   options
 * @param {string[]} options.entries      Entry files, relative to the repo root, for the deps scan.
 * @param {Object}   [options.httpServer] Express's http.Server, so HMR shares its port.
 * @param {Function} [options.isSectionEnabled] Section filter, from the server config.
 * @returns {import('vite').UserConfig}
 */
export function devOverlay( { entries, httpServer, isSectionEnabled = () => false } = {} ) {
	// PROTOTYPE (DOTMSD-1679): the deps scanner doesn't run plugins, so it never sees the sections
	// plugin's `import()`s. Scan the enabled sections too, or their deps are discovered on first
	// visit and Vite re-optimizes and reloads the page.
	const sectionEntries = require( path.join( client, 'sections.js' ) )
		.filter( isSectionEnabled )
		.map(
			( s ) =>
				s.module.replace( /^calypso\//, 'client/' ) +
				'/index.{web.js,web.jsx,web.ts,web.tsx,js,jsx,ts,tsx}'
		);
	return {
		cacheDir: path.join( root, '.cache/vite' ),
		appType: 'custom',
		plugins: [
			react( { jsxImportSource: '@emotion/react', include: /\.(m?[jt]sx?)$/ } ),
			reactPreamble,
			sectionsPlugin( { isEnabled: isSectionEnabled } ),
		],
		// JSX in .js files (classic Calypso).
		oxc: { include: /\.(m?[jt]sx?)$/, exclude: /node_modules/ },
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
				// PROTOTYPE (DOTMSD-1679): Vite's Sass resolver ignores `main` (css/index.css).
				{
					find: /^@automattic\/calypso-color-schemes$/,
					replacement: path.join( root, 'packages/calypso-color-schemes/css/index.css' ),
				},
			],
		},
		css: {
			preprocessorOptions: {
				scss: {
					quietDeps: true,
					silenceDeprecations: [
						'import',
						'global-builtin',
						'mixed-decls',
						'color-functions',
						'slash-div',
					],
				},
			},
		},
		optimizeDeps: {
			entries: [ ...entries, ...sectionEntries ],
			rolldownOptions: {
				transform: {
					define: { 'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ) },
				},
			},
		},
		server: {
			middlewareMode: true,
			// PROTOTYPE (DOTMSD-1679): root is the repo; don't reload pages for scratch and build output.
			watch: {
				ignored: [
					'**/tmp/**',
					'**/build/**',
					'**/.cache/**',
					'**/public/**',
					'**/.playwright-mcp/**',
				],
			},
			hmr: httpServer ? { server: httpServer } : false,
			ws: httpServer ? undefined : false,
		},
	};
}

export const dashboardEntries = [
	'client/dashboard/app-dotcom/index.ts',
	'client/dashboard/app-a4a/index.ts',
];

export function dashboardDevConfig( options = {} ) {
	return mergeConfig( calypsoBase(), devOverlay( { entries: dashboardEntries, ...options } ) );
}

// PROTOTYPE (DOTMSD-1679): `start-dashboard` entries: the Dashboard plus entry-main and entry-stepper.
export const classicEntries = [ 'client/boot/app.js', 'client/landing/stepper/index.tsx' ];

export function startDashboardDevConfig( options = {} ) {
	return mergeConfig(
		calypsoBase(),
		devOverlay( { entries: [ ...dashboardEntries, ...classicEntries ], ...options } )
	);
}

// DOTMSD-1681 (local): `start:vite`, every entry.
export const allEntries = [
	...classicEntries,
	'client/landing/login/index.js',
	'client/landing/domains/index.jsx',
	'client/landing/browsehappy/index.jsx',
	'client/landing/subscriptions/index.tsx',
	...dashboardEntries,
];

export function startDevConfig( options = {} ) {
	const config = mergeConfig( calypsoBase(), devOverlay( { entries: allEntries, ...options } ) );
	config.cacheDir = path.join( root, '.cache/vite-all' );
	if ( process.env.CALYPSO_VITE_WARMUP ) {
		config.server.warmup = { clientFiles: allEntries.map( ( e ) => './' + e ) };
	}
	return config;
}
