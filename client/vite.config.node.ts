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

	define: {
		__i18n_text_domain__: JSON.stringify( 'default' ),
	},

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

			// Replace prop-types with a no-op stub. Validators are dev-only
			// console.warns that are never needed during SSR.  Using a real file
			// (rather than a virtual module) lets rolldown place it in its own
			// shared chunk so non-entry chunks can import it without going through
			// server.mjs and hitting the circular-dep undefined-binding problem.
			{ find: 'prop-types', replacement: path.join( __dirname, 'server/stubs/prop-types.mjs' ) },
		],
	},

	plugins: [
		// Stub all CSS/SCSS imports — the server has no use for styles and the
		// Sass preprocessor would fail without the browser-only additionalData prelude.
		// Also stub webpack-style CSS loader imports (!!css-loader!sass-loader!...)
		// that come from packages originally built for webpack.
		{
			name: 'calypso-ignore-css',
			enforce: 'pre' as const,
			resolveId( id: string ) {
				if ( /^!!.*\.(css|scss|sass|less)$/.test( id ) ) {
					return '\0calypso-css-stub';
				}
			},
			load( id: string ) {
				if ( id === '\0calypso-css-stub' ) {
					// Webpack-style CSS loader imports may be used with `import styles from ...`
					// and accessed via `.locals`, so provide a default export of empty object.
					return 'export default {};';
				}
				if ( /\.(css|scss|sass|less)(\?.*)?$/.test( id ) ) {
					return '';
				}
			},
		},

		// Stub browser-only packages that execute browser APIs at import time and
		// cannot be loaded in Node.js.  Intercept via resolveId so they are never
		// externalized and never reach Node.js require().
		{
			name: 'calypso-stub-browser-packages',
			enforce: 'pre' as const,
			resolveId( id: string ) {
				if (
					id === 'lottie-web' ||
					id.startsWith( 'lottie-web/' ) ||
					id === 'smooch' ||
					id === '@wordpress/block-editor' ||
					id === '@automattic/agenttic-ui'
				) {
					return `\0calypso-browser-stub:${ id }`;
				}
				// Subpath import — e.g. @wordpress/block-editor/build-module/...
				if ( id.startsWith( '@wordpress/block-editor/' ) ) {
					return '\0calypso-browser-stub:@wordpress/block-editor/subpath';
				}
			},
			load( id: string ) {
				if (
					id === '\0calypso-browser-stub:lottie-web' ||
					id.startsWith( '\0calypso-browser-stub:lottie-web/' )
				) {
					return 'export default { loadAnimation: () => ({}) };';
				}
				if ( id === '\0calypso-browser-stub:smooch' ) {
					return 'export default {};';
				}
				if ( id === '\0calypso-browser-stub:@wordpress/block-editor' ) {
					// React component stubs + empty objects for non-component exports.
					return [
						'const _c = () => null;',
						'export const BlockCanvas = _c;',
						'export const BlockEditorProvider = _c;',
						'export const BlockIcon = _c;',
						'export const BlockList = _c;',
						'export const BlockToolbar = _c;',
						'export const BlockTools = _c;',
						'export const __unstableEditorStyles = _c;',
						'export const __unstableIframe = _c;',
						'export const store = {};',
						'export const privateApis = {};',
						'export const transformStyles = () => [];',
						'export default {};',
					].join( '\n' );
				}
				if ( id === '\0calypso-browser-stub:@wordpress/block-editor/subpath' ) {
					return 'export const getCompatibilityStyles = () => [];';
				}
				if ( id === '\0calypso-browser-stub:@automattic/agenttic-ui' ) {
					// @automattic/agenttic-ui bundles @automattic/charts which runs CJS
					// factories with require_prop_types() at import time — crashes in Node.
					const _c = 'const _c = () => null;';
					const exports = [
						'AgentUI',
						'AgentUIProvider',
						'ChatInput',
						'CopyIcon',
						'EmptyView',
						'ImageUploader',
						'MessageActions',
						'Notice',
						'ThinkingMessage',
						'ThumbsDownIcon',
						'ThumbsUpIcon',
					].map( ( n ) => `export const ${ n } = _c;` );
					return [
						_c,
						...exports,
						'export const animations = {};',
						'export const createFeedbackActions = () => ({});',
						'export const createMessageRenderer = () => () => null;',
						'export const useInput = () => ({});',
						'export default {};',
					].join( '\n' );
				}
			},
		},

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

		// webpack's require.context() is not available in Vite/Node.  Transform the
		// one usage in server/render/index.js to use import.meta.glob instead.
		{
			name: 'calypso-require-context',
			enforce: 'pre',
			transform( code: string, id: string ) {
				if ( ! id.endsWith( 'server/render/index.js' ) ) {
					return;
				}
				if ( ! code.includes( 'require.context' ) ) {
					return;
				}

				// Replace both the require.context definition and its usage at once.
				// Note: preceding plugins (e.g. OXC JSX transform) may normalise quote
				// styles, so we match both ' and " in the string literals.
				const transformed = code.replace(
					/const requireComponent = require\.context\([^)]+\);\s*\n\s*const component = requireComponent\(\s*['"][./]+['"]\s*\+\s*view\s*\+\s*['"]\.[^'"]+['"]\s*\)\.default;/,
					"const _docMods = import.meta.glob( '/client/document/**/*.jsx', { eager: true } );\n\tconst component = _docMods[ '/client/document/' + view + '.jsx' ]?.default;"
				);
				return { code: transformed, map: null };
			},
		},

		// Non-entry chunks can import rolldown init functions (e.g. init_src$17) and
		// CJS wrappers (e.g. require_config) from server.mjs, but server.mjs also
		// statically imports those chunks, creating a circular ESM dependency.  When a
		// chunk loads during server.mjs initialisation the imported bindings are still
		// undefined (var assignments haven't run yet), causing runtime TypeErrors.
		//
		// Fix 1 — init_* calls: wrap with a typeof guard.  Server.mjs still calls each
		// init function in its own body, so all modules are properly initialised before
		// any request handler runs.
		//
		// Fix 2 — require_* calls with __toESM / direct: replace the top-level eager
		// call with a Proxy whose getter invokes require_*() lazily on first property
		// access (by which time server.mjs is fully initialised).
		//
		// Fix 3 — require_*()("namespace") debug-logger pattern: the result is a
		// callable function, not a plain object, so use a typeof guard with a no-op
		// fallback instead of a Proxy.
		{
			name: 'calypso-guard-circular-inits',
			generateBundle(
				_options: unknown,
				bundle: Record< string, { type: string; isEntry: boolean; code: string } >
			) {
				for ( const [ fileName, chunk ] of Object.entries( bundle ) ) {
					if ( chunk.type !== 'chunk' ) {
						continue;
					}

					// Patch __esmMin in the shared runtime chunk to be retry-safe.
					// Normally __esmMin zeroes fn after the first call (even if the call
					// throws), so a failed circular-dep init can never be re-run.  The
					// retry-safe version resets fn on failure so server.mjs can call the
					// init again once it has fully initialised.  Exceptions are swallowed
					// so the calling chain can continue without crashing.
					chunk.code = chunk.code.replace(
						'var __esmMin = (fn, res) => () => (fn && (res = fn(fn = 0)), res);',
						'var __esmMin = (fn, res) => () => { if (fn) { const _f = fn; fn = 0; try { res = _f(0); } catch(_e) { fn = _f; } } return res; };'
					);

					if ( chunk.isEntry && fileName === 'server.mjs' ) {
						// Reorder the INITIAL consecutive import block so that external
						// imports come before chunk imports.  This ensures packages like
						// lodash-es are evaluated before the chunks that (via circular
						// deps) call functions in server.mjs that depend on those
						// packages.
						//
						// We also inject a __dirname shim right after the import block
						// so that CJS factory closures that reference __dirname (e.g.
						// require_config, assets middleware) can resolve paths correctly.
						// All such source files live exactly 3 levels below the project
						// root, so pointing __dirname at that depth lets their ../../../
						// traversals reach the project root from build/server.mjs.
						//
						// NOTE: rolldown can emit `import` statements mid-file (not just
						// at the top).  We therefore only consider the INITIAL consecutive
						// block of imports at the very start of the entry chunk.  We use
						// array operations (not string.replace) to avoid interpreting `$`
						// sequences in import names as replacement patterns.
						const lines = chunk.code.split( '\n' );
						let lastTopImportIdx = -1;
						for ( let i = 0; i < lines.length; i++ ) {
							if ( /^import /.test( lines[ i ] ) ) {
								lastTopImportIdx = i;
							} else if ( lastTopImportIdx >= 0 ) {
								// First non-import line after the initial import block.
								break;
							}
						}

						if ( lastTopImportIdx >= 0 ) {
							const topImports = lines.slice( 0, lastTopImportIdx + 1 );
							const rest = lines.slice( lastTopImportIdx + 1 );

							const stubs: string[] = [];
							const chunkImports: string[] = [];
							const externals: string[] = [];
							for ( const line of topImports ) {
								const from =
									line.match( /from "([^"]+)"/ )?.[ 1 ] ?? line.match( /"([^"]+)"/ )?.[ 1 ] ?? '';
								if ( from.startsWith( './' ) ) {
									if ( /chunk\.[^/]+\.mjs$/.test( from ) || from === './prop-types.mjs' ) {
										stubs.push( line );
									} else {
										chunkImports.push( line );
									}
								} else {
									externals.push( line );
								}
							}

							chunk.code = [
								...stubs,
								...externals,
								...chunkImports,
								"const __dirname = path.join(import.meta.dirname, '..', 'client', 'server', 'config');",
								...rest,
							].join( '\n' );
						}

						// Section modules bundled via static import use rolldown's lazy
						// __esmMin init system.  Their init_* functions must be called
						// before the module's default export is accessed.  Build a map of
						// exports-variable → init-function by scanning each //#region
						// block, then wrap every section load function accordingly so
						// that `section.load().default(...)` works synchronously.
						const exportInitMap = new Map< string, string >();
						let inRegion = false;
						let regionExports: string | null = null;
						for ( const line of chunk.code.split( '\n' ) ) {
							if ( line.startsWith( '//#region' ) ) {
								inRegion = true;
								regionExports = null;
							} else if ( line.startsWith( '//#endregion' ) ) {
								inRegion = false;
								regionExports = null;
							} else if ( inRegion ) {
								if (
									! regionExports &&
									/^var [\w$]+ = \/\* @__PURE__ \*\/ __exportAll\(/.test( line )
								) {
									const m = line.match( /^var ([\w$]+) = / );
									if ( m ) {
										regionExports = m[ 1 ];
									}
								} else if ( regionExports && /^var init_[\w$]+ = __esmMin\(/.test( line ) ) {
									const m = line.match( /^var (init_[\w$]+) = / );
									if ( m ) {
										exportInitMap.set( regionExports, m[ 1 ] );
										regionExports = null;
									}
								}
							}
						}

						// Wrap: load: () => X, → load: () => (init_Y(), X),
						chunk.code = chunk.code.replace(
							/\bload: \(\) => ([\w$]+),/g,
							( match: string, exportName: string ) => {
								const initFn = exportInitMap.get( exportName );
								return initFn ? `load: () => (${ initFn }(), ${ exportName }),` : match;
							}
						);

						continue;
					}

					// Guard ALL init_*() calls at any indentation level.
					// If the binding is from server.mjs and hasn't been assigned yet
					// (circular dep), typeof returns 'undefined' and the call is skipped.
					// \w + $ covers rolldown names like init_src$17.
					chunk.code = chunk.code.replace(
						/^([\t ]*)(init_[\w$]+)\(\);$/gm,
						( _: string, indent: string, fn: string ) =>
							`${ indent }typeof ${ fn } === 'function' && ${ fn }();`
					);

					// var X = /* @__PURE__ */ __toESM(require_Y());
					chunk.code = chunk.code.replace(
						/^var ([\w$]+) = \/\* @__PURE__ \*\/ __toESM\((require_[\w$]+)\(\)\);$/gm,
						( _: string, varName: string, reqFn: string ) =>
							`var ${ varName } = new Proxy( {}, { get( _, k ) { return __toESM( ${ reqFn }() )[ k ]; } } );`
					);

					// var X = require_Y();  (no __toESM wrapper)
					chunk.code = chunk.code.replace(
						/^var ([\w$]+) = (require_[\w$]+)\(\);$/gm,
						( _: string, varName: string, reqFn: string ) =>
							`var ${ varName } = new Proxy( {}, { get( _, k ) { return ${ reqFn }()[ k ]; } } );`
					);

					// var X = require_Y()("namespace");  (debug logger factory pattern)
					chunk.code = chunk.code.replace(
						/^var ([\w$]+) = (require_[\w$]+)\(\)\(("(?:[^"\\]|\\.)*")\);$/gm,
						( _: string, varName: string, reqFn: string, ns: string ) =>
							`var ${ varName } = typeof ${ reqFn } === 'function' ? ${ reqFn }()( ${ ns } ) : () => {};`
					);
				}
			},
		},
	],

	ssr: {
		// Bundle workspace packages so their calypso:src TypeScript source is included.
		// Also bundle any non-workspace @automattic packages that import CSS — the
		// calypso-ignore-css plugin stubs those imports so Node.js doesn't crash at runtime.
		noExternal: [
			...monorepoPackageNames,
			'@automattic/charts',
			'@automattic/react-virtualized',
			// CJS-only packages that rolldown externalizes with named ESM imports,
			// which Node.js cannot resolve at runtime. Bundling them lets rolldown
			// apply its CJS→ESM interop and avoids ERR_UNSUPPORTED_DIR_IMPORT /
			// "named export not found" errors.
			// @ariakit/react has circular ESM imports that cause an infinite synchronous
			// loop in Node.js. Bundling it forces CJS interop and avoids the hang.
			// @wordpress/components depends on @ariakit/react, so bundle it too.
			// @ariakit/core has subpath imports that are also part of the circular chain.
			'@ariakit/core',
			'@ariakit/react',
			'@ariakit/react-core',
			'@wordpress/components',
			'browser-filesaver',
			'draft-js',
			'gridicons',
			'he',
			'html-to-react',
			'http-proxy-middleware',
			'qs',
			'dom-helpers',
			'qrcode.react',
			'react-day-picker',
			'react-transition-group',
			'redux-dynamic-middlewares',
			'social-logos',
			'valid-url',
		],
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
			input: {
				server: path.join( __dirname, 'server/index.js' ),
				// A standalone entry so rolldown gives prop-types its own chunk file.
				// Non-entry chunks then import PT directly from this file rather than
				// from server.mjs, breaking the circular-dep undefined-binding problem.
				'prop-types': path.join( __dirname, 'server/stubs/prop-types.mjs' ),
			},

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
