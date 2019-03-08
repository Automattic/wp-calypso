/* eslint-disable no-console, import/no-nodejs-modules, no-process-exit */
/**
 * External dependencies
 */
const chalk = require( 'chalk' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const fs = require( 'fs' );
const path = require( 'path' );
const webpack = require( 'webpack' );
const { compact, get } = require( 'lodash' );

const watchMode = process.argv.includes( '--watch' ) | process.argv.includes( '-w' );

function sharedScripts( folderName, inputDir ) {
	const sharedPath = path.join( inputDir, folderName );
	return fs
		.readdirSync( sharedPath )
		.map( file => path.join( sharedPath, file ) )
		.filter( fullPathToFile => fullPathToFile.endsWith( '.js' ) );
}

function blockScripts( type, inputDir, presetBlocks ) {
	return presetBlocks
		.map( block => path.join( inputDir, 'blocks', block, `${ type }.js` ) )
		.filter( fs.existsSync );
}

const getBaseConfig = ( options = {} ) => {
	const getConfig = require( path.join( '..', '..', '..', 'webpack.config.js' ) );
	const config = getConfig( options );

	// these are currently Calypso-specific
	const omitPlugins = [ webpack.HotModuleReplacementPlugin ];

	return {
		...config,
		optimization: {
			splitChunks: false,
		},
		plugins: config.plugins.filter( plugin => ! omitPlugins.includes( plugin.constructor ) ),
	};
};

const makeConfig = () => {
	const baseConfig = getBaseConfig( {
		cssFilename: '[name].css',
		externalizeWordPressPackages: true,
		preserveCssCustomProperties: false,
	} );

	const presetPath = path.join( __dirname, '..', 'src', 'preset', 'index.json' );

	const presetIndex = require( presetPath );
	const presetBlocks = get( presetIndex, [ 'production' ], [] );
	const presetBetaBlocks = get( presetIndex, [ 'beta' ], [] );
	const allPresetBlocks = [ ...presetBlocks, ...presetBetaBlocks ];

	// Find all the shared scripts
	const sharedUtilsScripts = sharedScripts( 'shared', path.join( __dirname, '..', 'src' ) );

	// Helps split up each block into its own folder view script
	const viewBlocksScripts = allPresetBlocks.reduce( ( viewBlocks, block ) => {
		const viewScriptPath = path.join( '..', 'src', 'blocks', block, 'view.js' );
		if ( fs.existsSync( viewScriptPath ) ) {
			viewBlocks[ block + '/view' ] = [ ...sharedUtilsScripts, ...[ viewScriptPath ] ];
		}
		return viewBlocks;
	}, {} );

	// Find all the editor shared scripts
	const sharedEditorUtilsScripts = sharedScripts(
		'editor-shared',
		path.join( __dirname, '..', 'src' )
	);

	// Combines all the different blocks into one editor.js script
	const editorScript = [
		...sharedUtilsScripts,
		...sharedEditorUtilsScripts,
		...blockScripts( 'editor', path.join( __dirname, '..', 'src' ), presetBlocks ),
	];

	// Combines all the different blocks into one editor-beta.js script
	const editorBetaScript = [
		...sharedUtilsScripts,
		...sharedEditorUtilsScripts,
		...blockScripts( 'editor', path.join( __dirname, '..', 'src' ), allPresetBlocks ),
	];

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
			...viewBlocksScripts,
		},
		output: {
			path: path.join( __dirname, '..', 'dist' ),
			filename: '[name].js',
			libraryTarget: 'window',
		},
		externals: [ ...baseConfig.externals, 'lodash' ],
		resolve: {
			...baseConfig.resolve,
			modules: [ 'node_modules' ],
		},
	};
};

function build() {
	const config = makeConfig();
	const compiler = webpack( config );

	// watch takes an additional argument, adjust accordingly
	const runner = f => ( watchMode ? compiler.watch( {}, f ) : compiler.run( f ) );

	runner( ( error, stats ) => {
		if ( error ) {
			console.error( error );
			console.log( chalk.red( 'Failed to build' ) );
			process.exit( 1 );
		}

		console.log( stats.toString() );

		if ( stats.hasErrors() ) {
			console.log( chalk.red( 'Built with errors' ) );
		} else if ( stats.hasWarnings() ) {
			console.log( chalk.yellow( 'Built with warnings' ) );
		} else {
			console.log( chalk.green( 'Built successfully' ) );
		}
	} );
}

build();
