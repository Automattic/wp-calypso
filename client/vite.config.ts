import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { viteBuildAssetsWriter } from '@automattic/vite-plugin-calypso-assets-writer';
import { vitePluginRtlCss } from '@automattic/vite-plugin-calypso-rtl-css';
import { vitePluginSections } from '@automattic/vite-plugin-calypso-sections';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import { defineConfig, transformWithOxc, type Plugin, type UserConfig } from 'vite';
const require = createRequire( import.meta.url );

const __dirname = fileURLToPath( new URL( '.', import.meta.url ) );
const projectRoot = path.join( __dirname, '..' );

/**
 * Resolve the root directory of a package by name.
 * Mirrors the `findPackage` helper in webpack.config.js.
 */
function findPackage( pkgName: string ): string {
	return path.dirname( require.resolve( pkgName + '/package.json' ) );
}
const bundleEnv: string = process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development';
const isDevelopment = bundleEnv !== 'production';

const SCSS_PRELUDE_PATH = path.join( __dirname, 'assets/stylesheets/shared/_utils.scss' );

const ENTRYPOINTS: Record< string, string > = {
	'entry-main': path.join( __dirname, 'boot/app.js' ),
	'entry-domains-landing': path.join( __dirname, 'landing/domains/index.jsx' ),
	'entry-login': path.join( __dirname, 'landing/login/index.js' ),
	'entry-stepper': path.join( __dirname, 'landing/stepper/index.tsx' ),
	'entry-browsehappy': path.join( __dirname, 'landing/browsehappy/index.jsx' ),
	'entry-subscriptions': path.join( __dirname, 'landing/subscriptions/index.tsx' ),
	'entry-dashboard-dotcom': path.join( __dirname, 'dashboard/app-dotcom/index.tsx' ),
	'entry-dashboard-ciab': path.join( __dirname, 'dashboard/app-ciab/index.tsx' ),
	'entry-reauth-required': path.join( __dirname, 'reauth-required/bundle.js' ),
};

/**
 * Custom Sass FileImporter that resolves bare package specifiers
 * (e.g. `@automattic/onboarding/styles/mixins`) directly from the filesystem,
 * bypassing Sass's built-in package resolver which only checks a fixed set of
 * export conditions and has no knowledge of the `calypso:src` condition used
 * by Calypso workspace packages.
 *
 * Works by resolving the package root via `node_modules/` (which follows
 * workspace symlinks) and then trying standard SCSS file-naming conventions.
 */
const sassPackageImporter = {
	findFileUrl( url: string ): URL | null {
		// Support webpack-style Sass imports without forcing source SCSS churn.
		url = url.replace( /^~/, '' );

		// Only intercept bare package specifiers; relative/absolute paths are fine.
		if ( url.startsWith( '.' ) || url.startsWith( '/' ) || url.startsWith( 'file:' ) ) {
			return null;
		}

		if ( url === 'calypso' || url.startsWith( 'calypso/' ) ) {
			return findSassFile( path.join( __dirname, url.slice( 'calypso/'.length ) ) );
		}

		// Split into <pkgName> + <subpath>.
		const isScoped = url.startsWith( '@' );
		const parts = url.split( '/' );
		const pkgName = isScoped ? parts.slice( 0, 2 ).join( '/' ) : parts[ 0 ];
		const subpath = parts.slice( isScoped ? 2 : 1 ).join( '/' );

		// Resolve the package root via node_modules (follows workspace symlinks).
		const pkgRoot = path.join( projectRoot, 'node_modules', ...pkgName.split( '/' ) );
		if ( ! fs.existsSync( pkgRoot ) ) {
			return null;
		}

		// The package base name (last segment of a scoped package, e.g. "calypso-color-schemes").
		const pkgBaseName = pkgName.split( '/' ).pop()!;

		let candidates: string[];
		if ( ! subpath ) {
			// Bare package name — check src/ and root for conventional SCSS entry points.
			candidates = [
				path.join( pkgRoot, 'src', pkgBaseName + '.scss' ),
				path.join( pkgRoot, 'src', '_' + pkgBaseName + '.scss' ),
				path.join( pkgRoot, 'src', 'index.scss' ),
				path.join( pkgRoot, 'src', '_index.scss' ),
				path.join( pkgRoot, '_index.scss' ),
				path.join( pkgRoot, 'index.scss' ),
			];
		} else {
			// Try standard Sass file-naming conventions for the subpath.
			const basename = path.basename( subpath );
			const dir = path.dirname( subpath );
			candidates = [
				path.join( pkgRoot, subpath + '.scss' ),
				path.join( pkgRoot, dir, '_' + basename + '.scss' ),
				path.join( pkgRoot, subpath, '_index.scss' ),
				path.join( pkgRoot, subpath, 'index.scss' ),
			];
		}

		for ( const candidate of candidates ) {
			if ( fs.existsSync( candidate ) ) {
				// Resolve symlinks so Sass gets the real filesystem path.
				return pathToFileURL( fs.realpathSync( candidate ) );
			}
		}

		return null;
	},
};

