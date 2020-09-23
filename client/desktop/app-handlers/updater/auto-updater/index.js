/**
 * External Dependencies
 */
const { app } = require( 'electron' ); // eslint-disable-line import/no-extraneous-dependencies
const { autoUpdater } = require( 'electron-updater' );

/**
 * Internal dependencies
 */
const AppQuit = require( 'desktop/lib/app-quit' );
const Config = require( 'desktop/lib/config' );
const debugTools = require( 'desktop/lib/debug-tools' );
const { bumpStat, sanitizeVersion, getPlatform } = require( 'desktop/lib/desktop-analytics' );
const Updater = require( 'desktop/lib/updater' );
const log = require( 'desktop/lib/logger' )( 'desktop:updater:auto' );

const statsPlatform = getPlatform( process.platform );
const sanitizedVersion = sanitizeVersion( app.getVersion() );

const getStatsString = ( isBeta ) =>
	`${ statsPlatform }${ isBeta ? '-b' : '' }-${ sanitizedVersion }`;

function dialogDebug( message ) {
	log.info( message );

	if ( Config.build === 'updater' ) {
		debugTools.dialog( message );
	}
}

class AutoUpdater extends Updater {
	constructor( options = {} ) {
		super( options );

		autoUpdater.on( 'error', this.onError.bind( this ) );
		autoUpdater.on( 'update-available', this.onAvailable.bind( this ) );
		autoUpdater.on( 'update-not-available', this.onNotAvailable.bind( this ) );
		autoUpdater.on( 'update-downloaded', this.onDownloaded.bind( this ) );

		autoUpdater.autoInstallOnAppQuit = false;
		autoUpdater.allowDowngrade = true;
		autoUpdater.channel = 'stable';
		autoUpdater.allowPrerelease = false;

		if ( this.beta ) {
			autoUpdater.channel = 'beta';
			autoUpdater.allowPrerelease = true;
			autoUpdater.allowDowngrade = false;
		}

		// Tracks whether an auto-update check was initiated via menu selection.
		this.isUserRequested = false;
	}

	ping( isUserRequested ) {
		if ( process.env.DEBUG ) {
			dialogDebug( 'DEBUG is set: skipping auto-update check' );
			return;
		}
		dialogDebug( 'Checking for update' );
		autoUpdater.checkForUpdates();
		this.isUserRequested = isUserRequested;
	}

	// ignore (available), confirm (available), cancel (available)
	// not available ( do nothing ) - user initiated
	onAvailable( info ) {
		log.info( 'New update is available: ', info.version );
		bumpStat( 'wpcom-desktop-update-check', `${ getStatsString( this.beta ) }-needs-update` );
	}

	onNotAvailable() {
		log.info( 'No update is available' );
		bumpStat( 'wpcom-desktop-update-check', `${ getStatsString( this.beta ) }-no-update` );
		if ( this.isUserRequested ) {
			this.notifyNotAvailable();
		}
		this.isUserRequested = false;
	}

	onDownloaded( info ) {
		log.info( 'Update downloaded: ', info.version );

		this.setVersion( info.version );
		this.notify();

		const stats = {
			'wpcom-desktop-download': `${ statsPlatform }-app`,
			'wpcom-desktop-download-by-ver': `${ statsPlatform }-app-${ sanitizedVersion }`,
			'wpcom-desktop-download-ref': `update-${ statsPlatform }-app`,
			'wpcom-desktop-download-ref-only': 'update',
		};
		bumpStat( stats );
	}

	onConfirm() {
		log.info( `User selected 'Update & Restart'...` );

		AppQuit.allowQuit();
		autoUpdater.quitAndInstall();

		bumpStat( 'wpcom-desktop-update', `${ getStatsString( this.beta ) }-confirm` );
	}

	onCancel() {
		this.isUserRequested = false;
		bumpStat( 'wpcom-desktop-update', `${ getStatsString( this.beta ) }-update-cancel` );
	}

	onError( event ) {
		log.error( 'Update error: ', event );

		bumpStat( 'wpcom-desktop-update', `${ getStatsString( this.beta ) }-update-error` );
	}
}

module.exports = AutoUpdater;
