const { ipcMain: ipc, clipboard } = require( 'electron' );
const log = require( '../../lib/logger' )( 'desktop:clipboard' );

module.exports = function () {
	ipc.on( 'copy-text-to-clipboard', ( text ) => {
		log.info( 'Copying text to clipboard: ', text );
		clipboard.writeText( text );
	} );
};
