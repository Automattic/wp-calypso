/** @format */

/**
 * External dependencies
 */
const fs = require( 'fs' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const path = require( 'path' );
const { compact, get } = require( 'lodash' );

const DIRECTORY_DEPTH = '../../'; // Relative path of the extensions to preset directory

function sharedScripts( folderName, inputDir ) {
	const sharedPath = path.join( inputDir, folderName );
	return fs
		.readdirSync( sharedPath )
		.map( file => path.join( sharedPath, file ) )
		.filter( fullPathToFile => fullPathToFile.endsWith( '.js' ) );
}

function blockScripts( type, inputDir, presetBlocks ) {
	return presetBlocks
		.map( block => path.join( inputDir, `${ DIRECTORY_DEPTH }${ block }/${ type }.js` ) )
		.filter( fs.existsSync );
}

exports.config = ( { argv: { inputDir, outputDir }, getBaseConfig } ) => {
	const baseConfig = getBaseConfig( {
		cssFilename: '[name].css',
		externalizeWordPressPackages: true,
	} );

	const presetPath = path.join( inputDir, 'index.json' );

	let editorScript;
	let editorBetaScript;
	let viewBlocksScripts;
	let viewScriptEntry;
	let presetBlocks;
	let presetBetaBlocks;

	if ( fs.existsSync( presetPath ) ) {
		const presetIndex = require( presetPath );
		presetBlocks = get( presetIndex, [ 'production' ], [] );
		presetBetaBlocks = get( presetIndex, [ 'beta' ], [] );
		const allPresetBlocks = [ ...presetBlocks, ...presetBetaBlocks ];

		// Find all the shared scripts
		const sharedUtilsScripts = sharedScripts( 'shared', inputDir );

		// Helps split up each block into its own folder view script
		viewBlocksScripts = allPresetBlocks.reduce( ( viewBlocks, block ) => {
			const viewScriptPath = path.join( inputDir, `${ DIRECTORY_DEPTH }${ block }/view.js` );
			if ( fs.existsSync( viewScriptPath ) ) {
				viewBlocks[ block + '/view' ] = [ ...sharedUtilsScripts, ...[ viewScriptPath ] ];
			}
			return viewBlocks;
		}, {} );

		// Find all the editor shared scripts
		const sharedEditorUtilsScripts = sharedScripts( 'editor-shared', inputDir );

		// Combines all the different blocks into one editor.js script
		editorScript = [
			...sharedUtilsScripts,
			...sharedEditorUtilsScripts,
			...blockScripts( 'editor', inputDir, presetBlocks ),
		];

		// Combines all the different blocks into one editor-beta.js script
		editorBetaScript = [
			...sharedUtilsScripts,
			...sharedEditorUtilsScripts,
			...blockScripts( 'editor', inputDir, allPresetBlocks ),
		];

		// We explicitly don't create a view.js bundle since all the views are
		// available via the individual folders.
		viewScriptEntry = null;
	} else {
		editorScript = path.join( inputDir, 'editor.js' );
		const viewScript = path.join( inputDir, 'view.js' );
		viewScriptEntry = fs.existsSync( viewScript ) ? { view: viewScript } : {};
	}

	return {
		...baseConfig,
		plugins: compact( [
			...baseConfig.plugins,
			fs.existsSync( presetPath ) &&
				new CopyWebpackPlugin( [
					{
						from: presetPath,
						to: 'index.json',
					},
				] ),
		] ),
		entry: {
			editor: editorScript,
			...( editorBetaScript && { 'editor-beta': editorBetaScript } ),
			...viewScriptEntry,
			...viewBlocksScripts,
		},
		output: {
			path: outputDir || path.join( inputDir, 'build' ),
			filename: '[name].js',
			libraryTarget: 'window',
		},
		externals: [ ...baseConfig.externals, 'lodash' ],
	};
};
