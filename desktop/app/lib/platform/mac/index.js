/**
 * External Dependencies
 */
const { app, Menu } = require( 'electron' );

/**
 * Internal dependencies
 */
const appQuit = require( '../../../lib/app-quit' );
const menuSetter = require( '../../../lib/menu-setter' );
const log = require( '../../../lib/logger' )( 'platform:mac' );

let window;
let dockMenu;

function MacPlatform( appWindow ) {
	window = appWindow.window;
	dockMenu = Menu.buildFromTemplate( require( './dock-menu' )( app, appWindow ) );

	app.dock.setMenu( dockMenu );

	app.on( 'activate', function () {
		window.show();
		window.focus();
	} );

	app.on( 'window-all-closed', function () {
		log.info( 'All windows closed, shutting down' );
		app.quit();
	} );

	app.on( 'before-quit', function () {
		log.info( 'Application quit triggered' );

		appQuit.allowQuit();
	} );

	window.on( 'close', function ( ev ) {
		if ( appQuit.shouldQuitToBackground() ) {
			log.info( `User clicked 'close': hiding main window...` );
			ev.preventDefault();
			window.hide();
			appWindow.view.webContents.send( 'notifications-panel-show', false );
		}
	} );
}

MacPlatform.prototype.restore = function () {
	if ( window.isMinimized() ) {
		window.restore();
	}

	window.show();
};

MacPlatform.prototype.showNotificationsBadge = function ( count, bounce ) {
	const badgeCount = app.getBadgeCount();
	if ( count === badgeCount ) {
		return;
	}

	app.setBadgeCount( count );

	const shouldBounce = bounce && count > badgeCount;
	if ( shouldBounce ) {
		app.dock.bounce();
	}
};

MacPlatform.prototype.clearNotificationsBadge = function () {
	app.setBadgeCount( 0 );
};

MacPlatform.prototype.setDockMenu = function ( enabled ) {
	menuSetter.setRequiresUser( dockMenu, enabled );
};

module.exports = MacPlatform;
