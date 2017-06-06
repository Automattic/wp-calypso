/**
 * External Dependencies
 */

const electron = require( 'electron' );
const ipcMain = electron.ipcMain;
const expect = require( 'chai' ).expect;

describe( 'check app loads', function() {
	it( 'should have calypso in DOM', function( done ) {
		ipcMain.on( 'is-calypso-response', function( ev, value ) {
			expect( value ).to.be.true;
			done();
		} );

		require( '../../release/WordPress.com-darwin-x64/WordPress.com.app/Contents/Resources/app/desktop/desktop.js' );
	} );
} );
