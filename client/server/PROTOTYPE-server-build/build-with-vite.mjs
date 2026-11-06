// PROTOTYPE (DOTMSD-1670): variant (e), bundle the server with Vite's SSR build (Rolldown) instead
// of webpack. CJS output, like webpack's, so CJS interop and `require()` behave the same. Throwaway.
//
//   CALYPSO_ENV=dashboard-development NODE_ENV=development \
//     node client/server/PROTOTYPE-server-build/build-with-vite.mjs && node build/server-vite.cjs
import path from 'node:path';
import { serverViteConfig, root } from './vite.server.config.mjs';

const t0 = performance.now();
const { build } = await import( 'vite' );

// webpack: `node.__dirname: true` gives the source file's dir relative to the context (repo root).
const dirnameAsSource = {
	name: 'prototype-dirname-as-source',
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

// webpack: IgnoreDynamicImportsPlugin. The server never follows `import()`.
const ignoreDynamicImports = {
	name: 'prototype-ignore-dynamic-imports',
	enforce: 'pre',
	resolveId( source, importer, options ) {
		if ( options.kind === 'dynamic-import' ) {
			return { id: '\0ignored-dynamic-import', moduleSideEffects: false };
		}
		// webpack: externals `calypso/webpack.config` -> `../client/webpack.config.js`.
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

const config = serverViteConfig();
config.plugins.push( dirnameAsSource, ignoreDynamicImports );
config.logLevel = 'warn';
await build( {
	...config,
	build: {
		ssr: path.join( root, 'client/server/index.js' ),
		outDir: path.join( root, 'build' ),
		emptyOutDir: false,
		sourcemap: true,
		minify: false,
		copyPublicDir: false,
		rolldownOptions: {
			output: { format: 'cjs', entryFileNames: 'server-vite.cjs', codeSplitting: false },
		},
	},
} );
console.log( `[prototype] vite ssr build ${ ( performance.now() - t0 ).toFixed( 0 ) }ms` );
