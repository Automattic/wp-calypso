/** @format */
const path = require( 'path' );
const fs = require( 'fs' );
const webpack = require( 'webpack' );

const __rootDir = path.resolve( __dirname, '../../' );
const entryPath = path.resolve( process.argv[ 2 ] );
const sourceDir = path.dirname( entryPath );
const outputDir = path.join( sourceDir, 'build' );
const blockName = path.basename( path.dirname( entryPath ) );

const baseConfig = require( path.join( __rootDir, 'webpack.config.js' ) );

const config = {
	...baseConfig,
	...{
		mode: 'production',
		entry: entryPath,
		externals: {
			...baseConfig.externals,
			wp: 'wp',
		},
		optimization: {
			splitChunks: false,
		},
		output: {
			path: outputDir,
			filename: `blocks-${ blockName }.js`,
			libraryTarget: 'window',
			library: `blocks-${ blockName }`,
		},
	},
};

const funcName = 'gutenberg_register_block_' + blockName.replace( '-', '_' );
const blockRegistration = `<?php
add_action( 'enqueue_block_editor_assets', '${ funcName }' );
function ${ funcName }() {
	wp_enqueue_style(
		'${ blockName }',
		plugins_url( '/blocks/blocks-${ blockName }.css', __FILE__ ),
	);

	wp_enqueue_script(
		'${ blockName }',
		plugins_url( '/blocks/blocks-${ blockName }.js', __FILE__ ),
	);
}
`;

const compiler = webpack( config );

compiler.run(
	( error, stats ) => {
		console.log( stats.toString() );
		fs.writeFileSync( path.join( outputDir, `blocks-${ blockName }.php` ), blockRegistration );
	}
);
