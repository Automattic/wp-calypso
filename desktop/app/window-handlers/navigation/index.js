/**
 * External Dependencies
 */
const { ipcMain } = require( 'electron' );
const Config = require( '../../lib/config' );
const isCalypso = require( '../../lib/is-calypso' );
const ipc = require( '../../lib/calypso-commands' );

const webBase = Config.baseURL();

/**
 * Internal dependencies
 */
const log = require( '../../lib/logger' )( 'desktop:navigation' );

module.exports = function ( { view } ) {
	ipcMain.on( 'back-button-clicked', () => {
		log.info( `User clicked 'go back'...` );
		view.webContents.goBack();
	} );

	ipcMain.on( 'forward-button-clicked', () => {
		log.info( `User clicked 'go forward'...` );
		view.webContents.goForward();
	} );

	ipcMain.on( 'home-button-clicked', () => {
		log.info( `User clicked 'go home'...` );
		if ( isCalypso( view ) ) {
			ipc.showMySites( view );
		} else {
			view.webContents.loadURL( webBase + 'stats/day' );
		}
	} );
};
