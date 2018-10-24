/** @format */
/**
 * Data access functions for Publicizing in Gutenberg.
 *
 * This file contains a set of helper functions that
 * gather data and/or send requests for data to support
 * the features of Publicize in Gutenberg.
 */

/**
 * External Dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Get up-to-date connection list data for post.
 *
 * Retrieves array of filtered connection UI data (labels, checked value).
 * Connection list is queried based on post id because the connection
 * filtering depends on current post.
 *
 * @param {integer} postId ID of post to query connection defaults for.
 *
 * @return {Promise} Promise for connection request.
 */
export function requestPublicizeConnections( postId ) {
	return apiFetch( {
		path: '/publicize/posts/' + postId.toString() + '/connections',
	} );
}

/**
 * Gets list of all possible connections.
 *
 * Gets list of possible social sites ('twitter', 'facebook, etc..')
 *
 * @return {object} List of possible services that can be connected to
 */
export function getAllConnections() {
	return apiFetch( {
		path: '/publicize/services',
	} );
}

/**
 * Verifies that all connections are still functioning.
 *
 * @return {object} List of possible services that can be connected to
 */
export function requestTestPublicizeConnections() {
	return apiFetch( {
		path: '/publicize/connections',
	} );
}
