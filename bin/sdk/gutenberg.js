/** @format */
/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

exports.config = ( { argv: { inputDir, outputDir }, getBaseConfig } ) => {
	const baseConfig = getBaseConfig( {
		cssFilename: '[name].css',
		externalizeWordPressPackages: true,
	} );
	const editorScript = path.join( inputDir, 'editor.js' );
	const viewScript = path.join( inputDir, 'view.js' );

	return {
		...baseConfig,
		entry: {
			editor: editorScript,
			...( fs.existsSync( viewScript ) ? { view: viewScript } : {} ),
			...( fs.existsSync( path.join( inputDir, 'view/tiled-gallery.js' ) ) ? { 'tiled-gallery/view' : path.join( inputDir, 'view/tiled-gallery.js' ) } : {} ),
		},
		output: {
			path: outputDir || path.join( inputDir, 'build' ),
			filename: '[name].js',
			libraryTarget: 'window',
		},
	};
};
