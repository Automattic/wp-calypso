'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const app = electron.app;
const crashReporter = electron.crashReporter;

/**
 * Internal dependencies
 */
const Config = require( 'desktop/lib/config' );
const log = require( 'desktop/lib/logger' )( 'desktop:crash-reporting' );

module.exports = function() {
	if ( Config.crash_reporter.electron ) {
		app.on( 'will-finish-launching', function() {
			log.info( 'Crash reporter started' );

			crashReporter.start( {
				productName: Config.description,
				companyName: Config.author,
				submitURL: Config.crash_reporter.url,
				uploadToServer: true
			} );
		} );
	}
};
