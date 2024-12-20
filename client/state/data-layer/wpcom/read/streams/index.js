import warn from '@wordpress/warning';
import i18n from 'i18n-calypso';
import { random, map, includes, get } from 'lodash';
import { buildDiscoverStreamKey, getTagsFromStreamKey } from 'calypso/reader/discover/helper';
import { keyForPost } from 'calypso/reader/post-key';
import XPostHelper from 'calypso/reader/xpost-helper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	READER_STREAMS_PAGE_REQUEST,
	READER_STREAMS_PAGINATED_REQUEST,
} from 'calypso/state/reader/action-types';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import { receiveRecommendedSites } from 'calypso/state/reader/recommended-sites/actions';
import { receivePage, receiveUpdates } from 'calypso/state/reader/streams/actions';

const noop = () => {};

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
 * @param  {string} streamKey The stream ID to break apart
 * @returns {string}          The stream ID suffix
 */
function streamKeySuffix( streamKey ) {
	return streamKey.substring( streamKey.indexOf( ':' ) + 1 );
}

const analyticsAlgoMap = new Map();
function analyticsForStream( { streamKey, algorithm, items } ) {
	if ( ! streamKey || ! algorithm || ! items ) {
		return [];
	}

	analyticsAlgoMap.set( streamKey, algorithm );

	const eventName = 'calypso_traintracks_render';
	const analyticsActions = items
		.filter( ( item ) => !! item.railcar )
		.map( ( item ) => recordTracksEvent( eventName, item.railcar ) );
	return analyticsActions;
}
const getAlgorithmForStream = ( streamKey ) => analyticsAlgoMap.get( streamKey );

function createStreamItemFromPost( post, dateProperty ) {
	return {
		...keyForPost( post ),
		date: post[ dateProperty ],
		...( post.comments && { comments: map( post.comments, 'ID' ).reverse() } ), // include comments for conversations
		url: post.URL,
		site_icon: post.site_icon?.ico,
		site_description: post.description,
		site_name: post.site_name,
		feed_URL: post.feed_URL,
		feed_ID: post.feed_ID,
		xPostMetadata: XPostHelper.getXPostMetadata( post ),
	};
}

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

function createStreamDataFromPosts( posts, dateProperty ) {
	const streamItems = Array.isArray( posts )
		? posts.map( ( post ) => createStreamItemFromPost( post, dateProperty ) )
		: [];
	const streamPosts = posts;
	return { streamItems, streamPosts };
}

function createStreamItemFromSite( site, dateProperty ) {
	const post = site.posts[ 0 ] ?? null;
	if ( ! post ) {
		return null;
	}
	return createStreamItemFromSiteAndPost( site, post, dateProperty );
}

function createStreamDataFromCards( cards, dateProperty ) {
	// TODO: We may want to extract the related tags and update related tags stream too
	const cardPosts = [];
	let cardRecommendedSites = [];
	let newSites = [];
	cards.forEach( ( card ) => {
		if ( card.type === 'post' ) {
			cardPosts.push( card.data );
		} else if ( card.type === 'recommended_blogs' ) {
			cardRecommendedSites = card.data;
		} else if ( card.type === 'new_sites' ) {
			newSites = card.data;
		}
	} );

	const streamSites = createStreamSitesFromRecommendedSites( cardRecommendedSites );
	const streamNewSites = createStreamSitesFromRecommendedSites( newSites );
	return { ...createStreamDataFromPosts( cardPosts, dateProperty ), streamSites, streamNewSites };
}

function createStreamDataFromSites( sites, dateProperty ) {
	const streamItems = [];
	const streamPosts = [];

	sites.forEach( ( site ) => {
		const streamItem = createStreamItemFromSite( site, dateProperty );
		if ( streamItem !== null ) {
			streamItems.push( streamItem );
		}

		const post = site.posts[ 0 ];
		if ( post !== undefined ) {
			streamPosts.push( post );
		}
	} );

	return { streamItems, streamPosts };
}

function createStreamSitesFromRecommendedSites( sites ) {
	const streamSites = sites.map( ( site ) => {
		return {
			feed_ID: site.feed_ID,
			url: site.URL,
			site_icon: site.icon?.ico,
			site_description: site.description,
			site_name: site.name,
			feed_URL: site.feed_URL,
			feedId: site.feed_ID, // filtered by feedId in receiveRecommendedSites reducer
		};
	} );

	// Filter out nulls
	return streamSites.filter( ( item ) => item !== null );
}

export const PER_FETCH = 7;
export const INITIAL_FETCH = 4;
const PER_POLL = 40;
const PER_GAP = 40;

export const QUERY_META = [ 'post', 'discover_original_post' ].join( ',' );
export const getQueryString = ( extras = {} ) => {
	return { orderBy: 'date', meta: QUERY_META, ...extras, content_width: 675 };
};
const defaultQueryFn = getQueryString;

