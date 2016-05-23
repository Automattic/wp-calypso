/**
 * External dependencies
 */
const debug = require( 'debug' )( 'calypso:followers-actions' );

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	FOLLOWERS_RECEIVE,
	FOLLOWERS_REQUEST,
	FOLLOWERS_REQUEST_ERROR,
	FOLLOWER_REMOVE_ERROR,
	FOLLOWER_REMOVE_REQUEST,
	FOLLOWER_REMOVE_SUCCESS
} from 'state/action-types';

export default {
	fetchFollowers( query, silentUpdate = false ) {
		return ( dispatch ) => {
			// TODO: Componentes should not fetch if already fetching
			debug( 'fetching followers', query );
			if ( ! silentUpdate ) {
				dispatch( {
					type: FOLLOWERS_REQUEST,
					query
				} );
			}
			wpcom.site( query.siteId ).statsFollowers( query )
				.then( data => dispatch( { type: FOLLOWERS_RECEIVE, query, data } ) )
				.catch( error => dispatch( { type: FOLLOWERS_REQUEST_ERROR, query, error } ) );
		};
	},
	removeFollower( siteId, follower ) {
		return ( dispatch ) => {
			debug( 'removing follower', follower, siteId );
			dispatch( {
				type: FOLLOWER_REMOVE_REQUEST,
				siteId: siteId,
				follower: follower
			} );
			wpcom.undocumented().site( siteId ).removeFollower( follower.ID )
				.then( data => dispatch( { type: FOLLOWER_REMOVE_SUCCESS, siteId, follower, data } ) )
				.catch( error => dispatch( { type: FOLLOWER_REMOVE_ERROR, siteId, follower, error } ) );
		};
	}
};
