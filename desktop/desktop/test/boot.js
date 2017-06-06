/**
 * External Dependencies
 */

const electron = require( 'electron' );
const ipcMain = electron.ipcMain;
const expect = require( 'chai' ).expect;

/**
 * Internal dependencies
 */
const boot = require( '../app' );

process.chdir( process.env.DESKTOP_APP_PATH );

describe( 'check app loads', function() {
	it( 'should have calypso in DOM', function( done ) {
		boot( function( mainWindow ) {
			// We need to wait for the page to load before sending the request
			mainWindow.webContents.on( 'did-finish-load', function() {
				mainWindow.webContents.send( 'is-calypso' );
			} );

			ipcMain.on( 'is-calypso-response', function( ev, value ) {
				expect( value ).to.be.true;
				done();
			} );
		} );
	} );
} );
