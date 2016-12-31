/**
 * Internal dependencies
 */
import { MEDIA_ITEMS_REQUEST } from 'state/action-types';
import { receiveMediaItems, requestingMediaItems } from 'state/media/actions';
import wpcom from 'lib/wp';

export function requestMediaItems( store, action ) {
	const { siteId, query } = action;

	store.dispatch( requestingMediaItems( siteId, query ) );

	return wpcom.site( siteId ).mediaList( query, function( error, data ) {
		store.dispatch( receiveMediaItems( siteId, query, data.media, data.found ) );
	} );
}

export default {
	[ MEDIA_ITEMS_REQUEST ]: [ requestMediaItems ]
};
