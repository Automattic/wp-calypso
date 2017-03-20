'use strict';

/**
 * External Dependencies
 */
var path = require( 'path' );
var fs = require( 'fs' );
var cp = require( 'child_process' );
var minimist = require('minimist');

/**
 * Internal dependencies
 */
var win32package = require( '../build-config/win32-package.json' );
var config = require( '../lib/config' );

// hard coded path and setup file to sign
var topDir = path.dirname( path.dirname( __dirname ) );
var setupFile = path.join( topDir, 'release/' + config.name + '-' + config.version + '-Setup.exe' );

var scriptname = path.basename( process.argv[1] );
var argv = minimist(process.argv.slice(2));
var spcFile = argv.spc; // passed in via Makefile
var pvkFile = argv.pvk; // passed in via Makefile

// confirm certificate variables passed in
if ( ( spcFile == undefined ) || ( pvkFile == undefined ) ) {
	console.log('Certificate files not specified.');
	console.log('Use: '+scriptname+' --spc=/path/cert.spc --pvk=/path/cert.pvk ');
	process.exit();
}

console.log( 'Signing installer...' );

// confirm files exist
if ( ! fs.existsSync( setupFile ) ) {
	console.log( 'File not found: ' + setupFile );
	console.log( 'Setup.exe file does not exist. Did you run `make package-win32` first?' );
	process.exit();
}

// confirm files exist
if ( ! fs.existsSync( spcFile ) || ! fs.existsSync( pvkFile ) ) {
	console.log( 'Certificate file not found: ' + spcFile + ' or ' + pvkFile );
	console.log( 'You need to see install valid code signing certificates.' );
	process.exit();
}

// confirm signcode exe
cp.exec( 'which signcode', function( error ) {
	var cmd = 'signcode -a sha1 -t http://timestamp.digicert.com/ -spc ' + spcFile + ' -v ' + pvkFile + " -n '" + win32package.description + "' " + setupFile;

	if ( error ) {
		console.log( '`signcode` command not found. Install Mono tool using `brew install mono`' )
		process.exit();
	}

	// sign it
	cp.execSync( cmd, { stdio: 'inherit' } );
} );
