const { Tray, Menu, app } = require( 'electron' );
const appQuit = require( '../../../lib/app-quit' );
const assets = require( '../../../lib/assets' );
const log = require( '../../../lib/logger' )( 'platform:windows' );
const menuSetter = require( '../../../lib/menu-setter' );
const platform = require( '../../../lib/platform' );
const Settings = require( '../../../lib/settings' );
const windowsTrayMenu = require( './tray-menu' );

/**
 * Module variables
 */
const TRAY_SETTING = 'win_tray';
const TRAY_NO_NOTIFICATION = '-tray-icon.ico';
const TRAY_NOTIFICATION = '-tray-icon-notification.ico';

let window;
let view;
let trayMenu;
let tray;

function WindowsPlatform( appWindow ) {
	window = appWindow.window;
	view = appWindow.view;
	trayMenu = Menu.buildFromTemplate( windowsTrayMenu( this.restore.bind( this ) ) );
	tray = new Tray( this.getIcon( TRAY_NO_NOTIFICATION ) );

	tray.setToolTip( 'WordPress.com' );
	tray.setContextMenu( trayMenu );
	tray.on( 'click', this.restore.bind( this ) );

	window.on( 'close', this.onClosed.bind( this ) );

	app.on( 'before-quit', function () {
		log.info( "Responding to app event 'before-quit', destroying tray" );
		if ( tray ) {
			tray.destroy();
		}
	} );

	app.on( 'second-instance', this.restore.bind( this ) );
}

WindowsPlatform.prototype.onClosed = function ( ev ) {
	if ( appQuit.shouldQuitToBackground() ) {
		log.info( `User clicked 'close': hiding main window and creating tray...` );

		ev.preventDefault();

		window.hide();
		view.webContents.send( 'notifications-panel-show', false );
		this.showBackgroundBubble();

		return;
	}

	log.info( 'Quitting application...' );
	app.quit();
};

WindowsPlatform.prototype.showBackgroundBubble = function () {
	if ( Settings.getSettingGroup( false, TRAY_SETTING ) === false ) {
		log.info( 'Showing tray balloon' );

		Settings.saveSetting( TRAY_SETTING, true );

		tray.displayBalloon( {
			icon: assets.getPath( 'windows-tray-bubble.png' ),
			title: 'WordPress.com',
			content: "We've minimized WordPress.com to your tray. Click on the icon to restore it.",
		} );
	}
};

WindowsPlatform.prototype.restore = function () {
	log.info( 'Restoring app window ...' );
	if ( window.isMinimized() ) {
		window.restore();
		window.focus();
	}
	window.show();
};

WindowsPlatform.prototype.getIcon = function ( filename ) {
	let windowsVersion = 'win7';

	if ( platform.isWindows10() ) {
		windowsVersion = 'win10';
	}

	if ( platform.isWindows11() ) {
		windowsVersion = 'win11';
	}

	return assets.getPath( windowsVersion + filename );
};

WindowsPlatform.prototype.showNotificationsBadge = function () {
	tray.setImage( this.getIcon( TRAY_NOTIFICATION ) );
};

WindowsPlatform.prototype.clearNotificationsBadge = function () {
	tray.setImage( this.getIcon( TRAY_NO_NOTIFICATION ) );
};

WindowsPlatform.prototype.setDockMenu = function ( enabled ) {
	menuSetter.setRequiresUser( trayMenu, enabled );
};

module.exports = WindowsPlatform;
