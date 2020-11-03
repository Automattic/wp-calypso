/**
 * External Dependencies
 */
const { app, crashReporter } = require( 'electron' );

/**
 * Internal dependencies
 */
const Config = require( 'calypso/desktop/lib/config' );
const log = require( 'calypso/desktop/lib/logger' )( 'desktop:crash-reporting' );

module.exports = function () {
	if ( Config.crash_reporter.electron ) {
		app.on( 'will-finish-launching', function () {
			log.info( 'Crash reporter started' );

			crashReporter.start( {
				productName: Config.description,
				companyName: Config.author,
				submitURL: Config.crash_reporter.url,
				uploadToServer: true,
			} );
		} );
	}
};
