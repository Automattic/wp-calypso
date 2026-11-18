import { createRequire } from 'node:module';
import path from 'node:path';
import { mergeConfig } from 'vite';
import { CALYPSO_SRC, calypsoBase, client, root } from './base.mjs';

const requireCjs = createRequire( import.meta.url );
const { packagesInMonorepo } = requireCjs( '../lib/monorepo' );

const sectionsFile = path.join( client, 'sections.js' );

/**
 * Like webpack's `ignore-loader` for styles: the server never needs them.
 * @returns {import('vite').Plugin}
 */
function ignoreCss() {
	return {
		name: 'calypso-server-ignore-css',
		enforce: 'pre',
		resolveId( id ) {
			if ( /\.(sc|sa|c)ss(\?.*)?$/.test( id ) ) {
				return '\0calypso-ignored-css';
			}
		},
		load( id ) {
			if ( id === '\0calypso-ignored-css' ) {
				return 'export default {};';
			}
		},
	};
}

/**
 * Like webpack's file-loader with `emitFile: false`. The server only needs the URL. The Vite dev
 * server serves images from their source path, so that's the URL.
 * @returns {import('vite').Plugin}
 */
function fileUrls() {
	return {
		name: 'calypso-server-file-urls',
		enforce: 'pre',
		load( id ) {
			if ( /\.(gif|jpe?g|png|svg|webp|woff2?)$/.test( id ) ) {
				return `export default ${ JSON.stringify( '/' + path.relative( root, id ) ) };`;
			}
		},
	};
}

/**
 * Like `build-tools/webpack/sections-loader.js` with `useRequire` and `onlyIsomorphic`: the server
 * loads sections synchronously, so isomorphic sections become static imports.
 * @param {(section: Object) => boolean} isEnabled
 * @returns {import('vite').Plugin}
 */
function isomorphicSections( isEnabled ) {
	return {
		name: 'calypso-server-sections',
		enforce: 'pre',
		transform( code, id ) {
			if ( id !== sectionsFile ) {
				return;
			}
			delete requireCjs.cache[ sectionsFile ];
			const imports = [];
			const sections = requireCjs( sectionsFile )
				.filter( isEnabled )
				.map( ( section, i ) => {
					if ( ! section.isomorphic ) {
						return JSON.stringify( section );
					}
					imports.push( `import * as section${ i } from ${ JSON.stringify( section.module ) };` );
					return JSON.stringify( section ).replace( /}$/, `, "load": () => section${ i } }` );
				} );
			return {
				code: `${ imports.join( '\n' ) }\nexport default [\n${ sections.join( ',\n' ) }\n];`,
				map: null,
			};
		},
	};
}

/**
 * Replaces `require.context( 'calypso/document', true, /\.jsx$/ )` in `server/render`.
 * @returns {import('vite').Plugin}
 */
function documentContext() {
	const renderFile = path.join( client, 'server/render/index.js' );
	return {
		name: 'calypso-server-document-context',
		enforce: 'pre',
		transform( code, id ) {
			if ( id !== renderFile ) {
				return;
			}
			const replaced = code.replace(
				/require\.context\(\s*'calypso\/document',\s*true,\s*\/\\\.jsx\$\/\s*\)/,
				"( ( docs ) => ( p ) => docs[ p ] )( import.meta.glob( '/client/document/**/*.jsx', { eager: true, base: '/client/document/' } ) )"
			);
			if ( replaced === code ) {
				this.error( 'the require.context() call for client/document has changed' );
			}
			return { code: replaced, map: null };
		},
	};
}

/**
 * Like webpack's `node.__dirname: true`: the source file's folder, relative to the repo root.
 * @returns {import('vite').Plugin}
 */
