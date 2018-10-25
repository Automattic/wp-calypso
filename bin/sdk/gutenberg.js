/** @format */
/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const reduce = require( 'lodash/reduce' );
const pickBy = require( 'lodash/pickBy' );
const isEmpty = require( 'lodash/isEmpty' );

exports.config = ( { argv: { inputDir, outputDir }, getBaseConfig } ) => {
	const baseConfig = getBaseConfig( {
		cssFilename: '[name].css',
		externalizeWordPressPackages: true,
	} );

	const presetPath = path.join( inputDir, 'index.json' );
	const utilsPath = path.join( inputDir, 'utils' );

	let viewBlocksPoints;
	let viewScriptEntry;
	if ( fs.existsSync( presetPath ) ) {
		const presetBlocks = require( presetPath );

	  // Helps split up each block into its own folder view script
		viewBlocksPoints = reduce( presetBlocks, (obj, block) => ( { [ block + '/view'] : [path.join( inputDir, '../../'+ block +'/view.js' )]  } )  );

		utilScripts = fs.readdirSync( utilsPath ).map( utilFile => path.join( utilsPath, utilFile ) ).filter( fs.existsSync );
		editorScripts = preset.map( block => path.join( inputDir, '../../'+ block +'/editor.js' ) ).filter( fs.existsSync );
		viewScripts = preset.map( block => path.join( inputDir, '../../'+ block +'/view.js' ) ).filter( fs.existsSync );
		// Combines all the different blocks into one Edit script
		editorScript = utilScripts.concat( editorScripts ).concat( viewScripts );

		// Create a all the different View.js scripts into one View script
		if ( ! isEmpty( viewScripts ) ) {
			viewScriptEntry = { view:  utilScripts.concat( viewScripts ) };
		}

	} else {
		const editorScript = path.join( inputDir, 'editor.js' );
		const viewScript = path.join( inputDir, 'view.js' );
		viewScriptEntry = ( fs.existsSync( viewScript ) ? { view: viewScript } : {} );
	}

	return {
		...baseConfig,
		entry: {
			editor: editorScript,
			...viewScriptEntry,
			...viewBlocksPoints
		},
		output: {
			path: outputDir || path.join( inputDir, 'build' ),
			filename: '[name].js',
			libraryTarget: 'window',
		},
	};
};
