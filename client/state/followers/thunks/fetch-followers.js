/**
 * External dependencies
 */

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:followers-actions' );

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { requestFollowers, successRequestFollowers, failRequestFollowers } from '../actions';

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
			.then( ( data ) => dispatch( successRequestFollowers( query, data ) ) )
			.catch( ( error ) => dispatch( failRequestFollowers( query, error ) ) );
	};
}

export default fetchFollowers;
