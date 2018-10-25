/** @format */
/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const reduce = require( 'lodash/reduce' );
const pickBy = require( 'lodash/pickBy' );

exports.config = ( { argv: { inputDir, outputDir }, getBaseConfig } ) => {
	const baseConfig = getBaseConfig( {
		cssFilename: '[name].css',
		externalizeWordPressPackages: true,
	} );

	const presetPath = path.join( inputDir, 'index.json' );
	const utilsPath = path.join( inputDir, 'utils' );

	const editorScript = path.join( inputDir, 'editor.js' );
	const viewScript = path.join( inputDir, 'view.js' );

	let viewBlocksPoints;
	if ( fs.existsSync( presetPath ) ) {
		const preset = require( presetPath );
		viewBlocksPoints = pickBy( reduce( preset, (obj, block) => ( { [ block + '/view'] : path.join( inputDir, '../../'+ block +'/view.js' ) } )  ), fs.existsSync );
	}
	return {
		...baseConfig,
		entry: {
			editor: editorScript,
			...(fs.existsSync( viewScript ) ? { view: viewScript } : {} ),
			...viewBlocksPoints,
		},
		output: {
			path: outputDir || path.join( inputDir, 'build' ),
			filename: '[name].js',
			libraryTarget: 'window',
		},
	};
};