export const SITE_LIMITER_FIELDS = [
	'ID',
	'site_ID',
	'date',
	'feed_ID',
	'feed_item_ID',
	'global_ID',
	'metadata',
	'site_URL',
	'URL',
];
function getQueryStringForPoll( extraFields = [], extraQueryParams = {} ) {
	return {
		orderBy: 'date',
		number: PER_POLL,
		fields: [ SITE_LIMITER_FIELDS, ...extraFields ].join( ',' ),
		...extraQueryParams,
	};
}
const seed = random( 0, 1000 );

const streamApis = {
	following: {
		path: () => '/read/following',
		dateProperty: 'date',
	},
	recent: {
		path: () => '/read/streams/following',
		dateProperty: 'date',
		apiNamespace: 'wpcom/v2',
		query: ( extras, { streamKey } ) => {
			const feedId = streamKeySuffix( streamKey );
			const queryParams = { ...extras };
			if ( feedId !== 'recent' ) {
				// 'recent' without a suffix means don't filter by feedId
				queryParams.feed_id = feedId;
			}
			return getQueryString( queryParams );
		},
	},
	search: {
		path: () => '/read/search',
		dateProperty: 'date',
		query: ( pageHandle, { streamKey } ) => {
			const { sort, q } = JSON.parse( streamKeySuffix( streamKey ) );
			return { sort, q, ...pageHandle, content_width: 675 };
		},
	},
	feed: {
		path: ( { streamKey } ) => `/read/feed/${ streamKeySuffix( streamKey ) }/posts`,
		dateProperty: 'date',
	},
	discover: {
		path: ( { streamKey } ) => {
			if ( streamKeySuffix( streamKey ).includes( 'recommended' ) ) {
				return '/read/streams/discover';
			} else if ( streamKeySuffix( streamKey ).includes( 'latest' ) ) {
				return '/read/tags/posts';
			} else if ( streamKeySuffix( streamKey ).includes( 'firstposts' ) ) {
				return '/read/streams/first-posts';
			}
			return `/read/streams/discover?tags=${ streamKeySuffix( streamKey ) }`;
		},
		dateProperty: 'date',
		query: ( extras, { streamKey } ) =>
			getQueryString( {
				...extras,
				// Do not supply an empty fallback as null is good info for getDiscoverStreamTags
				tags: getTagsFromStreamKey( streamKey ),
				tag_recs_per_card: 5,
				site_recs_per_card: 5,
				age_based_decay: 0.5,
				// Default order is by date (latest) unless we're on the recommended tab which shows popular instead.
				orderBy: streamKeySuffix( streamKey ).includes( 'recommended' ) ? 'popular' : 'date',
			} ),
		apiNamespace: 'wpcom/v2',
	},
	site: {
		path: ( { streamKey } ) => `/read/sites/${ streamKeySuffix( streamKey ) }/posts`,
		dateProperty: 'date',
	},
	conversations: {
		path: () => '/read/conversations',
		dateProperty: 'last_comment_date_gmt',
		query: ( extras ) => getQueryString( { ...extras, comments_per_post: 20 } ),
		pollQuery: () => getQueryStringForPoll( [ 'last_comment_date_gmt', 'comments' ] ),
	},
	notifications: {
		path: () => '/read/notifications',
		dateProperty: 'date',
	},
	featured: {
		path: ( { streamKey } ) => `/read/sites/${ streamKeySuffix( streamKey ) }/featured`,
		dateProperty: 'date',
	},
	p2: {
		path: () => '/read/following/p2',
		dateProperty: 'date',
	},
	a8c: {
		path: () => '/read/a8c',
		dateProperty: 'date',
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
	tag: {
		path: ( { streamKey } ) => `/read/tags/${ streamKeySuffix( streamKey ) }/posts`,
		apiNamespace: 'wpcom/v2',
		dateProperty: 'date',
	},
	tag_popular: {
		path: ( { streamKey } ) => `/read/streams/tag/${ streamKeySuffix( streamKey ) }`,
		apiNamespace: 'wpcom/v2',
		query: ( extras, { streamKey } ) =>
			getQueryString( {
				...extras,
				tags: streamKeySuffix( streamKey ),
				tag_recs_per_card: 5,
				site_recs_per_card: 5,
			} ),
	},
	list: {
		path: ( { streamKey } ) => {
			const { owner, slug } = JSON.parse( streamKeySuffix( streamKey ) );
			return `/read/list/${ owner }/${ slug }/posts`;
		},
		dateProperty: 'date',
		apiVersion: '1.3',
		query: ( extras, { pageHandle } ) => {
			return {
				...{ extras, number: 40 },
				...pageHandle,
			};
		},
	},
	user: {
		path: ( { streamKey } ) => `/users/${ streamKeySuffix( streamKey ) }/posts`,
		dateProperty: 'date',
		apiVersion: '1',
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
		apiNamespace: api.apiNamespace ?? null,
		query: isPoll
			? pollQuery( [], commonQueryParams )
			: query( { ...commonQueryParams, ...pageHandle, number, lang, page }, action.payload ),
		onSuccess: action,
		onFailure: action,
	} );
}

