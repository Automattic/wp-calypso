const os = require( 'os' );

/**
 * Module variables
 */
let platform = false;

function Platform() {
	this.platform = false;
}

Platform.prototype.setMainWindow = function ( appWindow ) {
	let PlatformHandler = false;

	if ( this.isOSX() ) {
		PlatformHandler = require( './mac' );
	} else if ( this.isWindows() ) {
		PlatformHandler = require( './windows' );
	} else if ( this.isLinux() ) {
		PlatformHandler = require( './linux' );
	}

	if ( PlatformHandler ) {
		if ( this.platform ) {
			delete this.platform;
		}

		this.platform = new PlatformHandler( appWindow );

		appWindow.window.on( 'blur', () => {
			appWindow.view.webContents.send( 'notifications-panel-show', false );
		} );
	}
};

Platform.prototype.restore = function () {
	if ( this.platform ) {
		this.platform.restore();
	}
};

Platform.prototype.showNotificationsBadge = function ( count, bounceEnabled ) {
	if ( this.platform ) {
		this.platform.showNotificationsBadge( count, bounceEnabled );
	}
};

Platform.prototype.clearNotificationsBadge = function () {
	if ( this.platform ) {
		this.platform.clearNotificationsBadge();
	}
};

Platform.prototype.setDockMenu = function ( enabled ) {
	if ( this.platform ) {
		this.platform.setDockMenu( enabled );
	}
};

Platform.prototype.isOSX = function () {
	return process.platform === 'darwin';
};

Platform.prototype.isWindows = function () {
	return process.platform === 'win32';
};

Platform.prototype.isWindows10 = function () {
	return parseInt( os.release(), 10 ) >= 10 && parseInt( os.release(), 10 ) < 11;
};

Platform.prototype.isWindows11 = function () {
	return parseInt( os.release(), 11 ) >= 11;
};

Platform.prototype.isLinux = function () {
	return process.platform === 'linux';
};

Platform.prototype.getPlatformString = function () {
	return process.platform;
};

if ( ! platform ) {
	platform = new Platform();
}

module.exports = platform;
