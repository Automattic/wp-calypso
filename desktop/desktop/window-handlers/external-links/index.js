'use strict';

/**
 * External Dependencies
 */
const shell = require( 'electron' ).shell;
const debug = require( 'debug' )( 'desktop:external-links' );

/**
 * Internal dependencies
 */
const Config = require( 'lib/config' );

/**
 * Module variables
 */
const SCALE_NEW_WINDOW_FACTOR = 0.9;
const OFFSET_NEW_WINDOW = 50;

const DONT_INTERCEPT = [
	'^http:\/\/' + Config.server_host,
	'^http:\/\/localhost',
	'^https:\/\/public-api',
	'wordpress\.com\/wp-login\.php'
];

const DONT_OPEN_IN_BROWSER = [
	'^' + Config.server_url,
	'^https://public-api.wordpress.com/connect/'
];

function openInBrowser( event, url ) {
	shell.openExternal( url );
	event.preventDefault();
}

module.exports = function( webContents ) {
	webContents.on( 'will-navigate', function( event, url ) {
		for ( let x = 0; x < DONT_INTERCEPT.length; x++ ) {
			if ( url.match( DONT_INTERCEPT[x] ) ) {
				return;
			}
		}

		debug( 'External link for ' + url );
		openInBrowser( event, url );
	} );

	webContents.on( 'new-window', function( event, url, frameName, disposition, options ) {
		for ( let x = 0; x < DONT_OPEN_IN_BROWSER.length; x++ ) {
			if ( url.match( DONT_OPEN_IN_BROWSER[x] ) ) {
				debug( 'Open in new window for ' + url );

				// When we do open another Electron window make it a bit smaller so we know it's there
				// Having it exactly the same size means we just think the main window has changed page
				options.x = options.x + OFFSET_NEW_WINDOW;
				options.y = options.y + OFFSET_NEW_WINDOW;
				options.width = options.width * SCALE_NEW_WINDOW_FACTOR;
				options.height = options.height * SCALE_NEW_WINDOW_FACTOR;
				return;
			}
		}

		debug( 'Open in new browser for ' + url );
		openInBrowser( event, url );
	} );
};
