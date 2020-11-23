/**
 * External dependencies
 */

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:followers-actions' );

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { requestFollowers, requestFollowersSuccess, requestFollowersFailure } from '../actions';

/**
 * Request followers for a given site.
 *
 * @param {object} query contains params to filter results
 * @param {boolean} silentUpdate indicates whether the request should be reflected in the UI
 */
function fetchFollowers( query, silentUpdate = false ) {
	return ( dispatch ) => {
		// TODO: Componentes should not fetch if already fetching
		debug( 'fetching followers', query );
		if ( ! silentUpdate ) {
			dispatch( requestFollowers( query ) );
		}
		wpcom
			.site( query.siteId )
			.statsFollowers( query )
			.then( ( data ) => dispatch( requestFollowersSuccess( query, data ) ) )
			.catch( ( error ) => dispatch( requestFollowersFailure( query, error ) ) );
	};
}

export default fetchFollowers;
