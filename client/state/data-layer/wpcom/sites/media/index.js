/**
 * Internal dependencies
 */
import { MEDIA_REQUEST } from 'state/action-types';
import { isRequestingMedia } from 'state/selectors';
import { receiveMedia, requestingMedia } from 'state/media/actions';
import wpcom from 'lib/wp';
import debug from 'debug';

/**
 * Module variables
 */
const log = debug( 'calypso:middleware-media' );

/**
 * Issues an API request to fetch media for a site and query.
 *
 * @param  {Object}         store  Redux store
 * @param  {Object}         action Action object
 * @return {XMLHttpRequest}        XMLHttpRequest
 */
export function requestMedia( { dispatch, getState }, { siteId, query } ) {
	if ( ! isRequestingMedia( getState(), siteId, query ) ) {
		dispatch( requestingMedia( siteId, query ) );

		log( 'Request media for site %d using query %o', siteId, query );

		return wpcom.site( siteId ).mediaList( query, function( error, data ) {
			dispatch( receiveMedia( siteId, data.media, data.found, query ) );
		} );
	}
}

export default {
	[ MEDIA_REQUEST ]: [ requestMedia ]
};
