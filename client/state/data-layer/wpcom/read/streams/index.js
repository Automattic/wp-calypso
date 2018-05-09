/** @format */

/**
 * External dependencies
 */
import { random } from 'lodash';
import { translate } from 'i18n-calypso';
import querystring from 'querystring';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import warn from 'lib/warn';
import { READER_STREAMS_PAGE_REQUEST } from 'state/action-types';
import { receivePage, receiveUpdates } from 'state/reader/streams/actions';
import { errorNotice } from 'state/notices/actions';
import { receivePosts } from 'state/reader/posts/actions';

/**
 * Pull the suffix off of a stream key
 *
 * A stream key is a : delimited string, with the form
 * {prefix}:{suffix}
 *
 * Prefix cannot contain a colon, while the suffix may.
 *
 * A colon is not required.
 *
 * Valid IDs look like
 * `following`
 * `site:1234`
 * `search:a:value` ( prefix is `search`, suffix is `a:value` )
 *
 * @param  {String} streamKey The stream ID to break apart
 * @return {String}          The stream ID suffix
 */
function streamKeySuffix( streamKey ) {
	return streamKey.substring( streamKey.indexOf( ':' ) + 1 );
}

const PER_RECS = 6;
const PER_POLL = 5;

export const getQueryString = ( extras = {} ) => {
	const meta = [ 'post', 'discover_original_post' ].join( ',' );
	return { orderBy: 'date', meta, ...extras };
};
const defaultQueryFn = getQueryString;

const SITE_LIMITER_FIELDS = [ 'ID', 'site_ID', 'date', 'feed_ID', 'feed_item_ID', 'global_ID' ];
function getQueryStringForPoll( extraFields = [], extraQueryParams = {} ) {
	return {
		orderBy: 'date',
		number: PER_POLL,
		fields: [ SITE_LIMITER_FIELDS, ...extraFields ].join( ',' ),
		...extraQueryParams,
	};
}

// function trainTracksProxyForStream( stream, callback ) {
// 	return function( err, response ) {
// 		const eventName = 'calypso_traintracks_render';
// 		if ( response && response.algorithm ) {
// 			stream.algorithm = response.algorithm;
// 		}
// 		forEach( response && response.posts, post => {
// 			if ( post.railcar ) {
// 				if ( stream.isQuerySuggestion ) {
// 					post.railcar.rec_result = 'suggestion';
// 				}
// 				analytics.tracks.recordEvent( eventName, post.railcar );
// 			}
// 		} );
// 		callback( err, response );
// 	};
// }

// Each object is a composed of:
//   path: a function that given the action, returns The API path to hit
//   query: a function that given the action, returns the querystring to use.
const streamApis = {
	following: {
		path: () => '/read/following',
		pollQuery: getQueryStringForPoll,
	},
	search: {
		path: () => '/read/search',
		query: ( pageHandle, { streamKey } ) => {
			const { sort, q } = JSON.parse( streamKeySuffix( streamKey ) );
			return { orderBy: sort, q, ...pageHandle, sort };
		},
	},
	feed: {
		path: ( { streamKey } ) => `/read/feed/${ streamKeySuffix( streamKey ) }/posts`,
		pollQuery: getQueryStringForPoll,
	},
	site: {
		path: ( { streamKey } ) => `/read/sites/${ streamKeySuffix( streamKey ) }/posts`,
		pollQuery: getQueryStringForPoll,
	},
	conversations: {
		path: () => '/read/conversations',
		pollQuery: () => getQueryStringForPoll( [ 'last_comment_date_gmt', 'comments' ] ),
	},
	featured: {
		path: ( { streamKey } ) => `/read/sites/${ streamKeySuffix( streamKey ) }/featured`,
	},
	a8c: {
		path: () => '/read/a8c',
		pollQuery: getQueryStringForPoll,
	},
	'conversations-a8c': {
		path: () => '/read/conversations',
		query: extras => getQueryString( { ...extras, index: 'a8c' } ),
		pollQuery: () =>
			getQueryStringForPoll( [ 'last_comment_date_gmt', 'comments' ], { index: 'a8c' } ),
	},
	likes: {
		path: () => '/read/liked',
		pollQuery: () => getQueryStringForPoll( [ 'date_liked' ] ),
	},
	recommendations_posts: {
		path: () => '/read/recommendations/posts',
		query: ( { query } ) => {
			return {
				...query,
				seed: random( 0, 1000 ),
				algorithm: 'read:recommendations:posts/es/1',
			};
		},
	},
	custom_recs_posts_with_images: {
		path: () => '/read/recommendations/posts',
		query: extras => {
			return {
				...extras,
				meta: 'post,discover_original_post',
				content_width: 675,
				number: PER_RECS,
				orderBy: 'date',
				seed: random( 0, 1000 ),
				// algorithm: 'read:recommendations:posts/es/7',
				alg_prefix: 'read:recommendations:posts',
			};
		},
	},
	tag: {
		path: () => '/read/tags/:tag/posts',
		pollQuery: () => getQueryStringForPoll( [ 'tagged_on' ] ),
	},
	list: {
		path: ( { streamKey } ) => {
			const { owner, slug } = JSON.parse( streamKeySuffix( streamKey ) );
			return `/read/list/${ owner }/${ slug }/posts`;
		},
	},
};

/**
 * Request a page for the given stream
 * @param  {object}   action   Action being handled
 * @returns {object} http action for data-layer to dispatch
 */
export function requestPage( action ) {
	const { payload: { streamKey, streamType, pageHandle, isPoll } } = action;
	const api = streamApis[ streamType ];

	if ( ! api ) {
		warn( `Unable to determine api path for ${ streamKey }` );
		return;
	}

	const {
		apiVersion = '1.2',
		path,
		query = defaultQueryFn,
		pollQuery = getQueryStringForPoll,
	} = api;

	return http( {
		method: 'GET',
		path: path( { ...action.payload } ),
		apiVersion,
		query: isPoll ? pollQuery() : query( { ...pageHandle }, action.payload ),
		onSuccess: action,
		onFailure: action,
	} );
}

export function fromApi( data ) {
	// TODO: is there any transformation to do here?
	return data;
}

export function handlePage( action, data ) {
	const { posts, date_range, meta, next_page } = data;
	const { streamKey, query, isPoll } = action.payload;
	let pageHandle = {};

	if ( meta && meta.next_page ) {
		// sites give pange handles nested within the meta key
		pageHandle = { page_handle: next_page || meta.next_page };
	} else if ( next_page ) {
		// search api returns next_page as top-level.
		// but weirdly it returns the next querystring necessary
		// so this code breaks it down into an object
		// to be re-stringified later.
		// TODO: stop doing this extra work
		pageHandle = querystring.parse( next_page );
	} else if ( date_range ) {
		// feeds use date_range. no next_page handles here
		const { after } = date_range;
		pageHandle = { before: after };
	}
	const actions = [];
	if ( isPoll ) {
		actions.push( receiveUpdates( { streamKey, posts, query } ) );
	} else {
		actions.push( receivePage( { streamKey, query, posts, pageHandle } ) );
		actions.push( receivePosts( posts ) );
	}

	return actions;
}

export function handleError() {
	return errorNotice( translate( 'Could not fetch the next page of posts' ) );
}

export default {
	[ READER_STREAMS_PAGE_REQUEST ]: [
		dispatchRequestEx( {
			fetch: requestPage,
			onSuccess: handlePage,
			onError: handleError,
			fromApi,
		} ),
	],
};
