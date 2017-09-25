/**
 * External dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:like-store:actions' ); //eslint-disable-line no-unused-vars

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

const LikeActions = {

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
	fetchLikes: function( siteId, postId ) {
		if ( requestInflight( key( siteId, postId ) ) ) {
			return;
		}

		let requestKey = key( siteId, postId ),
			callback = requestTracker( requestKey, function( error, data ) {
				LikeActions.receivePostLikes( error, siteId, postId, data );
			} );

		wpcom.site( siteId ).post( postId ).likesList( callback );
	},

	/**
	* Like a post as the current user
	*
	* @param {int} siteId The Site ID
	* @param {int} postId The Post ID
	*/
	likePost: function( siteId, postId ) {
		Dispatcher.handleViewAction( {
			type: 'LIKE_POST',
			siteId: siteId,
			postId: postId
		} );

		wpcom.site( siteId ).post( postId ).like().add( getQuery(), function( error, data ) {
			LikeActions.receiveLikeResponse( error, siteId, postId, data );
		} );
	},

	/**
	 * Unlike a post as the current user
	 * @param {int} siteId The Site ID
	 * @param {int} postId The Post ID
	 */
	unlikePost: function( siteId, postId ) {
		Dispatcher.handleViewAction( {
			type: 'UNLIKE_POST',
			siteId: siteId,
			postId: postId
		} );

		wpcom.site( siteId ).post( postId ).like().del( getQuery(), function( error, data ) {
			LikeActions.receiveUnlikeResponse( error, siteId, postId, data );
		} );
	},

	receivePostLikes: function( error, siteId, postId, data ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_POST_LIKES',
			error: error,
			siteId: siteId,
			postId: postId,
			data: data
		} );
	},

	receiveLikeResponse: function( error, siteId, postId, data ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_LIKE_RESPONSE',
			error: error,
			siteId: siteId,
			postId: postId,
			data: data
		} );
	},

	// @todo Some weirdness with the data received here...seems to be attached to siteId not data.
	receiveUnlikeResponse: function( error, siteId, postId, data ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_UNLIKE_RESPONSE',
			error: error,
			siteId: siteId,
			postId: postId,
			data: data
		} );
	}
};

export default LikeActions;
