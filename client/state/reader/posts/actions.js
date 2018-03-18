/** @format */
/**
 * External Dependencies
 */
import { v4 as uuid } from 'uuid';
import { filter, forEach, compact, partition, get } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_POSTS_RECEIVE, READER_POST_SEEN } from 'state/action-types';
import analytics, { mc } from 'lib/analytics';
import { runFastRules, runSlowRules } from './normalization-rules';
import wpcom from 'lib/wp';
import { keyForPost } from 'lib/feed-stream-store/post-key';
import { pageViewForPost } from 'reader/stats';
import { hasPostBeenSeen } from './selectors';

function trackRailcarRender( post ) {
	analytics.tracks.recordEvent( 'calypso_traintracks_render', post.railcar );
}

function fetchForKey( postKey ) {
	if ( postKey.blogId ) {
		return wpcom.undocumented().readSitePost( {
			site: postKey.blogId,
			postId: postKey.postId,
		} );
	}
	return wpcom.undocumented().readFeedPost( postKey );
}

// helper that hides promise rejections so they return successfully with null instead of rejecting
// this is so that a failure within a slow run of normalization doesn't stop successful posts
// from being dispatched
const hideRejections = promise => promise.catch( () => null );

/**
 * Returns an action object to signal that post objects have been received.
 *
 * @param  {Array}  posts Posts received
 * @return {Object} Action object
 */
export const receivePosts = posts => dispatch => {
	if ( ! posts ) {
		return Promise.resolve( [] );
	}

	const [ toReload, toProcess ] = partition( posts, '_should_reload' );
	toReload.forEach( post => dispatch( reloadPost( post ) ) );

	const normalizedPosts = compact( toProcess ).map( runFastRules );

	// save the posts after running the fast rules
	dispatch( {
		type: READER_POSTS_RECEIVE,
		posts: normalizedPosts,
	} );

	// also save them after running the slow rules
	Promise.all( normalizedPosts.map( runSlowRules ).map( hideRejections ) ).then( processedPosts =>
		dispatch( {
			type: READER_POSTS_RECEIVE,
			posts: compact( processedPosts ), // prune out the "null" rejections
		} )
	);

	forEach( filter( normalizedPosts, 'railcar' ), trackRailcarRender );

	// TODO: resolve weird dependency between related-posts and the return here
	return Promise.resolve( normalizedPosts );
};

export const fetchPost = postKey => dispatch => {
	return fetchForKey( postKey )
		.then( data => dispatch( receivePosts( [ data ] ) ) )
		.catch( error => dispatch( receiveErrorForPostKey( error, postKey ) ) );
};

function receiveErrorForPostKey( error, postKey ) {
	return {
		type: READER_POSTS_RECEIVE,
		posts: [
			{
				feed_ID: postKey.feedId,
				ID: postKey.postId,
				site_ID: postKey.blogId,
				is_external: ! postKey.blogId,
				global_ID: uuid(),
				is_error: true,
				error,
			},
		],
	};
}

export function reloadPost( post ) {
	return function( dispatch ) {
		// keep track of any railcars we might have
		const railcar = post.railcar;
		const postKey = keyForPost( post );
		fetchForKey( postKey ).then( data => {
			data.railcar = railcar;
			dispatch( receivePosts( [ data ] ) );
		} );
	};
}

export const markPostSeen = ( post, site ) => ( dispatch, getState ) => {
	if ( ! post || hasPostBeenSeen( getState(), post.global_ID ) ) {
		return;
	}

	dispatch( { type: READER_POST_SEEN, payload: { post, site } } );

	if ( post.site_ID ) {
		// they have a site ID, let's try to push a page view
		const isAdmin = !! get( site, 'capabilities.manage_options', false );
		if ( site && site.ID ) {
			if ( site.is_private || ! isAdmin ) {
				pageViewForPost( site.ID, site.URL, post.ID, site.is_private );
				mc.bumpStat( 'reader_pageviews', site.is_private ? 'private_view' : 'public_view' );
			}
		}
	}
};
