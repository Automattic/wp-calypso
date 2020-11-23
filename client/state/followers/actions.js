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

/**
 * Returns an action object used in signalling that followers for the site
 * have been requested..
 *
 * @param {object} query Params to be sent to the API
 */
export const requestFollowers = ( query ) => ( {
	type: FOLLOWERS_REQUEST,
	query,
} );

/**
 * Returns an action object used in signalling that a request for followers
 * was successful.
 *
 * @param {object} query Params which were sent to the API
 * @param {object} data API response object
 */
export const requestFollowersSuccess = ( query, data ) => ( {
	type: FOLLOWERS_RECEIVE,
	query,
	data,
} );

/**
 * Returns an action object used in signalling that a request for followers
 * has failed.
 *
 * @param {object} query Params which were sent to the API
 * @param {object} error Contains the error response
 */
export const requestFollowersFailure = ( query, error ) => ( {
	type: FOLLOWERS_REQUEST_ERROR,
	query,
	error,
} );

/**
 * Returns an action object used in signalling that a follower should
 * be removed from the site.
 *
 * @param {number} siteId Site identifier
 * @param {object} follower Object containing follower data
 */
export const requestRemoveFollower = ( siteId, follower ) => ( {
	type: FOLLOWER_REMOVE_REQUEST,
	siteId,
	follower,
} );

/**
 * Returns an action object used in signalling that a follower has been
 * removed from the site successfully.
 *
 * @param {number} siteId Site identifier
 * @param {object} follower The removed follower object
 * @param {object} data API response object
 */
export const successRemoveFollower = ( siteId, follower, data ) => ( {
	type: FOLLOWER_REMOVE_SUCCESS,
	siteId,
	follower,
	data,
} );

/**
 * Returns an action object used in signalling that removal of a follower
 * has failed.
 *
 * @param {number} siteId Site identifier
 * @param {object} follower Object containing follower data
 * @param {object} error Contains the error response
 */
export const failRemoveFollower = ( siteId, follower, error ) => ( {
	type: FOLLOWER_REMOVE_ERROR,
	siteId,
	follower,
	error,
} );
