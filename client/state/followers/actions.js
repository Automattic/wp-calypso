/**
 * Internal dependencies
 */
import {
	FOLLOWERS_RECEIVE,
	FOLLOWERS_REQUEST,
	FOLLOWERS_REQUEST_ERROR,
	FOLLOWER_REMOVE_ERROR,
	FOLLOWER_REMOVE_REQUEST,
	FOLLOWER_REMOVE_SUCCESS,
} from 'calypso/state/action-types';

export const requestFollowers = ( query ) => ( {
	type: FOLLOWERS_REQUEST,
	query,
} );

export const successRequestFollowers = ( query, data ) => ( {
	type: FOLLOWERS_RECEIVE,
	query,
	data,
} );

export const failRequestFollowers = ( query, error ) => ( {
	type: FOLLOWERS_REQUEST_ERROR,
	query,
	error,
} );

export const requestRemoveFollower = ( siteId, follower ) => ( {
	type: FOLLOWER_REMOVE_REQUEST,
	siteId,
	follower,
} );

export const successRemoveFollower = ( siteId, follower, data ) => ( {
	type: FOLLOWER_REMOVE_SUCCESS,
	siteId,
	follower,
	data,
} );

export const failRemoveFollower = ( siteId, follower, error ) => ( {
	type: FOLLOWER_REMOVE_ERROR,
	siteId,
	follower,
	error,
} );
