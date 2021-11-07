const { ipcMain: ipc, clipboard } = require( 'electron' );
const log = require( '../../lib/logger' )( 'desktop:clipboard' );

module.exports = function () {
	ipc.on( 'copy-text-to-clipboard', ( _, text ) => {
		log.info( 'Copying text to clipboard: ', text );
		try {
			clipboard.writeText( text );
		} catch ( e ) {
			log.error( 'Failed to write to clipboard: ', e );
		}
	} );
};