function get_page_handle( streamType, action, data ) {
	const { date_range, meta, next_page, next_page_handle } = data;
	if ( next_page_handle ) {
		return { page_handle: next_page_handle };
	} else if ( includes( streamType, 'rec' ) ) {
		const offset = get( action, 'payload.pageHandle.offset', 0 ) + PER_FETCH;
		return { offset };
	} else if ( next_page || ( meta && meta.next_page ) ) {
		// sites give page handles nested within the meta key
		return { page_handle: next_page || meta.next_page };
	} else if ( date_range && date_range.after ) {
		// feeds use date_range. no next_page handles here
		// search api will give you a date_range but for relevance search it will have before/after=null
		// and offsets must be used
		const { after } = date_range;
		return { before: after };
	}
	return null;
}

export function handlePage( action, data ) {
	const { posts, sites, cards } = data;
	const { streamKey, query, isPoll, gap, streamType } = action.payload;
	const pageHandle = get_page_handle( streamType, action, data );
	const { dateProperty } = streamApis[ streamType ];

	let streamItems = [];
	let streamPosts = [];
	let streamSites = [];
	let streamNewSites = [];

	// If the payload has posts, then this stream is intended to be a post stream
	// If the payload has sites, then we need to extract the posts from the sites and update the post stream
	// If the payload has cards, then we need to extract the posts from the cards and update the post stream
	// Cards also contain recommended sites which we need to extract and update the sites stream
	if ( posts ) {
		const streamData = createStreamDataFromPosts( posts, dateProperty );
		streamItems = streamData.streamItems;
		streamPosts = streamData.streamPosts;
	} else if ( sites ) {
		const streamData = createStreamDataFromSites( sites, dateProperty );
		streamItems = streamData.streamItems;
		streamPosts = streamData.streamPosts;
	} else if ( cards ) {
		// Need to extract the posts and recommended sites from the cards
		const streamData = createStreamDataFromCards( cards, dateProperty );
		streamItems = streamData.streamItems;
		streamPosts = streamData.streamPosts;
		streamSites = streamData.streamSites;
		streamNewSites = streamData.streamNewSites;
	}

	const actions = analyticsForStream( {
		streamKey,
		algorithm: data.algorithm,
		items: streamPosts || sites,
	} );

	if ( isPoll ) {
		actions.push( receiveUpdates( { streamKey, streamItems, query } ) );
	} else {
		if ( streamPosts.length > 0 ) {
			actions.push( receivePosts( streamPosts ) );
		}
		if ( streamSites.length > 0 ) {
			actions.push(
				receiveRecommendedSites( { seed: 'discover-recommendations', sites: streamSites } )
			);
		}
		if ( streamNewSites.length > 0 ) {
			actions.push(
				receiveRecommendedSites( { seed: 'discover-new-sites', sites: streamNewSites } )
			);
		}

		const totalItems = data.total_cards || data.found || streamItems.length;
		const totalPages =
			data.total_pages || Math.ceil( totalItems / ( action.payload.perPage || PER_FETCH ) );

		// The first request when going to wordpress.com/discover does not include tags in the streamKey
		// because it is still waiting for the user's interests to be fetched.
		// Given that the user interests will be retrieved in the response from /read/streams/discover we
		// use that values to generate a correct streamKey and prevent doing a new request when the user
		// interests are finally fetched. More context here: paYKcK-3zo-p2#comment-2528.
		let newStreamKey = streamKey;
		if ( streamKey === 'discover:recommended' && data.user_interests ) {
			newStreamKey = buildDiscoverStreamKey( 'recommended', data.user_interests );
		}
		actions.push(
			receivePage( {
				streamKey: newStreamKey,
				query,
				streamItems,
				pageHandle,
				gap,
				totalItems,
				totalPages,
			} )
		);
	}

	return actions;
}

registerHandlers( 'state/data-layer/wpcom/read/streams/index.js', {
	[ READER_STREAMS_PAGE_REQUEST ]: [
		dispatchRequest( {
			fetch: requestPage,
			onSuccess: handlePage,
			onError: noop,
		} ),
	],
	[ READER_STREAMS_PAGINATED_REQUEST ]: [
		dispatchRequest( {
			fetch: requestPage,
			onSuccess: handlePage,
			onError: noop,
		} ),
	],
} );
