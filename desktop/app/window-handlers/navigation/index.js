const { ipcMain, shell, systemPreferences } = require( 'electron' );
const ipc = require( '../../lib/calypso-commands' );
const Config = require( '../../lib/config' );
const isCalypso = require( '../../lib/is-calypso' );
const log = require( '../../lib/logger' )( 'desktop:navigation' );
const session = require( '../../lib/session' );

const webBase = Config.baseURL();

module.exports = function ( { view, window } ) {
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
		if ( session.isLoggedIn() ) {
			if ( isCalypso( view ) ) {
				ipc.showMySites( view );
			} else {
				view.webContents.loadURL( webBase + 'stats/day' );
			}
		} else {
			view.webContents.loadURL( Config.loginURL() );
		}
	} );

	ipcMain.on( 'magic-link-set-password', () => {
		shell.openExternal( 'https://wordpress.com/me/security' );
	} );

	if ( process.platform === 'darwin' ) {
		ipcMain.on( 'title-bar-double-click', () => {
			const action = systemPreferences.getUserDefault( 'AppleActionOnDoubleClick', 'string' );
			if ( action === 'None' ) {
				return;
			}
			if ( action === 'Minimize' ) {
				return window.minimize();
			}
			if ( window.isMaximized() ) {
				return window.unmaximize();
			}
			return window.maximize();
		} );
	}
};
