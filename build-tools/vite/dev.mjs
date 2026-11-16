import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { mergeConfig } from 'vite';
import { CALYPSO_SRC, calypsoBase, client, root } from './base.mjs';

const require = createRequire( import.meta.url );
const sectionsFile = path.join( client, 'sections.js' );

/**
 * Sass resolves `@import '@automattic/foo/src/styles/bar'` without Vite's conditions, so deep
 * imports through a package's wildcard `exports` fail. Alias each wildcard pattern to its folder.
 * @returns {import('vite').Alias[]}
 */
export function workspaceDeepImportAliases() {
	const aliases = [];
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
				aliases.push( {
					find: new RegExp( `^${ escaped }/${ key.slice( 2, -2 ) }/` ),
					replacement: path.join( root, base, dir, target.slice( 2, -2 ) ) + '/',
				} );
			}
		}
	}
	return aliases;
}

/**
 * Express renders the HTML, so Vite never injects plugin-react's Fast Refresh preamble into it.
 * The Document loads it from this URL, before the entries.
 */
export const REACT_PREAMBLE_URL = '/@calypso/react-preamble.js';

/** @returns {import('vite').Plugin} */
function reactPreamble() {
	return {
		name: 'calypso-react-preamble',
		configureServer( server ) {
			server.middlewares.use( REACT_PREAMBLE_URL, ( req, res ) => {
				res.setHeader( 'Content-Type', 'text/javascript' );
				res.end( react.preambleCode.replace( '__BASE__', '/' ) );
			} );
		},
	};
}

function calypsoEnv() {
	return process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development';
}

/**
 * The sections the server config of `CALYPSO_ENV` enables, as `calypso/sections-filter` decides.
 * It reads the config files directly, so it works before the packages are built.
 * @returns {Object[]}
 */
export function enabledSections() {
	const parse = require( path.join( client, 'server/config/parser.js' ) );
	const { serverData } = parse( path.join( root, 'config' ), { env: calypsoEnv() } );
	delete require.cache[ sectionsFile ];
	return require( sectionsFile ).filter(
		( section ) => serverData.sections?.[ section.name ] ?? serverData.enable_all_sections
	);
}

/**
 * Like `build-tools/webpack/sections-loader.js` for the browser: each section loads with `import()`.
 * @param {Object[]} sections
 * @returns {import('vite').Plugin}
 */
function sectionsPlugin( sections ) {
	return {
		name: 'calypso-sections',
		enforce: 'pre',
		transform( code, id ) {
			if ( id !== sectionsFile ) {
				return;
			}
			const list = sections.map( ( section ) =>
				JSON.stringify( section ).replace(
					/}$/,
					`, "load": () => import( ${ JSON.stringify( section.module ) } ) }`
				)
			);
			return { code: `export default [\n${ list.join( ',\n' ) }\n];`, map: null };
		},
	};
}

/**
 * The browser side of `client/webpack.config.js`, for Vite in middleware mode inside Express.
 * @param {Object}   options
 * @param {string[]} options.entries      Entry files, relative to the repo root, for the deps scan.
 * @param {Object[]} [options.sections]   The sections `client/sections.js` loads.
 * @param {import('node:http').Server} [options.httpServer] Express's server, so HMR shares its port.
 * @returns {import('vite').UserConfig}
 */
export function devOverlay( { entries, sections = [], httpServer } ) {
	// The deps scanner doesn't run plugins, so it can't see the sections' `import()`s. Without
	// these, Vite finds a section's dependencies on its first visit, then re-optimizes and reloads.
	const sectionEntries = sections.map(
		( section ) =>
			section.module.replace( /^calypso\//, 'client/' ) +
			'/index.{web.js,web.jsx,web.ts,web.tsx,js,jsx,ts,tsx}'
	);
	const nodeDebug = JSON.stringify( process.env.NODE_DEBUG || false );
	return {
		// Each config env pre-bundles a different set of dependencies.
		cacheDir: path.join( root, '.cache/vite', calypsoEnv() ),
		appType: 'custom',
		plugins: [
			react( { jsxImportSource: '@emotion/react', include: /\.(m?[jt]sx?)$/ } ),
			reactPreamble(),
			sectionsPlugin( sections ),
		],
		// Classic Calypso has JSX in .js files.
		oxc: { include: /\.(m?[jt]sx?)$/, exclude: /node_modules/ },
		define: {
			'process.env.NODE_DEBUG': nodeDebug,
			'process.env.FORCE_REDUCED_MOTION': JSON.stringify( !! process.env.FORCE_REDUCED_MOTION ),
			'process.env': '{}',
		},
		resolve: {
			mainFields: [ 'browser', CALYPSO_SRC, 'module', 'main' ],
			conditions: [ CALYPSO_SRC, 'module', 'browser' ],
			alias: [
				...workspaceDeepImportAliases(),
				{ find: /^store$/, replacement: 'store/dist/store.modern' },
				{
					find: /^calypso\/server\/lib\/logger$/,
					replacement: `${ client }/lib/explat/internals/logger-browser-replacement`,
				},
				// Vite's error overlay does the build monitor's job.
				{
					find: /^calypso\/components\/webpack-build-monitor$/,
					replacement: `${ client }/components/empty-component`,
				},
				{ find: /^path$/, replacement: 'path-browserify' },
				// Sass doesn't resolve a package's `main`.
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
					define: { global: 'globalThis', 'process.env.NODE_DEBUG': nodeDebug },
				},
			},
		},
		server: {
			middlewareMode: true,
			// The root is the repo, so ignore scratch files and build output.
			watch: { ignored: [ '**/tmp/**', '**/build/**', '**/.cache/**', '**/public/**' ] },
			hmr: httpServer ? { server: httpServer } : false,
			ws: httpServer ? undefined : false,
		},
	};
}

