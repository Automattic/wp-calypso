/**
 * Internal dependencies
 */
const ipc = require( '../../lib/calypso-commands' );
const Config = require( '../../lib/config' );
const isCalypso = require( '../../lib/is-calypso' );

const webBase = Config.baseURL();

module.exports = function ( view ) {
	if ( isCalypso( view ) ) {
		ipc.showMySites( view );
	} else {
		view.webContents.loadURL( webBase + 'stats/day' );
	}
};
