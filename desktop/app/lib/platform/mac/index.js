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

function MacPlatform( mainWindow ) {
	this.window = mainWindow;
	this.dockMenu = Menu.buildFromTemplate( require( './dock-menu' )( app, mainWindow ) );

	app.dock.setMenu( this.dockMenu );

	app.on( 'activate', function () {
		log.info( 'Window activated' );

		mainWindow.show();
		mainWindow.focus();
	} );

	app.on( 'window-all-closed', function () {
		log.info( 'All windows closed, shutting down' );
		app.quit();
	} );

	app.on( 'before-quit', function () {
		log.info( 'Application quit triggered' );

		appQuit.allowQuit();
	} );

	mainWindow.on( 'close', function ( ev ) {
		if ( appQuit.shouldQuitToBackground() ) {
			log.info( `User clicked 'close': hiding main window...` );
			ev.preventDefault();
			mainWindow.hide();
			mainWindow.webContents.send( 'notifications-panel-show', false );
		}
	} );
}

MacPlatform.prototype.restore = function () {
	if ( this.window.isMinimized() ) {
		this.window.restore();
	}

	this.window.show();
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
	menuSetter.setRequiresUser( this.dockMenu, enabled );
};

module.exports = MacPlatform;
