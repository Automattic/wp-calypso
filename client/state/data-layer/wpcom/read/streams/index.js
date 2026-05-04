import warn from '@wordpress/warning';
import i18n from 'i18n-calypso';
import { random, map } from 'lodash';
import { keyForPost } from 'calypso/reader/post-key';
import XPostHelper from 'calypso/reader/xpost-helper';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	READER_STREAMS_PAGE_REQUEST,
	READER_STREAMS_PAGINATED_REQUEST,
} from 'calypso/state/reader/action-types';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import {
	receivePage,
	receiveUpdates,
	receiveStreamError,
} from 'calypso/state/reader/streams/actions';
import { isMigratedStream } from 'calypso/state/reader/streams/migrated-stream-types';
import {
	PER_FETCH,
	INITIAL_FETCH,
	PER_GAP,
	QUERY_META,
	SITE_LIMITER_FIELDS,
	analyticsForStream,
	createStreamDataFromPosts,
	extractPageHandle,
	getAlgorithmForStream,
	getQueryString,
	getQueryStringForPoll,
} from 'calypso/state/reader/streams/normalize';

// Re-exported for legacy consumers (e.g. client/reader/stream/index.jsx).
export { PER_FETCH, INITIAL_FETCH, QUERY_META, SITE_LIMITER_FIELDS };

function createStreamItemFromSiteAndPost( site, post, dateProperty ) {
	return {
		...keyForPost( post ),
		date: post[ dateProperty ],
		...( post.comments && { comments: map( post.comments, 'ID' ).reverse() } ), // include comments for conversations
		url: post.URL,
		site_icon: site.icon?.ico,
		site_description: site.description,
		site_name: site.name,
		feed_URL: post.feed_URL,
		feed_ID: post.feed_ID,
		xPostMetadata: XPostHelper.getXPostMetadata( post ),
	};
}

function createStreamItemFromSite( site, dateProperty ) {
	const post = site.posts?.[ 0 ] ?? null;
	if ( ! post ) {
		return null;
	}
	return createStreamItemFromSiteAndPost( site, post, dateProperty );
}

function createStreamDataFromSites( sites, dateProperty ) {
	const streamItems = [];
	const streamPosts = [];

	sites.forEach( ( site ) => {
		const streamItem = createStreamItemFromSite( site, dateProperty );
		if ( streamItem !== null ) {
			streamItems.push( streamItem );
		}

		const post = site.posts?.[ 0 ];
		if ( post !== undefined ) {
			streamPosts.push( post );
		}
	} );

	return { streamItems, streamPosts };
}

const defaultQueryFn = getQueryString;

const seed = random( 0, 1000 );

const streamApis = {
	conversations: {
		path: () => '/read/conversations',
		dateProperty: 'last_comment_date_gmt',
		query: ( extras ) => getQueryString( { ...extras, comments_per_post: 20 } ),
		pollQuery: () => getQueryStringForPoll( [ 'last_comment_date_gmt', 'comments' ] ),
	},
	'conversations-a8c': {
		path: () => '/read/conversations',
		dateProperty: 'last_comment_date_gmt',
		query: ( extras ) => getQueryString( { ...extras, index: 'a8c', comments_per_post: 20 } ),
		pollQuery: () =>
			getQueryStringForPoll( [ 'last_comment_date_gmt', 'comments' ], { index: 'a8c' } ),
	},
	likes: {
		path: () => '/read/liked',
		dateProperty: 'date_liked',
		pollQuery: () => getQueryStringForPoll( [ 'date_liked' ] ),
	},
	recommendations_posts: {
		path: () => '/read/recommendations/posts',
		dateProperty: 'date',
		query: ( { query } ) => {
			return { ...query, seed, algorithm: 'read:recommendations:posts/es/1' };
		},
	},
	custom_recs_posts_with_images: {
		path: () => '/read/recommendations/posts',
		dateProperty: 'date',
		query: ( extras ) =>
			getQueryString( {
				...extras,
				seed,
				alg_prefix: 'read:recommendations:posts',
			} ),
	},
	custom_recs_sites_with_images: {
		path: () => '/read/recommendations/sites',
		dateProperty: 'date',
		query: ( extras ) =>
			getQueryString( {
				...extras,
				algorithm: 'read:recommendations:sites/es/2',
				posts_per_site: 1,
			} ),
		// Recommended sites can only return a max of 10 sites per request, so we need to override the default number.
		pollQuery: ( extraFields = [], extraQueryParams = {} ) =>
			getQueryStringForPoll( extraFields, { ...extraQueryParams, number: 10 } ),
	},
};

