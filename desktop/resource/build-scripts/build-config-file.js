'use strict';
/**
 * External Dependencies
 */
var base = require( '../../desktop-config/config-base.json' );
var config = require( process.argv[2] );

// if linux, add icon to mainWindow
if ( ( process.argv.length > 2 ) && ( process.argv[3] == 'linux' ) ) {
	Object.assign( base.mainWindow, { "icon": "/usr/share/pixmaps/wpcom.png" } );
}

Object.assign( base, config );

console.log( JSON.stringify( base, null, 4 ) );
