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
	exports.generateSelectorFile( file, exports.generateIndexFile );
}

function removeFileSelector( file ) {
	log( `removing '${ file }' file selector` );
	exports.generateIndexFile( file );
}

const methodNameFromFilePath = filePath => camelCase( path.basename( filePath, '.js' ) );

const buildExportLine = file => {
	const basename = path.basename( file, '.js' );
	return `export ${ camelCase( basename ) } from '${ importBasePath }/${ basename }';`;
};

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

exports.generateSelectorFile = ( filePath, fn ) => {
	log( `checking aytogeneration of ${ filePath } file` );

	fs.readFile( filePath, encoding, ( error, fileContent ) => {
		if ( error ) {
			fn( filePath );
			return log( `Error reading ${ filePath } file.` );
		}

		if ( fileContent.length ) {
			fn( filePath );
			return log( `File '${ filePath }'' is not empty. Ignoring autogeneration ...` );
		}

		const content = data.generateSelectorFileContent( methodNameFromFilePath( filePath ) );

		fs.writeFile( filePath, content, encoding, ( writeError ) => {
			if ( writeError ) {
				fn( filePath );
				return log( `Error trying to save ${ filePath } file.` );
			}

			fn( filePath );
			log( `'${ filePath }' has been generated.` );
		} );
	} );
};

/*
 * Generate the content of the `index.js` file
 * according to the selectors files.
 */
exports.generateIndexFile = () => {
	fs.readdir( selectorsGlobalPath, ( err, files ) => {
		const exportLines = files
			.filter( file => ! blacklist.test( file ) )
			.map( buildExportLine )
			.join( '\n' );

		saveIndexFile( exportLines );
	} );
};

exports.init = () => {
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
