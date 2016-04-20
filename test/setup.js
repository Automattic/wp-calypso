/**
 * External dependencies
 */
import head from 'lodash/head';
import last from 'lodash/last';
import mergeWith from 'lodash/mergeWith';
import reduce from 'lodash/reduce';
import tail from 'lodash/tail';

const files = [];

function addFile( file ) {
	files.push( file );
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
	addFile,
	getConfig
};
