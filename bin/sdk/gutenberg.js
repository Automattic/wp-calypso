/** @format */
/**
 * External dependencies
 */
const path = require( 'path' );

const EDITOR_FILENAME = 'editor';
const VIEW_FILENAME = 'view';

exports.config = ( { argv: { inputDir, outputDir }, getBaseConfig } ) => {
	const baseConfig = getBaseConfig( {
		cssFilename: '[name].css',
		externalizeWordPressPackages: true,
	} );
	const editorScript = path.join( inputDir, `${ EDITOR_FILENAME }.js` );
	const viewScript = path.join( inputDir, `${ VIEW_FILENAME }.js` );

	return {
		...baseConfig,
		entry: {
			...( editorScript ? { [ EDITOR_FILENAME ]: editorScript } : {} ),
			...( viewScript ? { [ VIEW_FILENAME ]: viewScript } : {} ),
		},
		output: {
			path: outputDir || path.join( inputDir, 'build' ),
			filename: '[name].js',
			libraryTarget: 'window',
		},
	};
};
