/** @format */
/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const forEach = require( 'lodash/forEach' );

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
		// Find all the utils scripts
		utilScripts = fs.readdirSync( utilsPath ).map( utilFile => path.join( utilsPath, utilFile ) ).filter( fs.existsSync );

		viewBlocksPoints = {}
		// Helps split up each block into its own folder view script
		forEach( presetBlocks, block => {
				const viewScriptPath = path.join( inputDir, '../../'+ block +'/view.js' );
				if ( fs.existsSync( viewScriptPath ) ) {
					viewBlocksPoints = Object.assign( viewBlocksPoints, { [ block + '/view' ] : utilScripts.concat( [  viewScriptPath ] ) } );
				}
		} );

		editorScripts = presetBlocks.map( block => path.join( inputDir, '../../'+ block +'/editor.js' ) ).filter( fs.existsSync );
		viewScripts = presetBlocks.map( block => path.join( inputDir, '../../'+ block +'/view.js' ) ).filter( fs.existsSync );
		// Combines all the different blocks into one Edit script
		editorScript = utilScripts.concat( editorScripts ).concat( viewScripts );

		// We explicitly don't create a view.js bundle since all the views are
		// bundled into the editor and also available via the individual folders.
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
