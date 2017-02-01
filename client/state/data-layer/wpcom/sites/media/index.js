/**
 * Internal dependencies
 */
import { MEDIA_REQUEST } from 'state/action-types';
import { isRequestingMedia } from 'state/selectors';
import { failMediaRequest, receiveMedia, requestingMedia } from 'state/media/actions';
import wpcom from 'lib/wp';
import debug from 'debug';

/**
 * Module variables
 */
const log = debug( 'calypso:middleware-media' );

/**
 * Issues an API request to fetch media for a site and query.
 *
 * @param  {Object}  store  Redux store
 * @param  {Object}  action Action object
 * @return {Promise}        Promise
 */
export function requestMedia( { dispatch, getState }, { siteId, query } ) {
	if ( isRequestingMedia( getState(), siteId, query ) ) {
		return;
	}

	dispatch( requestingMedia( siteId, query ) );

	log( 'Request media for site %d using query %o', siteId, query );

	return wpcom
		.site( siteId )
		.mediaList( query )
		.then( ( { media, found } ) => dispatch( receiveMedia( siteId, media, found, query ) ) )
		.catch( () => dispatch( failMediaRequest( siteId, query ) ) );
}

export default {
	[ MEDIA_REQUEST ]: [ requestMedia ]
};
