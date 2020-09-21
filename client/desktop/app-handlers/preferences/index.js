/**
 * External Dependencies
 */
const { dialog, ipcMain: ipc } = require( 'electron' ); // eslint-disable-line import/no-extraneous-dependencies

/**
 * Internal dependencies
 */
const log = require( 'desktop/lib/logger' )( 'preferences' );
const Settings = require( 'desktop/lib/settings' );

function promptForRestart( title, message ) {
	// Warn user they need to restart the app
	dialog.showMessageBox(
		{
			buttons: [ 'OK' ],
			title: title,
			message: message,
			detail: 'The app needs to be restarted for this to take effect.',
		},
		function () {}
	);
}

module.exports = function () {
	ipc.on( 'preferences-changed', function ( event, { name, value } ) {
		log.info( `Changed setting '${ name }': `, value );
		if ( 'proxy-type' === name ) {
			promptForRestart( 'Proxy changed', 'You have changed the proxy settings.' );
		} else if ( 'spellcheck-enabled' === name ) {
			promptForRestart(
				value ? 'Spellchecker enabled' : 'Spellchecker disabled',
				'You have changed the spellchecker settings.'
			);
		}

		Settings.saveSetting( name, value );
	} );
};
