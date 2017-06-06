'use strict';

/**
 * External Dependencies
 */
var appdmg = require( 'appdmg' );
var path = require( 'path' );
var fs = require( 'fs' );

/**
 * Internal dependencies
 */
var config = require( '../lib/config' );

/**
 * Module variables
 */
var DMG_CONFIG = path.resolve( path.join( 'resource', 'build-config', 'dmg.json' ) );
var targetName;

function getDmgName( name ) {
	return name + '-Installer.dmg';
}

function dmgIt( target ) {
	var dmg = appdmg( { source: DMG_CONFIG, target: target } );

	console.log( '\nPackaging into a DMG' );

	dmg.on( 'progress', function( info ) {
		if ( info.type === 'step-begin' ) {
			console.log( ' - ' + info.current + ' of ' + info.total );
		}
	} );

	dmg.on( 'finish', function() {
		console.log( ' - DMG produced at ' + target );
	} );

	dmg.on( 'error', function( error ) {
		console.log( ' - Failed to produce a DMG', error );
	} );
}

targetName = path.resolve( path.join( 'release', getDmgName( config.name ) ) );

if ( fs.existsSync( targetName ) ) {
	fs.unlinkSync( targetName );
}

dmgIt( targetName );
