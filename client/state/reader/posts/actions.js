/**
 * External Dependencies
 */
import {
	filter,
	forEach,
	isUndefined,
	map,
	reject } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_POSTS_RECEIVE
} from 'state/action-types';
import analytics from 'lib/analytics';
import { asyncRunRules } from './normalization-rules';
import Dispatcher from 'dispatcher';
import { action } from 'lib/feed-post-store/constants';
import wpcom from 'lib/wp';

function trackRailcarRender( post ) {
	analytics.tracks.recordEvent( 'calypso_traintracks_render', post.railcar );
}

export function postToKey( post ) {
	if ( post && post.feed_ID && post.feed_item_ID ) {
		return {
			feedId: post.feed_ID,
			postId: post.feed_item_ID
		};
	}

	if ( post.is_external ) {
		return {
			feedId: post.feed_ID,
			postId: post.ID
		};
	}

	return {
		postId: post.ID,
		blogId: post.site_ID
	};
}

function fetchForKey( postKey ) {
	if ( postKey.blogId ) {
		return wpcom.undocumented().readSitePost( {
			site: postKey.blogId,
			postId: postKey.postId
		} );
	}
	return wpcom.undocumented().readFeedPost( postKey );
}

export function fetchPost( postKey ) {
	return dispatch => fetchForKey( postKey ).then(
		data => dispatch( receivePosts( [ data ] ) ),
		err => dispatch( {
			type: READER_POSTS_RECEIVE,
			posts: [ {
				feed_ID: postKey.feedId,
				ID: postKey.postId,
				site_ID: postKey.blogId,
				is_external: ! postKey.blogId,
				is_error: true,
				global_ID: `${ postKey.feedId || 'na' }-${ postKey.blogId || 'na' }-${ postKey.postId }`,
				error: err
			} ]
		} )
	);
}

export function reloadPost( post ) {
	return dispatch => {
		// keep track of any railcars we might have
		const railcar = post.railcar;
		return fetchForKey( postToKey( post ) ).then( data => {
			data.railcar = railcar;
			return dispatch( receivePosts( [ data ] ) );
		} );
	};
}

/**
 * Returns an action object to signal that post objects have been received.
 *
 * @param  {Array}  posts Posts received
 * @return {Object} Action object
 */
export function receivePosts( posts ) {
	return function( dispatch ) {
		if ( ! posts ) {
			return Promise.resolve( [] );
		}

		const withoutUndefined = reject( posts, isUndefined );

		forEach( map( withoutUndefined, asyncRunRules ), promise => {
			promise.then( post => {
				dispatch( {
					type: READER_POSTS_RECEIVE,
					posts: [ post ]
				} );

				// keep the old feed post store in sync
				Dispatcher.handleServerAction( {
					data: post,
					type: action.RECEIVE_NORMALIZED_FEED_POST
				} );
				if ( post._should_reload ) {
					delete post._should_reload;
					dispatch( reloadPost( post ) );
				}
			} );
		} );


		forEach( filter( withoutUndefined, 'railcar' ), trackRailcarRender );

		return Promise.resolve( withoutUndefined );
	};
}
