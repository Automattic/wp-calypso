'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const Tray = electron.Tray;
const Menu = electron.Menu;
const debug = require( 'debug' )( 'platform:windows' );

/**
 * Internal dependencies
 */
const windowsTrayMenu = require( './tray-menu' );
const Settings = require( 'lib/settings' );
const appQuit = require( 'lib/app-quit' );
const platform = require( 'lib/platform' );
const menuSetter = require( 'lib/menu-setter' );
const assets = require( 'lib/assets' );

/**
* Module variables
*/
const TRAY_SETTING = 'win_tray';
const TRAY_NO_NOTIFICATION = '-tray-icon.ico';
const TRAY_NOTIFICATION = '-tray-icon-notification.ico';

function WindowsPlatform( mainWindow ) {
	this.window = mainWindow;
	this.trayMenu = Menu.buildFromTemplate( windowsTrayMenu( this.restore.bind( this ) ) )
	this.tray = new Tray( this.getIcon( TRAY_NO_NOTIFICATION ) );

	this.tray.setToolTip( 'WordPress.com' );
	this.tray.setContextMenu( this.trayMenu );
	this.tray.on( 'click', this.restore.bind( this ) );

	mainWindow.on( 'close', this.onClosed.bind( this ) );
}

WindowsPlatform.prototype.onClosed = function( ev ) {
	if ( appQuit.shouldQuitToBackground() ) {
		debug( 'Window close puts app into background & creates tray' );

		ev.preventDefault();

		this.window.hide();
		this.showBackgroundBubble();
	}
};

WindowsPlatform.prototype.showBackgroundBubble = function() {
	if ( Settings.getSettingGroup( false, TRAY_SETTING ) === false ) {
		debug( 'Showing tray balloon' );

		Settings.saveSetting( TRAY_SETTING, true );

		this.tray.displayBalloon( {
			icon: assets.getPath( 'windows-tray-bubble.png' ),
			title: 'WordPress.com',
			content: "We've minimized WordPress.com to your tray. Click on the icon to restore it."
		} );
	}
};

WindowsPlatform.prototype.restore = function() {
	this.window.show();
};

WindowsPlatform.prototype.getIcon = function( filename ) {
	return assets.getPath( ( platform.isWindows10() ? 'win10' : 'win7' ) + filename );
};

WindowsPlatform.prototype.showNotificationsBadge = function() {
	this.tray.setImage( this.getIcon( TRAY_NOTIFICATION ) );
};

WindowsPlatform.prototype.clearNotificationsBadge = function() {
	this.tray.setImage( this.getIcon( TRAY_NO_NOTIFICATION ) );
};

WindowsPlatform.prototype.setDockMenu = function( enabled ) {
	menuSetter.setRequiresUser( this.trayMenu, enabled );
};

module.exports = WindowsPlatform;