/**
 * Request a page for the given stream
 * @param  {Object}   action   Action being handled
 * @returns {Object | undefined} http action for data-layer to dispatch
 */
export function requestPage( action ) {
	const {
		payload: { streamKey, streamType, feedId, pageHandle, isPoll, gap, localeSlug, page, perPage },
	} = action;

	// Migrated streams are fetched by the React Query thunk in
	// `client/state/reader/streams/actions.js`. The action is still dispatched
	// so the reducer's `isRequesting`/`error` transitions fire, but the HTTP
	// call must not be issued here too.
	if ( isMigratedStream( streamType ) ) {
		return;
	}

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

	const algorithm = getAlgorithmForStream( streamKey )
		? { algorithm: getAlgorithmForStream( streamKey ) }
		: {};

	const fetchCount = pageHandle ? PER_FETCH : INITIAL_FETCH;
	// eslint-disable-next-line no-extra-boolean-cast
	let number;
	if ( page ) {
		number = perPage;
	} else {
		number = gap ? PER_GAP : fetchCount;
	}

	// Set lang to the localeSlug if it is provided, otherwise use the default locale
	// There is a race condition in switchLocale when retrieving the language file
	// The stream request can occur before the language file is loaded, so we need a way to explicitly set the lang in the request
	const lang = localeSlug || i18n.getLocaleSlug();
	const commonQueryParams = { ...algorithm, feed_id: feedId };

	return http( {
		method: 'GET',
		path: path( { ...action.payload } ),
		apiVersion,
		apiNamespace: api.apiNamespace?.( action.payload ) ?? null,
		query: isPoll
			? pollQuery( [], commonQueryParams )
			: query( { ...commonQueryParams, ...pageHandle, number, lang, page }, action.payload ),
		onSuccess: action,
		onFailure: action,
	} );
}

export function handlePage( action, data ) {
	const { posts, sites } = data;
	const { streamKey, query, isPoll, gap, streamType, page, perPage } = action.payload;
	const pageHandle = extractPageHandle( streamType, action, data );
	const { dateProperty } = streamApis[ streamType ];

	let streamItems = [];
	let streamPosts = [];

	if ( posts ) {
		const streamData = createStreamDataFromPosts( posts, dateProperty );
		streamItems = streamData.streamItems;
		streamPosts = streamData.streamPosts;
	} else if ( sites ) {
		const streamData = createStreamDataFromSites( sites, dateProperty );
		streamItems = streamData.streamItems;
		streamPosts = streamData.streamPosts;
	}

	const actions = analyticsForStream( {
		streamKey,
		algorithm: data.algorithm,
		items: streamPosts || sites,
	} );

	if ( isPoll ) {
		actions.push( receiveUpdates( { streamKey, streamItems, query } ) );
		return actions;
	}

	if ( streamPosts.length > 0 ) {
		actions.push( receivePosts( streamPosts ) );
	}

	const totalItems = data.total_cards || data.found || streamItems.length;
	const totalPages =
		data.total_pages || Math.ceil( totalItems / ( action.payload.perPage || PER_FETCH ) );

	actions.push(
		receivePage( {
			streamKey,
			query,
			streamItems,
			pageHandle,
			gap,
			totalItems,
			totalPages,
			page,
			perPage,
		} )
	);

	return actions;
}

const handleError = ( action, error ) => {
	return receiveStreamError( action, error );
};

registerHandlers( 'state/data-layer/wpcom/read/streams/index.js', {
	[ READER_STREAMS_PAGE_REQUEST ]: [
		dispatchRequest( {
			fetch: requestPage,
			onSuccess: handlePage,
			onError: handleError,
		} ),
	],
	[ READER_STREAMS_PAGINATED_REQUEST ]: [
		dispatchRequest( {
			fetch: requestPage,
			onSuccess: handlePage,
			onError: handleError,
		} ),
	],
} );
