/**
 * External dependencies
 */
import debugFactory from 'debug';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';

const debug = debugFactory( 'calypso:public-notices' );

export function installPublicNotices() {
	debug( 'Installing public notices' );

	const publicNotices = new PublicNotices();
}

class PublicNotices {
	constructor() {
		wp.pinghub.connect( '/wpcom/pub/calypso', this.pinghubCallback );
	}

	pinghubCallback = ( err, event ) => {
		const responseType = get(event, 'response.type');

		this.subscribing = false;

		// WebSocket error: costs one try
		if ( err || !responseType || responseType === 'error' ) {
			debug( 'pinghubCallback: error', 'err =', err);
			this.subscribed = false;
		} else if ( responseType === 'open' ) {
			// WebSocket connected: stop polling
			debug('pinghubCallback: connected', event.response);
			this.subscribeTry = 0;
			this.subscribed = true;
		} else if ( responseType === 'close' ) {
			// WebSocket disconnected: have another try
			debug('pinghubCallback: disconnected', event.response);
			this.subscribeTry = 0;
			this.subscribed = false;
		} else if ( responseType === 'message' ) {
			// WebSocket message: add to inbox, call main() to trigger API call
			let message = true;
			try {
				message = JSON.parse(get(event, 'response.data'));
			} catch ( e ) {
			}
			debug( 'pinghubCallback: received message', event.response );

			if ( 'reload' === event.response.data ) {
				debug( 'Reloading page!' );
				window.location.reload();
			}
		} else {
			// Missed case?
			debug( 'pinghubCallback: unknown event.response.type', event.response );
			throw new Error(
				'notifications:rest-client:pinghubCallback unknown event.response.type: ' + responseType
			);
		}
	}
}

