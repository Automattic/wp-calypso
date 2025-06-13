const { build } = require( 'esbuild' );
const { sassPlugin, postcssModules } = require( 'esbuild-sass-plugin' );
const pkg = require( '../package.json' );

const external = [
	// TODO: Think about this. Should some wp deps be peer deps and externalized?
	// Also see: `wpExternals` in `packages/dataviews/build.js`
	// ...Object.keys( pkg.dependencies || {} ).filter( ( dep ) => dep.startsWith( '@wordpress/' ) ),
	...Object.keys( pkg.dependencies || {} ),
	...Object.keys( pkg.peerDependencies || {} ),
];

const commonConfig = {
	entryPoints: [ 'src/index.ts' ],
	bundle: true,
	sourcemap: true,
	minify: process.env.NODE_ENV === 'production',
	external,
	platform: 'neutral',
	mainFields: [ 'calypso:src', 'module', 'main' ],
	conditions: [ 'calypso:src', 'import', 'module', 'require' ],
	logLevel: 'info',
	plugins: [
		sassPlugin( {
			filter: /\.module\.(css|scss)$/,
			embedded: true,
			transform: postcssModules( {
				generateScopedName: ( name, filename, css ) => {
					const hash = require( 'crypto' )
						.createHash( 'md5' )
						.update( filename + css )
						.digest( 'hex' )
						.slice( 0, 5 );
					return `${ name }__${ hash }`;
				},
			} ),
		} ),
	],
	outdir: 'dist',
};

async function buildBundles() {
	await build( {
		...commonConfig,
		format: 'esm',
		splitting: true,
		outdir: 'dist/esm',
	} );

	await build( {
		...commonConfig,
		format: 'cjs',
		splitting: false, // not yet supported for cjs
		outdir: 'dist/cjs',
	} );
}

buildBundles();
