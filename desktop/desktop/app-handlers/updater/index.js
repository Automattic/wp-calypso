'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const app = electron.app;

/**
 * Internal dependencies
 */
const platform = require( 'lib/platform' );
const Config = require( 'lib/config' );
const AutoUpdater = require( './auto-updater' );
const ManualUpdater = require( './manual-updater' );
const settings = require( 'lib/settings' );

let updater = false;

function urlBuilder( version, channel ) {
	let platformString = 'osx';

	if ( platform.isWindows() ) {
		platformString = 'windows';
	} else if ( platform.isLinux() ) {
		platformString = 'linux';
	}

	if ( Config.isUpdater() ) {
		version = '0.1.0';  // This forces an update so we can check the updater still works
	}

	return Config.updater.url + platformString + '/version?compare=' + version + '&channel=' + channel;
}

module.exports = function() {
	if ( Config.updater ) {
		app.on( 'will-finish-launching', function() {
			let url = urlBuilder( app.getVersion(), settings.getSetting( 'release-channel' ) );

			if ( platform.isOSX() ) {
				updater = new AutoUpdater( url );
			} else {
				updater = new ManualUpdater( url );
			}

			// Start one straight away
			setTimeout( updater.ping.bind( updater ), Config.updater.delay );
			setInterval( updater.ping.bind( updater ), Config.updater.interval );
		} );
	}
};
