'use strict';
/**
 * External Dependencies
 */
var path = require( 'path' );
var exec = require( 'child_process' ).execSync;
var spellchecker = require( '../lib/spellchecker' )
var fs = require( 'fs-extra' );

/**
 * Internal dependencies
 */
var builder = require( '../lib/tools' );

function cleanBuild( appPath, buildOpts ) {
	var appPath = appPath + '-' + buildOpts.arch;
	var calypsoModules = path.join( appPath, 'resources', 'app', 'calypso', 'node_modules' );
	var files = [
		'resources/default_app/package.json',
		'resources/default_app/main.js'
	];

	console.log( 'Cleaning the Windows build' );

	console.log( 'Renaming app files' );
	for ( var i in files ) {
		var file = path.join( appPath, files[i] );
		exec( "/usr/bin/sed -i '' 's/Electron/" + buildOpts.name + "/' '" + file + "'" );
	}

	console.log( ' - Removing default app' );
	builder.rmdir( path.join( appPath, 'resources', 'default_app' ) );
}

module.exports = {
	cleaner: function() { /* noop */ }, // cleanBuild,
	//beforeBuild: spellchecker.bind( null, 'http://automattic.github.io/wp-desktop/deps/spellchecker-win32-v3.2.3-electron-v0.36.8.zip' )
}