function findSassFile( basePath: string ): URL | null {
	const baseName = path.basename( basePath );
	const dirName = path.dirname( basePath );
	const candidates = path.extname( basePath )
		? [ basePath ]
		: [
				basePath + '.scss',
				basePath + '.sass',
				basePath + '.css',
				path.join( dirName, '_' + baseName + '.scss' ),
				path.join( dirName, '_' + baseName + '.sass' ),
				path.join( basePath, '_index.scss' ),
				path.join( basePath, 'index.scss' ),
		  ];

	for ( const candidate of candidates ) {
		if ( fs.existsSync( candidate ) ) {
			return pathToFileURL( fs.realpathSync( candidate ) );
		}
	}

	return null;
}

// @automattic/react-virtualized currently publishes JSX in .js files.
// Keep this scoped transform until the package ships parseable JS or .jsx files.
const transformReactVirtualizedJsxPlugin: Plugin = {
	name: 'calypso-transform-react-virtualized-jsx',
	enforce: 'pre',
	async transform( code: string, id: string ) {
		if (
			! /[/\\]node_modules[/\\]@automattic[/\\]react-virtualized[/\\]dist[/\\]jsx[/\\].+\.js(?:\?.*)?$/.test(
				id
			)
		) {
			return null;
		}
		return transformWithOxc( code, id, { lang: 'jsx' } );
	},
};

// Extracted as a typed variable so TypeScript can check it against Plugin independently,
// avoiding "excessive stack depth" when comparing the full config object to UserConfig.
const typeExportStubsPlugin: Plugin = {
	name: 'calypso-type-export-stubs',
	enforce: 'pre',
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

		const stubs = [ ...typeNames ].map( ( n ) => `export const ${ n } = undefined;` ).join( '\n' );
		return { code: code + '\n' + stubs, map: null };
	},
};

const emptyDashiconsPlugin: Plugin = {
	name: 'calypso-empty-dashicons',
	resolveId( id: string, importer: string | undefined ) {
		if (
			importer?.includes( '@wordpress/components' ) &&
			id.toLowerCase().includes( 'dashicon' )
		) {
			return '\0calypso-empty-dashicons';
		}
	},
	load( id: string ) {
		if ( id === '\0calypso-empty-dashicons' ) {
			return 'export default () => null;\nexport const Icon = () => null;\n';
		}
	},
};

const browserConditionalRequiresPlugin: Plugin = {
	name: 'calypso-browser-conditional-requires',
	enforce: 'pre',
	transform( code: string, id: string ) {
		if ( ! id.endsWith( '/client/state/index.ts' ) ) {
			return null;
		}

		let transformed = code
			.replace(
				"isBrowser && require( './analytics/middleware.js' ).analyticsMiddleware",
				'isBrowser && __calypsoAnalyticsMiddleware'
			)
			.replace(
				"isBrowser && require( './lib/middleware.js' ).default",
				'isBrowser && __calypsoLibraryMiddleware'
			)
			.replace(
				"isDesktop && require( './desktop/middleware.js' ).default",
				'isDesktop && __calypsoDesktopMiddleware'
			);

		if ( transformed === code ) {
			return null;
		}

		transformed =
			[
				"import { analyticsMiddleware as __calypsoAnalyticsMiddleware } from './analytics/middleware.js';",
				"import __calypsoLibraryMiddleware from './lib/middleware.js';",
				"import __calypsoDesktopMiddleware from './desktop/middleware.js';",
			].join( '\n' ) +
			'\n' +
			transformed;

		return { code: transformed, map: null };
	},
};

