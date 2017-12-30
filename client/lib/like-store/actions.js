/** @format */
/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import { key } from './utils';
import wpcom from 'lib/wp';

const inflight = {};

function requestInflight( requestKey ) {
	return requestKey in inflight;
}

function requestTracker( requestKey, callback ) {
	inflight[ requestKey ] = true;
	return function( error, data ) {
		delete inflight[ requestKey ];
		callback( error, data );
	};
}

function getQuery() {
	// Attribute likes to reader in stats
	return { source: 'reader' };
}

/**
 * Fetch a post's list of likes
 *
 *
 * Note: the endpoint will currently return a maximum of 90 likes, and there's no pagination
 *
 *
 * @param {int} Site ID
 * @param {int} Post ID
 */
export function fetchLikes( siteId, postId ) {
	if ( requestInflight( key( siteId, postId ) ) ) {
		return;
	}

	var requestKey = key( siteId, postId ),
		callback = requestTracker( requestKey, function( error, data ) {
			receivePostLikes( error, siteId, postId, data );
		} );

	wpcom
		.site( siteId )
		.post( postId )
		.likesList( callback );
}

/**
 * Like a post as the current user
 *
 * @param {int} siteId The Site ID
 * @param {int} postId The Post ID
 */
export function likePost( siteId, postId ) {
	Dispatcher.handleViewAction( {
		type: 'LIKE_POST',
		siteId: siteId,
		postId: postId,
	} );

	wpcom
		.site( siteId )
		.post( postId )
		.like()
		.add( getQuery(), function( error, data ) {
			receiveLikeResponse( error, siteId, postId, data );
		} );
}

/**
 * Unlike a post as the current user
 * @param {int} siteId The Site ID
 * @param {int} postId The Post ID
 */
export function unlikePost( siteId, postId ) {
	Dispatcher.handleViewAction( {
		type: 'UNLIKE_POST',
		siteId: siteId,
		postId: postId,
	} );
}

export function receivePostLikes( error, siteId, postId, data ) {
	Dispatcher.handleServerAction( {
		type: 'RECEIVE_POST_LIKES',
		error: error,
		siteId: siteId,
		postId: postId,
		data: data,
	} );
}

export function receiveLikeResponse( error, siteId, postId, data ) {
	Dispatcher.handleServerAction( {
		type: 'RECEIVE_LIKE_RESPONSE',
		error: error,
		siteId: siteId,
		postId: postId,
		data: data,
	} );
}

// @todo Some weirdness with the data received here...seems to be attached to siteId not data.
export function receiveUnlikeResponse( error, siteId, postId, data ) {
	Dispatcher.handleServerAction( {
		type: 'RECEIVE_UNLIKE_RESPONSE',
		error: error,
		siteId: siteId,
		postId: postId,
		data: data,
	} );
}
