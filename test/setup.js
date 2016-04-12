/**
 * External dependencies
 */
import debugFactory from 'debug';
import head from 'lodash/head';
import last from 'lodash/last';
import mergeWith from 'lodash/mergeWith';
import reduce from 'lodash/reduce';
import tail from 'lodash/tail';

const debug = debugFactory( 'test-runner' ),
	files = [];
let whitelistConfig;

function enableWhitelist() {
	whitelistConfig = require( 'tests.json' );
}

function addFile( file ) {
	if ( whitelistConfig ) {
		const pathParts = tail( file.split( '/' ) );

		if ( ! isFileWhitelisted( whitelistConfig, pathParts ) ) {
			debug( `Skipping file: ${file}.` );
			return;
		}
	}
	files.push( file );
}

function isFileWhitelisted( config, pathParts ) {
	const folder = head( pathParts );

	if ( config[ folder ] ) {
		if ( folder === 'test' && Array.isArray( config[ folder ] ) ) {
			return ( config[ folder ].indexOf( getFileName( pathParts ) ) !== false );
		}

		return isFileWhitelisted( config[ folder ], tail( pathParts ) );
	}

	return false;
}

function getConfig() {
	return reduce( files, ( config, file ) => {
		const fileConfig = fileToConfig( tail( file.split( '/' ) ) );

		return mergeWith( config, fileConfig, ( object, source ) => {
			if ( Array.isArray( object ) ) {
				return object.concat( source );
			}
		} );
	}, {} );
}

function fileToConfig( pathParts, folderConfig = {} ) {
	const folder = head( pathParts );

	if ( folder === 'test' && pathParts.length === 2 ) {
		folderConfig[ folder ] = [ getFileName( pathParts ) ];
	} else {
		folderConfig[ folder ] = fileToConfig( tail( pathParts ) );
	}

	return folderConfig;
}

function getFileName( pathParts ) {
	const [ fileName ] = last( pathParts ).split( '.' );

	return fileName;
}

module.exports = {
	enableWhitelist,
	addFile,
	getConfig
};