// `client/components/date-picker` depends on react-day-picker v7 (CJS, default
// export) declared in client/package.json, while other consumers (packages/ui)
// use v9 (named exports only) hoisted to the workspace root. Webpack picks the
// nearest node_modules per importer; Vite's optimizer keeps one entry per bare
// specifier and would otherwise serve v9 to everyone, dropping the v7 default
// export.
//
// Trick: the resolver re-resolves to a synthetic bare specifier
// `react-day-picker-v7` (aliased below to v7's CJS `main`, and force-included
// in optimizeDeps). Vite's optimizer then keeps two separate pre-bundled
// entries — one per specifier. Pointing at v7's CJS `main` (build/index.js)
// rather than its `browser` UMD bundle is essential: the optimizer converts
// CJS→ESM, but serves UMD raw, which exposes no `default` export.
const REACT_DAY_PICKER_V7 = path.join( __dirname, 'node_modules/react-day-picker/build/index.js' );
const reactDayPickerV7Plugin: Plugin = {
	name: 'calypso-react-day-picker-v7',
	enforce: 'pre',
	async resolveId( id: string, importer: string | undefined ) {
		if ( id !== 'react-day-picker' ) {
			return null;
		}
		if ( ! importer?.includes( '/client/components/date-picker/' ) ) {
			return null;
		}
		return this.resolve( 'react-day-picker-v7', importer, { skipSelf: true } );
	},
};

const webpackCssLoaderImportsPlugin: Plugin = {
	name: 'calypso-webpack-css-loader-imports',
	enforce: 'pre',
	async resolveId( id: string, importer: string | undefined ) {
		if ( ! /^!!.*\.(css|scss|sass|less)$/.test( id ) ) {
			return null;
		}

		const request = id.slice( id.lastIndexOf( '!' ) + 1 );
		const resolved = await this.resolve( request, importer, { skipSelf: true } );
		if ( ! resolved ) {
			return null;
		}

		return `\0calypso-webpack-css-loader:${ encodeURIComponent( resolved.id ) }.js`;
	},
	load( id: string ) {
		const prefix = '\0calypso-webpack-css-loader:';
		if ( ! id.startsWith( prefix ) ) {
			return null;
		}

		const stylesheetId = decodeURIComponent( id.slice( prefix.length, -'.js'.length ) );
		return [
			`import cssText from ${ JSON.stringify( `${ stylesheetId }?inline` ) };`,
			`const css = [ [ ${ JSON.stringify( stylesheetId ) }, cssText ] ];`,
			'css.toString = () => cssText;',
			'export default css;',
		].join( '\n' );
	},
};