const globalStyles = [ 'client/assets/stylesheets/style.scss' ];
// The loading placeholder the server renders for Stepper, signup and checkout.
const placeholderStyles = [
	'client/components/loading/style.scss',
	'packages/onboarding/src/step-container-v2/wireframes/Loading/style.scss',
	'packages/onboarding/src/step-container-v2/components/StepContainerV2/style.scss',
	'packages/onboarding/src/step-container-v2/components/TopBar/style.scss',
	'packages/onboarding/src/step-container-v2/components/Heading/style.scss',
];
const omnibarStyles = [
	'packages/omnibar/src/style.scss',
	'client/dashboard/app/omnibar/style.scss',
];

/**
 * The entries `yarn start-dashboard:vite` serves, as in `entry` in `client/webpack.config.js`: the
 * Dashboard, and the classic flows it links into. Each has its source file and the stylesheets the
 * server-rendered page needs before the scripts run, relative to the repo root.
 * @type {Record<string, { file: string, styles: string[] }>}
 */
export const startDashboardEntries = {
	'entry-main': { file: 'client/boot/app.js', styles: globalStyles },
	'entry-stepper': {
		file: 'client/landing/stepper/index.tsx',
		styles: [ ...globalStyles, ...placeholderStyles ],
	},
	'entry-dashboard-dotcom': {
		file: 'client/dashboard/app-dotcom/index.ts',
		styles: omnibarStyles,
	},
	'entry-dashboard-a4a': { file: 'client/dashboard/app-a4a/index.ts', styles: omnibarStyles },
};

/**
 * The entries `yarn start:vite` serves: all of them.
 * @type {Record<string, { file: string, styles: string[] }>}
 */
export const startEntries = {
	...startDashboardEntries,
	'entry-login': { file: 'client/landing/login/index.js', styles: globalStyles },
	'entry-subscriptions': {
		file: 'client/landing/subscriptions/index.tsx',
		styles: [ 'client/landing/subscriptions/styles/styles.scss' ],
	},
	'entry-domains-landing': {
		file: 'client/landing/domains/index.jsx',
		styles: [ ...globalStyles, 'client/landing/domains/style.scss' ],
	},
	// The page only links the stylesheets: the server renders it and it runs no script.
	'entry-browsehappy': {
		file: 'client/landing/browsehappy/index.jsx',
		styles: [
			...globalStyles,
			'client/landing/browsehappy/style.scss',
			'client/landing/browsehappy/circle.scss',
		],
	},
};

/**
 * Adds the stylesheet of the environment badge, which the server renders in these envs.
 * `calypso/lib/load-dev-helpers` only imports it once the app boots, so it would be unstyled
 * until then.
 * @param {Record<string, { file: string, styles: string[] }>} entries
 * @returns {Record<string, { file: string, styles: string[] }>}
 */
function withEnvironmentBadge( entries ) {
	return Object.fromEntries(
		Object.entries( entries ).map( ( [ name, entry ] ) => [
			name,
			{ ...entry, styles: [ ...entry.styles, 'client/components/environment-badge/style.scss' ] },
		] )
	);
}

/**
 * The config envs the Vite dev server supports, and the entries each serves.
 * @type {Record<string, Record<string, { file: string, styles: string[] }>>}
 */
export const entriesByEnv = {
	development: withEnvironmentBadge( startEntries ),
	'dashboard-development': startDashboardEntries,
	'a8c-for-agencies-development': withEnvironmentBadge( startEntries ),
};

/**
 * The entries the config env in `CALYPSO_ENV` serves.
 * @returns {Record<string, { file: string, styles: string[] }>}
 */
export function devEntries() {
	const entries = entriesByEnv[ calypsoEnv() ];
	if ( ! entries ) {
		throw new Error( `The Vite dev server doesn't support CALYPSO_ENV=${ calypsoEnv() }.` );
	}
	return entries;
}

/**
 * The stylesheets a section's server-rendered page needs before the scripts run.
 * @type {Record<string, string[]>}
 */
export const sectionStyles = {
	checkout: placeholderStyles,
	signup: placeholderStyles,
};

/**
 * Must run after `CALYPSO_ENV` is set: it reads the server config.
 * @param {Object} [options]
 * @param {import('node:http').Server} [options.httpServer]
 * @returns {import('vite').UserConfig}
 */
export function devConfig( options = {} ) {
	return mergeConfig(
		calypsoBase(),
		devOverlay( {
			entries: Object.values( devEntries() ).map( ( entry ) => entry.file ),
			sections: enabledSections(),
			...options,
		} )
	);
}
