/**
 * Internal dependencies
 */
import { MEDIA_REQUEST } from 'state/action-types';
import { receiveMedia, requestingMedia } from 'state/media/actions';
import wpcom from 'lib/wp';

/**
 * Issues an API request to fetch media for a site and query.
 *
 * @param  {Object}         store  Redux store
 * @param  {Object}         action Action object
 * @return {XMLHttpRequest}        XMLHttpRequest
 */
export function requestMedia( { dispatch }, { siteId, query } ) {
	dispatch( requestingMedia( siteId, query ) );

	return wpcom.site( siteId ).mediaList( query, function( error, data ) {
		dispatch( receiveMedia( siteId, data.media, data.found, query ) );
	} );
}

export default {
	[ MEDIA_REQUEST ]: [ requestMedia ]
};
