/**
 * External Dependencies
 */
const { app } = require( 'electron' );

/**
 * Internal dependencies
 */
const platform = require( 'desktop/lib/platform' );
const Config = require( 'desktop/lib/config' );
const settings = require( 'desktop/lib/settings' );
const AutoUpdater = require( './auto-updater' );
const ManualUpdater = require( './manual-updater' );
const log = require( 'desktop/lib/logger' )( 'desktop:updater' );

let updater = false;

module.exports = function () {
	log.info( 'Updater config: ', Config.updater );
	if ( Config.updater ) {
		app.on( 'will-finish-launching', function () {
			const beta = settings.getSetting( 'release-channel' ) === 'beta';
			log.info( `Update channel: '${ settings.getSetting( 'release-channel' ) }'` );
			if ( platform.isOSX() || platform.isWindows() || process.env.APPIMAGE ) {
				log.info( 'Auto Update' );
				updater = new AutoUpdater( {
					beta,
				} );
			} else {
				log.info( 'Manual Update' );
				updater = new ManualUpdater( {
					downloadUrl: Config.updater.downloadUrl,
					apiUrl: Config.updater.apiUrl,
					options: {
						dialogMessage:
							'{name} {newVersion} is now available — you have {currentVersion}. Would you like to download it now?',
						confirmLabel: 'Download',
						beta,
					},
				} );
			}

			// Start one straight away
			setTimeout( updater.ping.bind( updater ), Config.updater.delay );
			setInterval( updater.ping.bind( updater ), Config.updater.interval );
		} );
	} else {
		log.info( 'Skipping Update – no configuration' );
	}
};
