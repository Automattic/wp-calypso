import { filter, forEach, partition, get } from 'lodash';
import { bumpStat } from 'calypso/lib/analytics/mc';
import wpcom from 'calypso/lib/wp';
import readerContentWidth from 'calypso/reader/lib/content-width';
import { keyForPost, keyToString } from 'calypso/reader/post-key';
import { receiveLikes } from 'calypso/state/posts/likes/actions';
import { READER_POSTS_RECEIVE, READER_POST_SEEN } from 'calypso/state/reader/action-types';
import { runFastRules, runSlowRules } from './normalization-rules';
import { hasPostBeenSeen } from './selectors';

import 'calypso/state/reader/init';

// TODO: make underlying lib/analytics/tracks and reader/stats capable of existing in test code without mocks
// OR switch to analytics middleware
let tracks = { recordEvent: () => {} };
let pageViewForPost = () => {};
if ( process.env.NODE_ENV !== 'test' ) {
	pageViewForPost = require( 'calypso/reader/stats' ).pageViewForPost;
	tracks = require( 'calypso/lib/analytics/tracks' );
}

function trackRailcarRender( post ) {
	tracks.recordTracksEvent( 'calypso_traintracks_render', post.railcar );
}

function fetchForKey( postKey ) {
	const query = {};

	const contentWidth = readerContentWidth();
	if ( contentWidth ) {
		query.content_width = contentWidth;
	}

	if ( postKey.blogId ) {
		return wpcom.req.get(
			`/read/sites/${ encodeURIComponent( postKey.blogId ) }/posts/${ encodeURIComponent(
				postKey.postId
			) }`,
			query
		);
	}
	const { postId, feedId, ...params } = postKey;
	return wpcom.req.get(
		`/read/feed/${ encodeURIComponent( feedId ) }/posts/${ encodeURIComponent( postId ) }`,
		{
			apiVersion: '1.2',
			...params,
			...query,
		}
	);
}

// helper that hides promise rejections so they return successfully with null instead of rejecting
// this is so that a failure within a slow run of normalization doesn't stop successful posts
// from being dispatched
const hideRejections = ( promise ) => promise.catch( () => null );

/**
 * Returns an action object to signal that post objects have been received.
 * @param  {Array}  posts Posts received
 * @returns {Object} Action object
 */
export const receivePosts = ( posts ) => ( dispatch ) => {
	if ( ! posts ) {
		return Promise.resolve( [] );
	}

	const [ toReload, toProcess ] = partition( posts, '_should_reload' );
	toReload.forEach( ( post ) => dispatch( reloadPost( post ) ) );

	const normalizedPosts = toProcess.filter( Boolean ).map( runFastRules );

	// dispatch post like additions before the posts. Cuts down on rerenders a bit.
	forEach( normalizedPosts, ( post ) => {
		if ( ! post.is_external ) {
			dispatch(
				receiveLikes( post.site_ID, post.ID, {
					iLike: Boolean( post.i_like ),
					found: +post.like_count,
				} )
			);
		}
	} );

	// save the posts after running the fast rules
	dispatch( {
		type: READER_POSTS_RECEIVE,
		posts: normalizedPosts,
	} );

	// also save them after running the slow rules
	Promise.all( normalizedPosts.map( runSlowRules ).map( hideRejections ) ).then(
		( processedPosts ) =>
			dispatch( {
				type: READER_POSTS_RECEIVE,
				posts: processedPosts.filter( Boolean ), // prune out the "null" rejections
			} )
	);

	forEach( filter( normalizedPosts, 'railcar' ), trackRailcarRender );

	// TODO: resolve weird dependency between related-posts and the return here
	return Promise.resolve( normalizedPosts );
};

const requestsInFlight = new Set();
export const fetchPost =
	( postKey, isHelpCenter = false ) =>
	( dispatch ) => {
		const requestKey = keyToString( postKey );
		if ( requestsInFlight.has( requestKey ) ) {
			return;
		}

		requestsInFlight.add( requestKey );
		function removeKey() {
			requestsInFlight.delete( requestKey );
		}
		return fetchForKey( postKey, isHelpCenter )
			.then( ( data ) => {
				removeKey();
				return dispatch( receivePosts( [ data ] ) );
			} )
			.catch( ( error ) => {
				removeKey();
				return dispatch( receiveErrorForPostKey( error, postKey ) );
			} );
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
				global_ID: crypto.randomUUID(),
				is_error: true,
				error,
			},
		],
	};
}

export function reloadPost( post ) {
	return function ( dispatch ) {
		// keep track of any railcars we might have
		const railcar = post.railcar;
		const postKey = keyForPost( post );
		fetchForKey( postKey ).then( ( data ) => {
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
				bumpStat( 'reader_pageviews', site.is_private ? 'private_view' : 'public_view' );
			}
		}
	}
};
