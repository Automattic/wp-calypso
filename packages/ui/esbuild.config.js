// eslint-disable-next-line import/no-extraneous-dependencies
const { build } = require( 'esbuild' );
// eslint-disable-next-line import/no-extraneous-dependencies
const { sassPlugin } = require( 'esbuild-sass-plugin' );
const pkg = require( './package.json' );

const external = [
	// TODO: Think about this. Should this mean they should be peer deps?
	// Also see: `wpExternals` in `packages/dataviews/build.js`
	...Object.keys( pkg.dependencies || {} ).filter( ( dep ) => dep.startsWith( '@wordpress/' ) ),
	...Object.keys( pkg.peerDependencies || {} ),
];

const commonConfig = {
	entryPoints: [ 'src/index.ts' ],
	bundle: true,
	sourcemap: true,
	minify: process.env.NODE_ENV === 'production',
	external,
	platform: 'neutral',
	logLevel: 'info',
	plugins: [
		sassPlugin( {
			embedded: true,
			sourceMap: true,
			type: 'css',
		} ),
	],
	outdir: 'dist',
	loader: {
		'.scss': 'css',
		'.css': 'css',
	},
};

async function buildBundles() {
	// Build ESM with CSS
	await build( {
		...commonConfig,
		format: 'esm',
		splitting: true,
		outdir: 'dist/esm',
	} );

	// Build CJS with CSS
	await build( {
		...commonConfig,
		format: 'cjs',
		splitting: false, // not yet supported for cjs
		outdir: 'dist/cjs',
	} );
}

buildBundles();
