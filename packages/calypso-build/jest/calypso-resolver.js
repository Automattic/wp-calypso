/**
 * External dependencies
 */
const fs = require( 'fs' ); // eslint-disable-line import/no-nodejs-modules
const resolve = require( 'resolve' );

module.exports = function calypsoResolver( path, options ) {
	const result = resolve.sync( path, {
		basedir: options.basedir,
		extensions: options.extensions,
		isDirectory,
		isFile,
		moduleDirectory: options.moduleDirectory,
		paths: options.paths,
		preserveSymlinks: false,
		realpathSync,
		packageFilter,
	} );

	return realpathSync( result );
};

function packageFilter( pkg ) {
	const calypsoMainField = pkg[ 'calypso:main' ];
	if ( calypsoMainField ) {
		pkg.main = calypsoMainField;
	}
	return pkg;
}

const checkedPaths = new Map();
function statSyncCached( path ) {
	const result = checkedPaths.get( path );
	if ( result !== undefined ) {
		return result;
	}

	let stat;
	try {
		stat = fs.statSync( path );
	} catch ( e ) {
		if ( ! ( e && ( e.code === 'ENOENT' || e.code === 'ENOTDIR' ) ) ) {
			throw e;
		}
	}

	if ( stat ) {
		if ( stat.isFile() || stat.isFIFO() ) {
			checkedPaths.set( path, 'f' );
			return 'f';
		} else if ( stat.isDirectory() ) {
			checkedPaths.set( path, 'd' );
			return 'd';
		}
	}

	checkedPaths.set( path, 'o' );
	return 'o';
}

const checkedRealpathPaths = new Map();
function realpathCached( path ) {
	let result = checkedRealpathPaths.get( path );

	if ( result !== undefined ) {
		return result;
	}

	result = path;
	try {
		result = fs.realpathSync.native( path );
	} catch ( error ) {
		if ( error.code !== 'ENOENT' ) {
			throw error;
		}
	}

	checkedRealpathPaths.set( path, result );

	if ( path !== result ) {
		// also cache the result in case it's ever referenced directly - no reason to `realpath` that as well
		checkedRealpathPaths.set( result, result );
	}

	return result;
}

function isFile( file ) {
	return statSyncCached( file ) === 'f';
}

function isDirectory( dir ) {
	return statSyncCached( dir ) === 'd';
}

function realpathSync( file ) {
	return realpathCached( file );
}
