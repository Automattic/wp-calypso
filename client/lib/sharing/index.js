/** @format */

/**
 * Internal dependencies
 */

import PopupMonitor from 'lib/popup-monitor';

const requestExternalAccess = ( url, cb ) => {
	const popupMonitor = new PopupMonitor();
	let lastMessage;

	popupMonitor.open(
		url,
		null,
		'toolbar=0,location=0,status=0,menubar=0,' + popupMonitor.getScreenCenterSpecs( 780, 700 )
	);

	popupMonitor.once( 'close', () => {
		let keyringId = null;
		if ( lastMessage && lastMessage.keyring_id ) {
			keyringId = Number( lastMessage.keyring_id );
		}
		cb( keyringId );
	} );

	popupMonitor.on( 'message', message => ( lastMessage = message ) );
};

export default requestExternalAccess;
