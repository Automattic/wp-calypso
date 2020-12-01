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
 * @param {object} query params to be sent to the API
 */
export const requestFollowers = ( query ) => ( {
	type: FOLLOWERS_REQUEST,
	query,
} );

/**
 * Returns an action object used in signalling that a request for followers
 * was successfull.
 *
 * @param {object} query params which were sent to the API
 * @param {object} data API response object
 */
export const successRequestFollowers = ( query, data ) => ( {
	type: FOLLOWERS_RECEIVE,
	query,
	data,
} );

/**
 * Returns an action object used in signalling that a request for followers
 * has failed.
 *
 * @param {object} query params which were sent to the API
 * @param {object} error contains the error response
 */
export const failRequestFollowers = ( query, error ) => ( {
	type: FOLLOWERS_REQUEST_ERROR,
	query,
	error,
} );

/**
 * Returns an action object used in signalling that a follower should
 * be removed from the site.
 *
 * @param {number} siteId site identifier
 * @param {object} follower follower object
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
 * @param {number} siteId site identifier
 * @param {object} follower removed follower object
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
 * @param {number} siteId site identifier
 * @param {object} follower follower object
 * @param {object} error contains the error response
 */
export const failRemoveFollower = ( siteId, follower, error ) => ( {
	type: FOLLOWER_REMOVE_ERROR,
	siteId,
	follower,
	error,
} );