function dirnameAsSource() {
	return {
		name: 'calypso-server-dirname',
		enforce: 'pre',
		transform( code, id ) {
			if ( id.includes( '/node_modules/' ) || ! /\b__(dirname|filename)\b/.test( code ) ) {
				return;
			}
			const relative = path.relative( root, id );
			return {
				code: code
					.replace( /\b__dirname\b/g, JSON.stringify( path.dirname( relative ) ) )
					.replace( /\b__filename\b/g, JSON.stringify( relative ) ),
				map: null,
			};
		},
	};
}

/**
 * Like the webpack server build's `IgnoreDynamicImportsPlugin` (the server never follows `import()`)
 * and its `calypso/webpack.config` external.
 * @returns {import('vite').Plugin}
 */
function ignoreDynamicImports() {
	return {
		name: 'calypso-server-ignore-dynamic-imports',
		enforce: 'pre',
		resolveId( source, importer, options ) {
			if ( options.kind === 'dynamic-import' ) {
				return { id: '\0calypso-ignored-dynamic-import', moduleSideEffects: false };
			}
			// Aliases have run by now, so `calypso/` is already `client/`.
			if ( /\/client\/webpack\.config(\.js)?$/.test( source ) ) {
				return { id: '../client/webpack.config.js', external: true };
			}
		},
		load( id ) {
			if ( id === '\0calypso-ignored-dynamic-import' ) {
				return 'export default undefined;';
			}
		},
	};
}

/**
 * The Node server's build for the Vite dev server, mirroring `client/webpack.config.node.js`.
 * Production still builds the server with webpack.
 * @param {Object} options
 * @param {(section: Object) => boolean} options.isSectionEnabled
 * @returns {import('vite').UserConfig}
 */
export function serverOverlay( { isSectionEnabled } ) {
	return {
		cacheDir: path.join( root, '.cache/vite-server' ),
		logLevel: 'warn',
		appType: 'custom',
		plugins: [
			ignoreCss(),
			fileUrls(),
			isomorphicSections( isSectionEnabled ),
			documentContext(),
			dirnameAsSource(),
			ignoreDynamicImports(),
		],
		define: {
			BUILD_TIMESTAMP: JSON.stringify( new Date().toISOString() ),
			COMMIT_SHA: JSON.stringify( process.env.COMMIT_SHA ?? '(unknown)' ),
		},
		resolve: {
			alias: [
				{
					find: /^@automattic\/calypso-config$/,
					replacement: path.join( client, 'server/config' ),
				},
			],
			mainFields: [ CALYPSO_SRC, 'module', 'main' ],
			extensions: [ '.json', '.js', '.mjs', '.jsx', '.ts', '.tsx' ],
		},
		ssr: {
			noExternal: [
				...packagesInMonorepo().map( ( pkg ) => new RegExp( `^${ pkg.name }(/|$)` ) ),
				/^@automattic\/number-formatters(\/|$)/,
				/^calypso\//,
				// Named imports from these CommonJS packages that Node's CJS lexer can't see.
				'he',
				'react-router-dom',
				'redux-dynamic-middlewares',
				'prop-types',
			],
			resolve: {
				conditions: [ CALYPSO_SRC, 'node', 'import', 'module', 'require' ],
				externalConditions: [ 'node' ],
			},
		},
		build: {
			ssr: path.join( client, 'server/index.js' ),
			outDir: path.join( root, 'build' ),
			emptyOutDir: false,
			sourcemap: true,
			minify: false,
			copyPublicDir: false,
			rolldownOptions: {
				output: { format: 'cjs', entryFileNames: 'server-vite.cjs', codeSplitting: false },
			},
		},
	};
}

/**
 * Must run after `CALYPSO_ENV` is set: it reads the server config.
 * @returns {import('vite').UserConfig}
 */
export function devServerBuildConfig() {
	const serverConfig = requireCjs( path.join( client, 'server/config' ) );
	const sections = serverConfig( 'sections' ) ?? {};
	return mergeConfig(
		{ ...calypsoBase(), mode: 'development' },
		serverOverlay( {
			isSectionEnabled: ( section ) =>
				sections[ section.name ] ?? serverConfig( 'enable_all_sections' ),
		} )
	);
}
