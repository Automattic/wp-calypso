'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const autoUpdater = electron.autoUpdater;
const dialog = electron.dialog;
const debug = require( 'debug' )( 'desktop:updater:auto' );

/**
 * Internal dependencies
 */
const AppQuit = require( 'lib/app-quit' );
const Config = require( 'lib/config' );
const debugTools = require( 'lib/debug-tools' );

function dialogDebug( message ) {
	debug( message );

	if ( Config.build === 'updater' ) {
		debugTools.dialog( message );
	}
}

function AutoUpdater( url ) {
	debug( 'Starting auto-updater' );

	this.hasPrompted = false;
	this.url = url;

	autoUpdater.setFeedURL( url );
	autoUpdater.on( 'error', this.onError.bind( this ) );
	autoUpdater.on( 'update-available', this.onAvailable.bind( this ) );
	autoUpdater.on( 'update-not-available', this.onNotAvailable.bind( this ) );
	autoUpdater.on( 'update-downloaded', this.onDownloaded.bind( this ) );
}

AutoUpdater.prototype.ping = function() {
	dialogDebug( 'Pinging update URL ' + this.url );
	autoUpdater.checkForUpdates();
};

AutoUpdater.prototype.onError = function( error ) {
	dialogDebug( 'Auto-updater failed: ' + error );
};

AutoUpdater.prototype.onAvailable = function() {
	dialogDebug( 'Update detected' );
};

AutoUpdater.prototype.onNotAvailable = function() {
	dialogDebug( 'No update detected' );
};

AutoUpdater.prototype.onDownloaded = function( event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate ) {
	const updateDialogOptions = {
		buttons: [ 'Update & Restart', 'Cancel' ],
		title: 'Update Available',
		message: releaseName,
		detail: releaseNotes
	};

	debug( 'Updated download: ' + releaseName + ' ' + releaseNotes );

	if ( this.hasPrompted === false ) {
		this.hasPrompted = true;

		dialog.showMessageBox( updateDialogOptions, function( i ) {
			this.hasPrompted = false;

			if ( i === 0 ) {
				debug( 'Update and restart' );
				AppQuit.allowQuit();
				quitAndUpdate();
			}
		} );
	}
};

module.exports = AutoUpdater;
