/**
 * External Dependencies
 */
import {
	filter,
	forEach,
	has,
	isUndefined,
	map,
	omit,
	partition,
	reject } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_POSTS_RECEIVE
} from 'state/action-types';
import analytics from 'lib/analytics';
import { runFastRules, runSlowRules } from './normalization-rules';
import Dispatcher from 'dispatcher';
import { action } from 'lib/feed-post-store/constants';
import wpcom from 'lib/wp';

function trackRailcarRender( post ) {
	analytics.tracks.recordEvent( 'calypso_traintracks_render', post.railcar );
}

function postToKey( post ) {
	return {
		feedId: post.feed_ID,
		postId: post.ID,
		blogId: ! post.is_external && post.site_ID ? post.site_ID : undefined
	};
}

function fetchForKey( postKey ) {
	let req;
	if ( postKey.blogId ) {
		req = wpcom.undocumented().readSitePost( {
			site: postKey.blogId,
			postId: postKey.postId
		} );
	} else {
		req = wpcom.undocumented().readFeedPost( postKey );
	}
	return req;
}

export function fetchPost( postKey ) {
	return function( dispatch ) {
		return fetchForKey( postKey ).then(
			( data ) => {
				dispatch( receivePosts( [ data ] ) );
			},
			( err ) => {
				dispatch( {
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
				} );
			}
		);
	};
}

export function reloadPost( post ) {
	return function( dispatch ) {
		// keep track of any railcars we might have
		const railcar = post.railcar;
		return fetchForKey( postToKey( post ) ).then(
			( data ) => {
				data.railcar = railcar;
				dispatch( receivePosts( [ data ] ) );
			}
		);
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
		const normalizedPosts = map( withoutUndefined, runFastRules );

		const [ postsToReload, postsToProcess ] = partition( normalizedPosts, '_should_reload' );
		forEach( postsToReload, post => {
			delete post._should_reload;
			dispatch( reloadPost( post ) );
		} );

		forEach( map( postsToProcess, runSlowRules ), slowPromise => {
			slowPromise.then( post => {
				dispatch( {
					type: READER_POSTS_RECEIVE,
					posts: [ post ]
				} );

				// keep the old feed post store in sync
				Dispatcher.handleServerAction( {
					data: post,
					type: action.RECEIVE_NORMALIZED_FEED_POST
				} );
			} );
		} );

		dispatch( {
			type: READER_POSTS_RECEIVE,
			posts: normalizedPosts
		} );

		// keep the old feed post store in sync
		forEach( normalizedPosts, post => {
			const postForFlux = has( post, '_should_reload' ) ? omit( post, '_should_reload' ) : post;
			Dispatcher.handleServerAction( {
				data: postForFlux,
				type: action.RECEIVE_NORMALIZED_FEED_POST
			} );
		} );

		forEach( filter( postsToProcess, 'railcar' ), trackRailcarRender );

		return Promise.resolve( normalizedPosts );
	};
}
