/**
 * External dependencies
 */
const path = require( 'path' );
const { app, dialog } = require( 'electron' );

/**
 * Internal dependencies
 */
const state = require( 'calypso/desktop/lib/state' );
const config = require( 'calypso/desktop/lib/config' );
const system = require( 'calypso/desktop/lib/system' );
const { zipContents } = require( 'calypso/desktop/lib/archiver' );
const log = require( 'calypso/desktop/lib/logger' )( 'desktop:get-logs' );

/**
 * Module variables
 */
const logPath = state.getLogPath();
const settingsPath = path.join( app.getPath( 'appData' ), config.appPathName, 'settings.json' );

const pad = ( n ) => `${ n }`.padStart( 2, '0' );

const localDateTime = () => {
	const now = new Date();
	return (
		now.getFullYear() +
		'-' +
		pad( now.getMonth() + 1 ) +
		'-' +
		pad( now.getDate() ) +
		'T' +
		pad( now.getHours() ) +
		'.' +
		pad( now.getMinutes() ) +
		'.' +
		pad( now.getSeconds() ) +
		'.' +
		pad( now.getMilliseconds() )
	);
};

module.exports = async function ( window ) {
	const onZipped = ( file ) =>
		function () {
			dialog.showMessageBox( window, {
				type: 'info',
				buttons: [ 'OK' ],
				title: 'Application logs saved to your desktop',
				message: 'Application logs saved to your desktop' + '\n\n' + `${ path.basename( file ) }`,
				detail: 'For help with an issue, please contact help@wordpress.com and share your logs.',
			} );
		};

	const onError = ( error ) =>
		dialog.showMessageBox( window, {
			type: 'info',
			buttons: [ 'OK' ],
			title: 'Error getting application logs',
			message: 'Error getting application logs',
			detail:
				'Please contact help@wordpress.com and mention the error details below:' +
				'\n\n' +
				error.stack +
				'\n\n' +
				'System info: ' +
				JSON.stringify( system.getVersionData() ),
		} );

	try {
		const timestamp = localDateTime();
		const desktop = app.getPath( 'desktop' );
		const dst = path.join( desktop, `wpdesktop-${ timestamp }.zip` );

		zipContents( [ logPath, settingsPath ], dst, onZipped( dst ) );
	} catch ( error ) {
		log.error( 'Failed to zip logs: ', error );
		onError( error );
	}
};