export default defineConfig(
	(): UserConfig => ( {
		// Project root — Vite serves files from here in dev mode.
		root: projectRoot,

		resolve: {
			// Resolve the calypso:src export condition so workspace packages are
			// imported from their TypeScript source files, not pre-built dist.
			conditions: [ 'calypso:src', 'import', 'module', 'require' ],
			mainFields: [ 'browser', 'calypso:src', 'module', 'main' ],

			alias: [
				// Server-only logger → browser-safe no-op replacement. Keep this
				// before the generic `calypso` alias so it wins the match.
				{
					find: 'calypso/server/lib/logger',
					replacement: path.join( __dirname, 'lib/explat/internals/logger-browser-replacement' ),
				},

				// `calypso/*` → `client/*` (mirrors webpack's `calypso` alias)
				{ find: 'calypso', replacement: __dirname },

				// Pin debug to the project-level copy to avoid duplicate instances.
				{ find: 'debug', replacement: findPackage( 'debug' ) },

				// Use the modern store build.
				{ find: 'store', replacement: 'store/dist/store.modern' },

				// Resolve @wordpress packages via their package root so that
				// mainFields can pick calypso:src if available.
				{ find: '@wordpress/data', replacement: findPackage( '@wordpress/data' ) },
				{ find: '@wordpress/i18n', replacement: findPackage( '@wordpress/i18n' ) },

				// fast-deep-equal ships es6/ as a plain directory (no exports field).
				// String aliases do prefix replacement, so aliasing to the directory would
				// work for /index.js sub-imports but produce a bare directory reference for
				// the unqualified form — which ESM rejects. A regex with $ anchoring
				// matches both forms exactly and maps each to the concrete file.
				{
					find: /^fast-deep-equal\/es6(\/index\.js)?$/,
					replacement: require.resolve( 'fast-deep-equal/es6/index.js' ),
				},

				// Browser polyfills for Node built-ins used in the codebase.
				{ find: 'path', replacement: 'path-browserify' },
				{ find: 'util', replacement: findPackage( 'util/' ) },

				// PostCSS marks source-map-js as browser:false, but Gutenberg's
				// browser bundle imports PostCSS and can safely use the package.
				{
					find: /^source-map-js$/,
					replacement: require.resolve( 'source-map-js/source-map.js' ),
				},

				// Replace lodash with the tree-shakeable ES module build.
				{ find: 'lodash', replacement: 'lodash-es' },

				// react-day-picker/locale only re-exports date-fns/locale. Rolldown's
				// dep optimizer currently loses named exports from that re-export shim.
				{ find: 'react-day-picker/locale', replacement: 'date-fns/locale' },

				// Synthetic specifier for v7 (see reactDayPickerV7Plugin above).
				{ find: 'react-day-picker-v7', replacement: REACT_DAY_PICKER_V7 },
			],
		},

		css: {
			preprocessorOptions: {
				scss: {
					// Inject shared SCSS utilities (variables, mixins, functions)
					// into every .scss file — mirrors sass-loader's `additionalData`.
					additionalData: `@use '${ SCSS_PRELUDE_PATH }' as *;\n`,

					// Allow imports relative to both the project root and the client/ directory.
					// The project root lets @import "client/..." and @import "node_modules/..."
					// work; client/ lets @import "components/..." work within client code.
					loadPaths: [ projectRoot, __dirname ],

					// Resolve bare package specifiers (e.g. @automattic/onboarding/styles/mixins)
					// using the filesystem, bypassing Sass's built-in export-condition check
					// which doesn't understand the calypso:src condition.
					importers: [ sassPackageImporter ],

					// Suppress warnings from third-party SCSS dependencies.
					quietDeps: true,

					// Match the Webpack Sass upgrade path: keep the source CSS unchanged and
					// suppress the mixed declaration warnings introduced by Sass 1.77.
					silenceDeprecations: [ 'mixed-decls' ],
				},
			},
			postcss: {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				plugins: [ autoprefixer() as any ],
			},
		},

		define: {
			// Mirror webpack's DefinePlugin constants.
			// `typeof window` is handled by Vite's browser target automatically.
			'process.env.NODE_ENV': JSON.stringify( bundleEnv ),
			'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			'process.env.GUTENBERG_PHASE': JSON.stringify( 1 ),
			'process.env.COMPONENT_SYSTEM_PHASE': JSON.stringify( 0 ),
			'process.env.FORCE_REDUCED_MOTION': JSON.stringify(
				!! process.env.FORCE_REDUCED_MOTION || false
			),
			__i18n_text_domain__: JSON.stringify( 'default' ),
		},

		plugins: [
			// jsxImportSource replaces @emotion/babel-plugin: emotion's JSX runtime handles
			// the css prop at runtime rather than compile-time, eliminating the Babel dependency.
			react( { jsxImportSource: '@emotion/react' } ),

			transformReactVirtualizedJsxPlugin,

			browserConditionalRequiresPlugin,

			reactDayPickerV7Plugin,

			webpackCssLoaderImportsPlugin,

			// TypeScript interfaces and type aliases are erased by OXC at compile time,
			// leaving no runtime export. When .js files import such names for JSDoc
			// annotations, rolldown throws MISSING_EXPORT at link time.
			//
			// Fix: before OXC runs, scan .ts files for interface/type-alias exports
			// that have no corresponding value export, and append a runtime stub
			// `export const X = undefined;` for each. OXC erases the interface
			// declaration and keeps the stub, so rolldown sees a valid export binding.
			// TypeScript allows an interface and a value with the same name to coexist
			// in the same file (they live in separate type/value namespaces), so this
			// does not break type-checking.
			typeExportStubsPlugin,

			// Dashicon removal — replace @wordpress/components dashicon imports with
			// an empty module to avoid bundling the large SVG icon set.
			emptyDashiconsPlugin,

			vitePluginSections( { root: projectRoot } ),

			vitePluginRtlCss(),

			viteBuildAssetsWriter( {
				outDir: path.join( projectRoot, 'public/evergreen' ),
				buildDir: path.join( projectRoot, 'build' ),
				publicPath: '/calypso/evergreen/',
				entrypoints: ENTRYPOINTS,
			} ),
		],

		// Disable Vite's static file serving from public/ in dev mode — Calypso
		// has its own static asset middleware. Without this, Vite warns that outDir
		// (public/evergreen) is inside publicDir (public/).
		publicDir: false,

		optimizeDeps: {
			// Force pre-bundling for the v7 alias — deep node_modules paths
			// aren't auto-discovered by the dep scanner.
			include: [ 'react-day-picker-v7' ],
			rolldownOptions: {
				plugins: [ transformReactVirtualizedJsxPlugin, reactDayPickerV7Plugin ],
			},
		},

		build: {
			// Emit .vite/manifest.json — used by viteBuildAssetsWriter to generate
			// build/assets.json for the Node.js server.
			manifest: true,

			// Output to public/evergreen/, same as webpack's browser bundle.
			outDir: path.join( projectRoot, 'public/evergreen' ),

			// Don't wipe the directory — webpack output may also live there during
			// the parallel migration period.
			emptyOutDir: false,

			// lightningcss rejects technically-invalid selectors (e.g. ::before:not(...))
			// that appear in some third-party packages. esbuild is more lenient.
			cssMinify: 'esbuild',

			rolldownOptions: {
				// Suppress MISSING_EXPORT errors — these arise from type-only imports
				// in .js files (e.g. `import { Theme } from 'calypso/types'` used only
				// in JSDoc @returns annotations). rolldown can't distinguish type vs value
				// imports in plain JS; the imports are tree-shaken away at runtime.
				onLog( _level, log, handler ) {
					if ( log.code === 'MISSING_EXPORT' ) {
						return;
					}
					handler( _level, log );
				},

				input: filterEntrypoints( ENTRYPOINTS ),

				output: {
					// Mirror webpack's output filename patterns.
					entryFileNames: isDevelopment ? '[name].js' : '[name].[hash].min.js',
					chunkFileNames: isDevelopment ? '[name].js' : '[name].[hash].min.js',
					assetFileNames: isDevelopment ? '[name][extname]' : '[name].[hash].min[extname]',
				},
			},
		},
	} )
);

/**
 * Honour ENTRY_LIMIT env var — allows building a subset of entry points
 * for faster local development (mirrors webpack's filterEntrypoints).
 */
function filterEntrypoints( entrypoints: Record< string, string > ): Record< string, string > {
	if ( ! process.env.ENTRY_LIMIT ) {
		return entrypoints;
	}

	const allowed = process.env.ENTRY_LIMIT.split( ',' );
	console.warn( '[entrylimit] Limiting build to %s', allowed.join( ', ' ) );

	const filtered = Object.fromEntries(
		Object.entries( entrypoints ).filter( ( [ key ] ) => allowed.includes( key ) )
	);

	if ( ! Object.keys( filtered ).length ) {
		throw new Error( `[entrylimit] No valid entry points matched: ${ allowed.join( ', ' ) }` );
	}

	return filtered;
}
