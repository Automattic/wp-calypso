#!/usr/bin/env node

var exec = require( 'child_process' ).exec;
var semver = require( 'semver' );

function listPublishableModules() {
	var command = 'find client -type f -print | grep \'package.json\'';
	exec( command, function( error, stdout ) {
		stdout.split( /\s+/ ).forEach( function( modulePath ) {
			var pj
			if ( !modulePath ) {
				return;
			}
			pj = require( modulePath );
			if ( !pj.private ) {
				requiresUpdate( pj, modulePath );
			}
		} );
	} );
}

function requiresUpdate( pj, modulePath ) {
	exec( 'npm view ' + pj.name + ' version', function( error, stdout ) {
		if ( stdout && semver.gt( pj.version, stdout ) ) {
			console.log( pj.name, '---> ', modulePath.replace( /package.json/i, '' ) );
		}
	} );
};

listPublishableModules();
