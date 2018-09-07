/** @format */
/**
 * External dependencies
 */
const path = require( 'path' );

exports.config = ( {
	argv: { editorScript, viewScript, outputDir, outputEditorFile, outputViewFile },
	getBaseConfig,
} ) => {
	const baseConfig = getBaseConfig( {
		cssFilename: '[name].css',
		externalizeWordPressPackages: true,
	} );
	const name = path.basename( path.dirname( editorScript ).replace( /\/$/, '' ) );

	return {
		...baseConfig,
		entry: {
			...( editorScript ? { [ outputEditorFile || `${ name }-editor` ]: editorScript } : {} ),
			...( viewScript ? { [ outputViewFile || `${ name }-view` ]: viewScript } : {} ),
		},
		output: {
			path: outputDir || path.join( path.dirname( editorScript ), 'build' ),
			filename: '[name].js',
			libraryTarget: 'window',
		},
	};
};
