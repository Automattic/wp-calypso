import PopupMonitor from '@automattic/popup-monitor';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:request-external-access' );

/**
 * The callback function of the requestExternalAccess utility.
 * @callback requestCallback
 * @param {Object} result Received authentication data.
 * @param {number} result.keyring_id
 * @param {string} result.id_token
 * @param {Object} result.user
 */

/**
 * Utility for requesting authorization of sharing services.
 * @param {string} url The URL to be loaded in the newly opened window.
 * @param {requestCallback} cb The callback that handles the response.
 */
const requestExternalAccess = ( url, cb ) => {
	const popupMonitor = new PopupMonitor();
	let lastMessage;

	popupMonitor.open(
		url,
		null,
		'toolbar=0,location=0,status=0,menubar=0,' + popupMonitor.getScreenCenterSpecs( 780, 700 )
	);

	debug( 'popupMonitor.open', url );

	popupMonitor.once( 'close', () => {
		const result = {};
		if ( lastMessage && lastMessage.keyring_id ) {
			result.keyring_id = Number( lastMessage.keyring_id );
			result.id_token = lastMessage.id_token;
			result.user = lastMessage.user;
		}

		debug( 'popupMonitor.once close', lastMessage );
		cb( result );
	} );

	popupMonitor.on( 'message', ( message ) => ( lastMessage = message ) );
};

export default requestExternalAccess;
