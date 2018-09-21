/** @format */
/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
//TODO: DO NOT MERGE - TEMP FOR SANITY
exports.config = ( { argv: { inputDir, outputDir }, getBaseConfig } ) => {
	const baseConfig = getBaseConfig( {
		cssFilename: 'o2-[name].css',
		externalizeWordPressPackages: true,
	} );
	const editorScript = path.join( inputDir, 'editor.js' );
	const viewScript = path.join( inputDir, 'view.js' );

	return {
		...baseConfig,
		entry: {
			editor: editorScript,
			...( fs.existsSync( viewScript ) ? { view: viewScript } : {} ),
		},
		output: {
			path: outputDir || path.join( inputDir, 'build' ),
			filename: 'o2-[name].js',
			libraryTarget: 'window',
		},
	};
};
