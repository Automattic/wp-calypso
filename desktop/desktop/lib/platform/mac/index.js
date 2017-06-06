'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const app = electron.app;
const Menu = electron.Menu;
const debug = require( 'debug' )( 'platform:mac' );

/**
 * Internal dependencies
 */
const appQuit = require( 'lib/app-quit' );
const menuSetter = require( 'lib/menu-setter' );

function MacPlatform( mainWindow ) {
	this.window = mainWindow;
	this.dockMenu = Menu.buildFromTemplate( require( './dock-menu' )( app, mainWindow ) );

	app.dock.setMenu( this.dockMenu );

	app.on( 'activate', function() {
		debug( 'Window activated' );

		mainWindow.show();
		mainWindow.focus();
	} );

	app.on( 'window-all-closed', function() {
		debug( 'All windows closed, shutting down' );
		app.quit();
	} );

	app.on( 'before-quit', function() {
		debug( 'Application quit triggered' );

		appQuit.allowQuit();
	} );

	mainWindow.on( 'close', function( ev ) {
		if ( appQuit.shouldQuitToBackground() ) {
			debug( 'Window close puts app into background' );
			ev.preventDefault();
			mainWindow.hide();
		}
	} );
}

MacPlatform.prototype.restore = function() {
	if ( this.window.isMinimized() ) {
		this.window.restore();
	}

	this.window.show();
}

MacPlatform.prototype.showNotificationsBadge = function( count, bounceEnabled ) {
	app.dock.setBadge( ' ' );

	if ( bounceEnabled ) {
		app.dock.bounce();
	}
};

MacPlatform.prototype.clearNotificationsBadge = function() {
	app.dock.setBadge( '' );
};

MacPlatform.prototype.setDockMenu = function( enabled ) {
	menuSetter.setRequiresUser( this.dockMenu, enabled );
};

module.exports = MacPlatform;
