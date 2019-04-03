/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

exports.config = ( { argv: { inputDir, outputDir }, getBaseConfig } ) => {
	const baseConfig = getBaseConfig( {
		cssFilename: '[name].css',
		externalizeWordPressPackages: true,
		preserveCssCustomProperties: false,
	} );

	const editorScript = path.join( inputDir, 'editor.js' );
	const viewScript = path.join( inputDir, 'view.js' );
	const viewScriptEntry = fs.existsSync( viewScript ) ? { view: viewScript } : {};

	return {
		...baseConfig,
		entry: {
			editor: editorScript,
			...viewScriptEntry,
		},
		output: {
			path: outputDir || path.join( inputDir, 'build' ),
			filename: '[name].js',
			libraryTarget: 'window',
		},
		externals: [ ...baseConfig.externals, 'lodash' ],
	};
};
