'use strict';
/**
 * External Dependencies
 */
var fs = require( 'fs' );
var path = require( 'path' );

function rmdir( filePath ) {
	if ( fs.existsSync( filePath ) ) {
		fs.readdirSync( filePath ).forEach( function( file ) {
			var curPath = filePath + '/' + file;

			if ( fs.lstatSync( curPath ).isDirectory() ) {
				rmdir( curPath );
			} else {
				fs.unlinkSync( curPath );
			}
		} );

		fs.rmdirSync( filePath );
	}
}

function cleanUp( appPath, buildOpts ) {
	var myPath = path.join( appPath, buildOpts.name + '-' + buildOpts.platform );
	var platform = loadPlatform( buildOpts );

	if ( ['darwin', 'mas', 'linux'].indexOf( buildOpts.platform ) !== -1 ) {
		myPath = myPath + '-x64';
	}

	if ( platform.cleaner ) {
		platform.cleaner( myPath, buildOpts );
	}
}

function getIconFile( args ) {
	if ( getPlatform( args ) === 'win32' ) {
		return './resource/image/wordpress.ico';
	}

	return './resource/image/app-icon.icns';
}

function getPlatform( args ) {
	var x;
	for ( x = 2; x < args.length; x++ ) {
		if ( args[x] === 'darwin' || args[x] === 'linux' || args[x] === 'win32' || args[x] === 'mas' ) {
			return args[x];
		}
	}

	return false;
}

function getArch( args ) {
	if ( getPlatform( args ) === 'win32' ) {
		return 'ia32';
	} else if ( getPlatform( args ) === 'linux' ) {
		return 'x64';
	}

	return 'all';
}

function beforeBuild( dirname, options, fn ) {
	// fn( new Error( 'not implemented' ) )
	var platform = loadPlatform( options );
	if ( platform.beforeBuild ) {
		platform.beforeBuild( dirname, options, fn )
	} else {
		fn()
	}
}

function loadPlatform( buildOpts ) {
	if ( buildOpts.platform === 'darwin' || buildOpts.platform === 'mas' ) {
		return require( '../platform/darwin' );
	} else if ( buildOpts.platform === 'win32' ) {
		return require( '../platform/win32' );
	} else if ( buildOpts.platform === 'linux' ) {
		return require( '../platform/linux' );
	}
}

module.exports = {
	rmdir: rmdir,
	getPlatform: getPlatform,
	getIconFile: getIconFile,
	getArch: getArch,
	cleanUp: cleanUp,
	beforeBuild: beforeBuild
};
