/**
 * External Dependencies
 */

const { ipcMain } = require( 'electron' );
const { expect } = require( 'chai' );

/**
 * Internal dependencies
 */
const boot = require( '../desktop/app' );

process.chdir( process.env.CALYPSO_PATH );

describe( 'check app loads', function () {
	it( 'should have calypso in DOM', function () {
		return new Promise( ( done ) => {
			boot( function ( mainWindow ) {
				// We need to wait for the page to load before sending the request
				mainWindow.webContents.on( 'did-finish-load', function () {
					mainWindow.webContents.send( 'is-calypso' );
				} );

				ipcMain.on( 'is-calypso-response', function ( ev, value ) {
					expect( value ).to.be.true;
					done();
				} );
			} );
		} );
	} );
} );
