// PROTOTYPE (DOTMSD-1670): server-side Vite config shared by variants (c) module runner and
// (e) Rolldown/Vite SSR bundle. Mirrors client/webpack.config.node.js. Throwaway.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const requireCjs = createRequire( import.meta.url );
export const root = path.resolve( import.meta.dirname, '../../..' );
const client = path.join( root, 'client' );
const { packagesInMonorepo } = requireCjs( '../../../build-tools/lib/monorepo' );
const serverConfig = requireCjs( '../config' );

const isDevelopment = serverConfig( 'env' ) === 'development';
const devTarget = process.env.DEV_TARGET || 'evergreen';

// webpack: ignore-loader for styles.
const ignoreCss = {
	name: 'prototype-ignore-css',
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
const fileUrls = {
	name: 'prototype-file-urls',
	enforce: 'pre',
	load( id ) {
		if ( /\.(gif|jpe?g|png|svg|webp|woff2?)$/.test( id ) ) {
			const publicPath = isDevelopment ? `/calypso/${ devTarget }/` : '/calypso/';
			return `export default ${ JSON.stringify( publicPath + 'images/' + path.basename( id ) ) };`;
		}
	},
};

// webpack: sections-loader with useRequire + onlyIsomorphic. Sections are loaded synchronously
// (`section.load().default(...)`), so isomorphic sections become static imports.
const sections = {
	name: 'prototype-sections',
	enforce: 'pre',
	transform( code, id ) {
		if ( id !== path.join( client, 'sections.js' ) ) {
			return;
		}
		const all = requireCjs( path.join( client, 'sections.js' ) );
		const active = serverConfig( 'sections' );
		const enabled = all.filter( ( s ) => {
			if ( ! isDevelopment ) {
				return true;
			}
			return active?.[ s.name ] ?? serverConfig( 'enable_all_sections' );
		} );
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

// webpack: require.context( 'calypso/document', true, /\.jsx$/ ) in server/render.
const requireContext = {
	name: 'prototype-require-context',
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

// Variant (c) only: the module runner evaluates first-party files as ESM, so `require` and
// `module.exports` don't exist. Give every first-party file a real `require` (fine for builtins and
// node_modules, not for `calypso/` aliases), and wrap pure-CJS files so `module.exports` becomes the
// default export. Server graph: 5 pure-CJS files, 6 ESM files with a stray require(), plus
// `__dirname`/`__filename` (webpack `node.__dirname: true`) in 5 more.
export const cjsShim = {
	name: 'prototype-cjs-shim',
	transform( code, id ) {
		if (
			id.includes( '/node_modules/' ) ||
			! /\brequire\s*\(|\bmodule\.exports\b|^exports\.|\b__dirname\b|\b__filename\b/m.test( code )
		) {
			return;
		}
		const prelude = `import { createRequire as __cr } from 'node:module'; const require = __cr( ${ JSON.stringify(
			id
		) } ); const __filename = ${ JSON.stringify( id ) }; const __dirname = ${ JSON.stringify(
			path.dirname( id )
		) };`;
		if ( /^\s*(import|export)\b/m.test( code ) ) {
			return `${ prelude }\n${ code }`;
		}
		// Like webpack's CJS interop, expose module.exports' properties as named exports. Relies on
		// the module runner's `__vite_ssr_exports__` object, so it only works under the runner.
		return `${ prelude } const module = { exports: {} }; const exports = module.exports;\n${ code }\nexport default module.exports;\nfor ( const k of Object.keys( module.exports ) ) if ( k !== 'default' ) Object.defineProperty( __vite_ssr_exports__, k, { enumerable: true, configurable: true, get: () => module.exports[ k ] } );`;
	},
};

export const noExternal = [
	...packagesInMonorepo().map( ( pkg ) => new RegExp( `^${ pkg.name }(/|$)` ) ),
	/^@automattic\/number-formatters(\/|$)/,
	/^calypso\//,
];

export function serverViteConfig() {
	const ssrPrebundle = JSON.parse(
		fs.readFileSync( path.join( import.meta.dirname, 'ssr-prebundle.json' ), 'utf8' )
	);
	return {
		root,
		configFile: false,
		cacheDir: path.join( root, '.cache/vite-server' ),
		logLevel: 'warn',
		appType: 'custom',
		plugins: [ ignoreCss, fileUrls, sections, requireContext ],
		oxc: {
			// Calypso has JSX in .js files.
			include: /\.(m?[jt]sx?)$/,
			exclude: /node_modules/,
			jsx: { runtime: 'automatic', importSource: '@emotion/react' },
		},
		define: {
			BUILD_TIMESTAMP: JSON.stringify( new Date().toISOString() ),
			COMMIT_SHA: JSON.stringify( process.env.COMMIT_SHA ?? '(unknown)' ),
			__i18n_text_domain__: JSON.stringify( 'default' ),
		},
		resolve: {
			alias: [
				{
					find: /^@automattic\/calypso-config$/,
					replacement: path.join( client, 'server/config' ),
				},
				{ find: /^calypso\//, replacement: client + '/' },
			],
			mainFields: [ 'calypso:src', 'module', 'main' ],
			conditions: [ 'calypso:src', 'import', 'module', 'require' ],
			extensions: [ '.json', '.js', '.mjs', '.jsx', '.ts', '.tsx' ],
		},
		ssr: {
			noExternal: [ ...noExternal, ...ssrPrebundle ],
			// Externals imported with named imports that Node's CJS lexer can't see. webpack allows
			// these; under the runner they need pre-bundling to ESM.
			// Pre-bundling only applies to deps that are also noExternal.
			optimizeDeps: { noDiscovery: true, include: ssrPrebundle },
			resolve: {
				conditions: [ 'calypso:src', 'node', 'import', 'module', 'require' ],
				externalConditions: [ 'node' ],
			},
		},
		optimizeDeps: { noDiscovery: true, include: [] },
		server: { middlewareMode: true, hmr: false, ws: false },
	};
}
