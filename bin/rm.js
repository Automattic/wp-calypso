#!/usr/bin/env node

/**
 * Simple script to remove files. Since this will be use to clean node_modules,
 * it can't have any dependency (except for the Node standard lib).
 *
 * Usage:
 * rm.js folder
 * Will delete "folder" and its contents, or do nothing if it doesn't exist
 * rm.js file.ext
 * Will delete the file, or do nothing if it doesn't exist
 * rm.js folder .ext1 .ext2
 * Will delete all the files inside "folder" that end in the given extensions
 */

const fs = require( 'fs' );

if ( process.argv.length < 3 ) {
	process.exit( 1 );
}

const target = process.argv[ 2 ];
const extensions = process.argv.slice( 3 );

const deleteFolderRecursive = ( path ) => {
	fs.readdirSync( path ).forEach( ( file ) => {
		const curPath = path + '/' + file;
		if( fs.lstatSync( curPath ).isDirectory() ) {
			deleteFolderRecursive( curPath );
		} else {
			fs.unlinkSync( curPath );
		}
	} );
	fs.rmdirSync( path );
};

const deleteFiles = ( path, extensions ) => {
	fs.readdirSync( path ).forEach( ( file ) => {
		if ( extensions
				.map( ( ext ) => file.endsWith( ext ) )
				.filter( Boolean )
				.length ) {
			fs.unlinkSync( path + '/' + file );
		}
	} );
};

if( fs.existsSync( target ) ) {
	if( fs.lstatSync( target ).isDirectory() ) {
		if ( extensions.length ) {
			deleteFiles( target, extensions );
		} else {
			deleteFolderRecursive( target );
		}
	} else {
		fs.unlinkSync( target );
	}
}
