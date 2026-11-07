// PROTOTYPE (DOTMSD-1675): overlay for the dev Node server's SSR build (DOTMSD-1670). Mirrors
// client/webpack.config.node.js. Production keeps webpack. Throwaway.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { mergeConfig } from 'vite';
import { CALYPSO_SRC, calypsoBase, client, root } from './base.mjs';

const require = createRequire( import.meta.url );
const { packagesInMonorepo } = require( '../lib/monorepo' );

// webpack: ignore-loader for styles.
const ignoreCss = {
	name: 'calypso-server-ignore-css',
	enforce: 'pre',
	resolveId( id ) {
		if ( /\.(sc|sa|c)ss(\?.*)?$/.test( id ) || id.includes( '!css-loader!' ) ) {
			return '\0ignored-css';
		}
	},
	load( id ) {
		if ( id === '\0ignored-css' ) {
			return 'export default {};';
		}
	},
};

// webpack: file-loader with emitFile: false. Only the URL is needed on the server.
function fileUrls( publicPath ) {
	return {
		name: 'calypso-server-file-urls',
		enforce: 'pre',
		load( id ) {
			if ( /\.(gif|jpe?g|png|svg|webp|woff2?)$/.test( id ) ) {
				// PROTOTYPE (DOTMSD-1682): the Vite client's URL for the same import, so markup hydrates.
				if ( publicPath === 'vite-source' ) {
					const rel = path.relative( root, id.replace( /[?#].*$/, '' ) );
					return `export default ${ JSON.stringify( rel.startsWith( '..' ) ? '/@fs' + id : '/' + rel ) };`;
				}
				return `export default ${ JSON.stringify( publicPath + 'images/' + path.basename( id ) ) };`;
			}
		},
	};
}

// webpack: sections-loader with useRequire + onlyIsomorphic. The server loads sections
// synchronously, so isomorphic sections become static imports.
function isomorphicSections( { isEnabled } ) {
	return {
		name: 'calypso-server-sections',
		enforce: 'pre',
		transform( code, id ) {
			if ( id !== path.join( client, 'sections.js' ) ) {
				return;
			}
			const enabled = require( path.join( client, 'sections.js' ) ).filter( isEnabled );
			const imports = [];
			const entries = enabled.map( ( s, i ) => {
				if ( ! s.isomorphic ) {
					return JSON.stringify( s );
				}
				imports.push( `import * as section${ i } from ${ JSON.stringify( s.module ) };` );
				return JSON.stringify( s ).replace( /}$/, `, "load": () => section${ i } }` );
			} );
			return `${ imports.join( '\n' ) }\nexport default [\n${ entries.join( ',\n' ) }\n];`;
		},
	};
}

// webpack: require.context( 'calypso/document', true, /\.jsx$/ ) in server/render.
const documentContext = {
	name: 'calypso-server-document-context',
	enforce: 'pre',
	transform( code, id ) {
		if ( id !== path.join( client, 'server/render/index.js' ) ) {
			return;
		}
		return code.replace(
			/require\.context\(\s*'calypso\/document',\s*true,\s*\/\\\.jsx\$\/\s*\)/,
			`( ( docs ) => ( p ) => docs[ p ] )( import.meta.glob( '/client/document/**/*.jsx', { eager: true, base: '/client/document/' } ) )`
		);
	},
};

// webpack: `node.__dirname: true` gives the source file's dir relative to the context (repo root).
const dirnameAsSource = {
	name: 'calypso-server-dirname',
	transform( code, id ) {
		if ( id.includes( '/node_modules/' ) || ! /\b__(dirname|filename)\b/.test( code ) ) {
			return;
		}
		const rel = path.relative( root, id );
		return code
			.replace( /\b__dirname\b/g, JSON.stringify( path.dirname( rel ) ) )
			.replace( /\b__filename\b/g, JSON.stringify( rel ) );
	},
};

// webpack: IgnoreDynamicImportsPlugin (the server never follows `import()`), plus the
// `calypso/webpack.config` external.
const ignoreDynamicImports = {
	name: 'calypso-server-ignore-dynamic-imports',
	enforce: 'pre',
	resolveId( source, importer, options ) {
		if ( options.kind === 'dynamic-import' ) {
			return { id: '\0ignored-dynamic-import', moduleSideEffects: false };
		}
		if ( /(^calypso|\/client)\/webpack\.config(\.js)?$/.test( source ) ) {
			return { id: '../client/webpack.config.js', external: true };
		}
	},
	load( id ) {
		if ( id === '\0ignored-dynamic-import' ) {
			return 'export default undefined;';
		}
	},
};

/**
 * @param {object}   options
 * @param {string}   options.publicPath  Where the client's images are served from.
 * @param {Function} options.isEnabled   Section filter, from the server config.
 * @param {string[]} options.prebundle   Externals that need bundling (named imports Node's CJS lexer can't see).
 * @returns {import('vite').UserConfig}
 */
export function serverOverlay( { publicPath, isEnabled, prebundle = [] } ) {
	return {
		cacheDir: path.join( root, '.cache/vite-server' ),
		logLevel: 'warn',
		appType: 'custom',
		plugins: [
			ignoreCss,
			fileUrls( publicPath ),
			isomorphicSections( { isEnabled } ),
			documentContext,
			dirnameAsSource,
			ignoreDynamicImports,
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
				...prebundle,
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

export function devServerBuildConfig() {
	const serverConfig = require( path.join( client, 'server/config' ) );
	const isDevelopment = serverConfig( 'env' ) === 'development';
	const sections = serverConfig( 'sections' );
	const prebundle = JSON.parse(
		fs.readFileSync(
			path.join( client, 'server/PROTOTYPE-server-build/ssr-prebundle.json' ),
			'utf8'
		)
	);
	return mergeConfig(
		calypsoBase(),
		serverOverlay( {
			// PROTOTYPE (DOTMSD-1682): this build only ever runs next to the Vite client.
			publicPath:
				process.env.CALYPSO_VITE_IMAGE_URLS === 'webpack'
					? `/calypso/${ process.env.DEV_TARGET || 'evergreen' }/`
					: 'vite-source',
			isEnabled: ( s ) =>
				! isDevelopment || ( sections?.[ s.name ] ?? serverConfig( 'enable_all_sections' ) ),
			prebundle,
		} )
	);
}
