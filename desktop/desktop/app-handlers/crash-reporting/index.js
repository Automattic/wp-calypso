'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const app = electron.app;
const crashReporter = electron.crashReporter;
const debug = require( 'debug' )( 'desktop:crash-reporting' );

/**
 * Internal dependencies
 */
const Config = require( 'lib/config' );

module.exports = function() {
	if ( Config.crash_reporter.electron ) {
		app.on( 'will-finish-launching', function() {
			debug( 'Crash reporter started' );

			crashReporter.start( {
				productName: Config.description,
				companyName: Config.author,
				submitURL: Config.crash_reporter.url,
				autoSubmit: true
			} );
		} );
	}
};
