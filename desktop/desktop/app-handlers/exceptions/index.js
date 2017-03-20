'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const app = electron.app;
const dialog = electron.dialog;

/**
 * Internal dependencies
 */
const crashTracker = require( 'lib/crash-tracker' );
const system = require( 'lib/system' );

/**
 * Module variables
 */
let isReady = false;
let thereCanBeOnlyOne = false;

// We ignore any of these errors as they are probably temporary
const NETWORK_ERRORS = [ 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET' ];

function exit() {
	if ( isReady ) {
		app.quit();
	} else {
		process.exit( 1 );
	}
}

function showErrorAndExit( error ) {
	if ( thereCanBeOnlyOne ) {
		exit();
	}

	thereCanBeOnlyOne = true;

	dialog.showErrorBox(
		'WordPress.com ran into an error',
		'Please restart the app and try again.' +
		'\n\n' +
		'If you continue to have issues, please contact us at help@wordpress.com and mention the error details below:' +
		'\n\n' +
		error.stack +
		'\n\n' +
		'System info: ' + JSON.stringify( system.getVersionData() )
	);

	exit();
}

function isFatalError( error ) {
	if ( typeof error.code ) {
		if ( NETWORK_ERRORS.indexOf( error.code ) !== -1 ) {
			return false;
		}
	}

	return true;
}

function exceptionHandler( error ) {
	if ( ! isFatalError( error ) ) {
		return;
	}

	console.log( 'uncaughtException (fatal)', error, error.stack, typeof error );

	if ( crashTracker.isEnabled() ) {
		crashTracker.track( 'exception', { name: error.name, message: error.message, stack: error.stack }, function() {
			showErrorAndExit( error );
		} );
	} else {
		showErrorAndExit( error );
	}
}

module.exports = function() {
	app.on( 'ready', function() {
		isReady = true;
	} );

	process.on( 'uncaughtException', exceptionHandler );
};
