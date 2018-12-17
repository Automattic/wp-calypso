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

exports.config = ( { argv: { inputDir, outputDir }, getBaseConfig } ) => {
	const baseConfig = getBaseConfig( {
		cssFilename: '[name].css',
		externalizeWordPressPackages: true,
	} );

	const presetPath = path.join( inputDir, 'index.json' );

	const editorScript = path.join( inputDir, 'editor.js' );
	let viewScripts;

	if ( fs.existsSync( presetPath ) ) {
		const presetIndex = require( presetPath );
		const presetBlocks = get( presetIndex, [ 'production' ], [] );
		const presetBetaBlocks = get( presetIndex, [ 'beta' ], [] );
		const allPresetBlocks = [ ...presetBlocks, ...presetBetaBlocks ];

		// Find all the shared scripts
		const sharedUtilsScripts = sharedScripts( 'shared', inputDir );

		// Helps split up each block into its own folder view script
		viewScripts = allPresetBlocks.reduce( ( viewBlocks, block ) => {
			const viewScriptPath = path.join( inputDir, `${ DIRECTORY_DEPTH }${ block }/view.js` );
			if ( fs.existsSync( viewScriptPath ) ) {
				viewBlocks[ block + '/view' ] = [ ...sharedUtilsScripts, ...[ viewScriptPath ] ];
			}
			return viewBlocks;
		}, {} );
	} else {
		const viewScript = path.join( inputDir, 'view.js' );
		viewScripts = fs.existsSync( viewScript ) ? { view: viewScript } : {};
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
			...viewScripts,
		},
		output: {
			path: outputDir || path.join( inputDir, 'build' ),
			filename: '[name].js',
			libraryTarget: 'window',
		},
		externals: [ ...baseConfig.externals, 'lodash' ],
	};
};
