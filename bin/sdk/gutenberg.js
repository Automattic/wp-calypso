/** @format */
/**
 * External dependencies
 */

/* eslint import/no-nodejs-modules: ["error", {"allow": ["path", "fs"]}] */
const fs = require( 'fs' );
const path = require( 'path' );

exports.config = ( { argv: { inputDir, outputDir }, getBaseConfig } ) => {
	const baseConfig = getBaseConfig( {
		cssFilename: '[name].css',
		externalizeWordPressPackages: true,
	} );

	const presetPath = path.join( inputDir, 'index.json' );

	let editorScript;
	let viewBlocksScripts;
	let viewScriptEntry;
	if ( fs.existsSync( presetPath ) ) {
		const DIRECETORY_DEPTH = '../../';
		const presetBlocks = require( presetPath );
		// Find all the shared scripts
		const sharedPath = path.join( inputDir, 'shared' );
		const sharedUtilsScripts = fs
			.readdirSync( sharedPath )
			.map( file => path.join( sharedPath, file ) )
			.filter( fullPathToFile => fullPathToFile.endsWith( '.js' ) );

		// Helps split up each block into its own folder view script
		viewBlocksScripts = presetBlocks.reduce( ( viewBlocks, block ) => {
			const viewScriptPath = path.join( inputDir, `${ DIRECETORY_DEPTH }${ block }/view.js` );
			if ( fs.existsSync( viewScriptPath ) ) {
				viewBlocks[ block + '/view' ] = [ ...sharedUtilsScripts, ...[ viewScriptPath ] ];
			}
			return viewBlocks;
		}, {} );

		const sharedEditorPath = path.join( inputDir, 'editor-shared' );
		const sharedEditorUtilsScripts = fs
			.readdirSync( sharedEditorPath )
			.map( file => path.join( sharedEditorPath, file ) )
			.filter( fullPathToFile => fullPathToFile.endsWith( '.js' ) );
		const editorScripts = presetBlocks
			.map( block => path.join( inputDir, `${ DIRECETORY_DEPTH }${ block }/editor.js` ) )
			.filter( fs.existsSync );
		const viewScripts = presetBlocks
			.map( block => path.join( inputDir, `${ DIRECETORY_DEPTH }${ block }/view.js` ) )
			.filter( fs.existsSync );
		// Combines all the different blocks into one editor.js script
		editorScript = [
			...sharedUtilsScripts,
			...sharedEditorUtilsScripts,
			...editorScripts,
			...viewScripts,
		];

		// We explicitly don't create a view.js bundle since all the views are
		// bundled into the editor and also available via the individual folders.
		viewScriptEntry = null;
	} else {
		editorScript = path.join( inputDir, 'editor.js' );
		const viewScript = path.join( inputDir, 'view.js' );
		viewScriptEntry = fs.existsSync( viewScript ) ? { view: viewScript } : {};
	}

	return {
		...baseConfig,
		entry: {
			editor: editorScript,
			...viewScriptEntry,
			...viewBlocksScripts,
		},
		output: {
			path: outputDir || path.join( inputDir, 'build' ),
			filename: '[name].js',
			libraryTarget: 'window',
		},
	};
};
