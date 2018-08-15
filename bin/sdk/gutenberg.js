/** @format */
/**
 * External dependencies
 */
const path = require( 'path' );

exports.config = ( {
	argv: { editorScript, viewScript, outputDir, outputEditorFile, outputViewFile },
	getBaseConfig,
	__rootDir,
} ) => {
	const baseConfig = getBaseConfig( { externalizeWordPressPackages: true } );
	const name = path.basename( path.dirname( editorScript ).replace( /\/$/, '' ) );

	return {
		...baseConfig,
		...{
			context: __rootDir,
			entry: {
				...( editorScript ? { [ outputEditorFile || `${ name }-editor` ]: editorScript } : {} ),
				...( viewScript ? { [ outputViewFile || `${ name }-view` ]: viewScript } : {} ),
			},
			output: {
				path: outputDir || path.join( path.dirname( editorScript ), 'build' ),
				filename: '[name].js',
				libraryTarget: 'window',
			},
		},
	};
};
