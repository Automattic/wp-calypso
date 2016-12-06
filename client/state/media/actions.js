/**
 * Internal dependencies
 */
import { MEDIA_ITEMS_RECEIVE } from 'state/action-types';

export function receiveMediaItems( siteId, data ) {
	return ( dispatch ) => {
		dispatch( {
			type: MEDIA_ITEMS_RECEIVE,
			siteId,
			data
		} );
	};
}
