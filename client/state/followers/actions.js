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
				// TODO: replace FETCHING_FOLLOWERS with FOLLOWERS_REQUEST
				dispatch( {
					type: FOLLOWERS_REQUEST,
					query
				} );
			}
			wpcom.site( query.siteId ).statsFollowers( query, function( error, data ) {
				// TODO: replace RECEIVE_FOLLOWERS with FOLLOWERS_RECEIVE, FOLLOWERS_REQUEST_ERROR
				// TODO: statsFollowers should return a promise
				debug( 'followers received', error, data );
				if ( error ) {
					dispatch( {
						type: FOLLOWERS_REQUEST_ERROR,
						query,
						error
					} );
				} else {
					dispatch( {
						type: FOLLOWERS_RECEIVE,
						query,
						data
					} );
				}
			} );
		};
	},
	removeFollower( siteId, follower ) {
		return ( dispatch ) => {
			debug( 'removing follower', follower, siteId );
			// TODO: replace REMOVE_FOLLOWER with FOLLOWER_REMOVE
			dispatch( {
				type: FOLLOWER_REMOVE_REQUEST,
				siteId: siteId,
				follower: follower
			} );
			wpcom.undocumented().site( siteId ).removeFollower( follower.ID, function( error, data ) {
				// TODO: replace RECEIVE_REMOVE_FOLLOWER_ERROR and RECEIVE_REMOVE_FOLLOWER_SUCCESS with FOLLOWER_REMOVE_ERROR, FOLLOWER_REMOVE_SUCCESS
				debug( 'removed follower received', error, data );
				if ( error ) {
					dispatch( {
						type: FOLLOWER_REMOVE_ERROR,
						siteId,
						follower,
						error
					} );
				} else {
					dispatch( {
						type: FOLLOWER_REMOVE_SUCCESS,
						siteId,
						follower,
						data
					} );
				}
			} );
		};
	}
};
