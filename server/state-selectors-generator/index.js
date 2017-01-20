/**
 * External dependencies
 */
const path = require( 'path' );
const fs = require( 'fs' );
const chokidar = require( 'chokidar' );
const chalk = require( 'chalk' );
const camelCase = require( 'camelcase' );

/**
 * Internal dependencies
 */
const data = require( './data' );

/*
 * Constants
 */
const selectorsGlobalPath = path.normalize( 'client/state/selectors/' );
const indexFileJs = path.join( selectorsGlobalPath, 'index.js' );
const blacklist = /node_modules|\.git|index\.js|README.md|test/;
const encoding = { encoding: 'utf-8' };
const importBasePath = 'state/selectors';
const log = ( ...args ) => console.log( chalk.yellow( 'selectors-generator: ' ).concat( chalk.green( ...args ) ) );

/*
 * Watcher instance
 */
let watcher;

function addFileSelector( file ) {
	log( `adding '${ file }' file selector` );
	generateIndexFile( file );
}

function removeFileSelector( file ) {
	log( `removing '${ file }' file selector` );
	generateIndexFile( file );
}

const buildExportLine = file => {
	const basename = path.basename( file, '.js' );
	return `export ${ camelCase( basename ) } from '${ importBasePath }/${ basename }';`;
};

/*
 * Generate the content of the `index.js` file
 * according to the selectors files.
 */
function generateIndexFile() {
	fs.readdir( selectorsGlobalPath, ( err, files ) => {
		const exportLines = files
			.filter( file => ! blacklist.test( file ) )
			.map( buildExportLine )
			.join( '\n' );

		saveIndexFile( exportLines );
	} );
}

/*
 * Save the given content into the `/index.js` file.
 */
function saveIndexFile( content ) {
	content = '\n'.concat( data.warning, data.readme, content, '\n' );

	fs.writeFile( indexFileJs, content, encoding, ( err ) => {
		if ( err ) {
			return log( chalk.yellow( err ) );
		}

		log( `'${ indexFileJs }' has been updated.` );
	} );
}

exports.init = function() {
	log( 'init' );
	watcher = chokidar.watch( `${ selectorsGlobalPath }/*.js`, {
		ignored: blacklist,
		ignoreInitial: true,
		depth: 0
	} );

	return exports;
};

/*
 * Start the generator process
 */
exports.watch = function() {
	log( 'start to whatch ...' );
	watcher
		.on( 'add', addFileSelector )
		.on( 'unlink', removeFileSelector );
};
