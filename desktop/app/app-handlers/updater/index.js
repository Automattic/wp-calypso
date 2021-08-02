const { app } = require( 'electron' );
const Config = require( '../../lib/config' );
const log = require( '../../lib/logger' )( 'desktop:updater' );
const platform = require( '../../lib/platform' );
const settings = require( '../../lib/settings' );
const AutoUpdater = require( './auto-updater' );
const ManualUpdater = require( './manual-updater' );

let updater = false;

function init() {
	log.info( 'Updater config: ', Config.updater );
	if ( Config.updater ) {
		app.on( 'will-finish-launching', function () {
			const beta = settings.getSetting( 'release-channel' ) === 'beta';
			log.info( `Update channel: '${ settings.getSetting( 'release-channel' ) }'` );
			if ( platform.isOSX() || platform.isWindows() || process.env.APPIMAGE ) {
				log.info( 'Initializing auto updater...' );
				updater = new AutoUpdater( {
					beta,
				} );
			} else {
				log.info( 'Initializing manual updater...' );
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
		log.info( 'Skipping updater configuration ...' );
	}
}

function getUpdater() {
	return updater;
}

// !! Syntax: assignment via intermediary module const is
// necessary to support both unnamed (default) and named exports !!
const main = ( module.exports = init );
main.getUpdater = getUpdater;
