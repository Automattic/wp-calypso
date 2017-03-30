/**
 * External dependencies
 */
import { forEach, startsWith, random } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import config from 'config';
import Dispatcher from 'dispatcher';
import FeedStream from './feed-stream';
import PagedStream from './paged-stream';
import FeedStreamCache from './feed-stream-cache';
import analytics from 'lib/analytics';
import wpcom from 'lib/wp';

const wpcomUndoc = wpcom.undocumented();

function feedKeyMaker( post ) {
	return {
		feedId: post.feed_ID,
		postId: post.ID,
		localMoment: moment( post.date ),
	};
}

function siteKeyMaker( post ) {
	return {
		blogId: post.site_ID,
		postId: post.ID,
		localMoment: moment( post.date ),
	};
}

function mixedKeyMaker( post ) {
	if ( post.feed_ID && post.feed_item_ID ) {
		return {
			feedId: post.feed_ID,
			postId: post.feed_item_ID,
			localMoment: moment( post.date ),
		};
	}

	return siteKeyMaker( post );
}

function addMetaToNextPageFetch( params ) {
	params.meta = 'post,discover_original_post';
}

function limitSiteParams( params ) {
	params.fields = 'ID,site_ID,date';
}

function limitSiteParamsForLikes( params ) {
	limitSiteParams( params );
	params.fields += ',date_liked';
}

function limitSiteParamsForTags( params ) {
	limitSiteParams( params );
	params.fields += ',tagged_on';
}

function trainTracksProxyForStream( stream, callback ) {
	return function( err, response ) {
		const eventName = 'calypso_traintracks_render';
		if ( response && response.algorithm ) {
			stream.algorithm = response.algorithm;
		}
		forEach( response && response.posts, ( post ) => {
			if ( post.railcar ) {
				if ( stream.isQuerySuggestion ) {
					post.railcar.rec_result = 'suggestion';
				}
				analytics.tracks.recordEvent( eventName, post.railcar );
			}
		} );
		callback( err, response );
	};
}

function getStoreForFeed( storeId ) {
	const feedId = storeId.split( ':' )[ 1 ],
		fetcher = function fetchFeedById( query, callback ) {
			query.ID = feedId;
			wpcomUndoc.readFeedPosts( query, callback );
		};
	return new FeedStream( {
		id: storeId,
		fetcher: fetcher,
		keyMaker: feedKeyMaker,
		onNextPageFetch: addMetaToNextPageFetch
	} );
}

function getStoreForTag( storeId ) {
	const slug = storeId.split( ':' )[ 1 ];
	const fetcher = function( query, callback ) {
		query.tag = slug;
		wpcomUndoc.readTagPosts( query, callback );
	};

	if ( config.isEnabled( 'reader/tags-with-elasticsearch' ) ) {
		return new PagedStream( {
			id: storeId,
			fetcher: fetcher,
			keyMaker: siteKeyMaker,
			perPage: 5
		} );
	}
	return new FeedStream( {
		id: storeId,
		fetcher: fetcher,
		keyMaker: mixedKeyMaker,
		onGapFetch: limitSiteParamsForTags,
		onUpdateFetch: limitSiteParamsForTags,
		dateProperty: 'tagged_on'
	} );
}

function validateSearchSort( sort ) {
	if ( sort !== 'relevance' && sort !== 'date' ) {
		return 'relevance';
	}
	return sort;
}

function getStoreForSearch( storeId ) {
	const idParts = storeId.split( ':' );
	const sort = validateSearchSort( idParts[ 1 ] );
	const slug = idParts.slice( 2 ).join( ':' );
	// We can use a feed stream when it's a strict date sort.
	// This lets us go deeper than 20 pages and let's the results auto-update
	const stream = sort === 'date' ? new FeedStream( {
		id: storeId,
		fetcher: fetcher,
		keyMaker: siteKeyMaker,
		perPage: 5,
		onGapFetch: limitSiteParams,
		onUpdateFetch: limitSiteParams,
		maxUpdates: 20,
	} ) : new PagedStream( {
		id: storeId,
		fetcher: fetcher,
		keyMaker: siteKeyMaker,
		perPage: 5
	} );
	stream.sortOrder = sort;

	function fetcher( query, callback ) {
		query.q = slug;
		query.meta = 'site';
		query.sort = sort;
		wpcomUndoc.readSearch( query, trainTracksProxyForStream( stream, callback ) );
	}

	return stream;
}

function getStoreForList( storeId ) {
	const listKey = storeId.split( ':' )[ 1 ],
		[ listOwner, ...listSlug ] = listKey.split( '-' ),
		fetcher = function( query, callback ) {
			query.owner = listOwner;
			query.slug = listSlug.join( '-' );
			wpcomUndoc.readListPosts( query, callback );
		};

	return new FeedStream( {
		id: storeId,
		fetcher: fetcher,
		keyMaker: mixedKeyMaker,
		onGapFetch: limitSiteParams,
		onUpdateFetch: limitSiteParams
	} );
}

function getStoreForSite( storeId ) {
	const siteId = storeId.split( ':' )[ 1 ],
		fetcher = function( query, callback ) {
			query.site = siteId;
			wpcomUndoc.readSitePosts( query, callback );
		};

	return new FeedStream( {
		id: storeId,
		fetcher: fetcher,
		keyMaker: siteKeyMaker,
		onGapFetch: limitSiteParams,
		onUpdateFetch: limitSiteParams
	} );
}

function getStoreForFeatured( storeId ) {
	const siteId = storeId.split( ':' )[ 1 ],
		fetcher = function( query, callback ) {
			wpcomUndoc.readSiteFeatured( siteId, query, callback );
		};

	return new FeedStream( {
		id: storeId,
		fetcher: fetcher,
		keyMaker: siteKeyMaker,
		onGapFetch: limitSiteParams,
		onUpdateFetch: limitSiteParams
	} );
}

function getStoreForRecommendedPosts( storeId ) {
	const stream = new PagedStream( {
		id: storeId,
		fetcher: fetcher,
		keyMaker: siteKeyMaker,
		perPage: 6,
	} );

	function fetcher( query, callback ) {
		switch ( storeId ) {
			case 'cold_posts':
				query.algorithm = 'read:recommendations:posts/es/2';
				break;
			case 'cold_posts_1w':
				query.algorithm = 'read:recommendations:posts/es/3';
				break;
			case 'cold_posts_2w':
				query.algorithm = 'read:recommendations:posts/es/4';
				break;
			case 'cold_posts_4w':
				query.algorithm = 'read:recommendations:posts/es/5';
				break;
			case 'cold_posts_topics':
				query.algorithm = 'read:recommendations:posts/es/6';
				break;
			case 'custom_recs_posts_with_images':
				query.alg_prefix = 'read:recommendations:posts';

				/* Seed FAQ:
				 * Q: What does it do?
				 * A: It throws a little randomness into the Elasticsearch query so that users
				 * don't see the same recommendations every time:
				 * https://www.elastic.co/guide/en/elasticsearch/guide/current/random-scoring.html
				 *
				 * Q: How did we pick this range?
				 * A: It's big enough that the same user probably won't get repeats too frequently
				 * and small enough that we aren't going cause overflows anywhere.
				 *
				 * Q: How often do we change the seed?
				 * A: We change the seed each time the store is generated. Practically speaking
				 * that means each time the page is refreshed.
				 */
				query.seed = random( 0, 10000 );
				break;
			default:
				query.algorithm = 'read:recommendations:posts/es/1';
		}
		wpcomUndoc.readRecommendedPosts( query, trainTracksProxyForStream( stream, callback ) );
	}

	const oldNextPageFetch = stream.onNextPageFetch;
	stream.onNextPageFetch = function( params ) {
		oldNextPageFetch.call( this, params );
		params.algorithm = stream.algorithm;
	};

	return stream;
}

export default function feedStoreFactory( storeId ) {
	let store = FeedStreamCache.get( storeId );

	if ( store ) {
		return store;
	}

	if ( storeId === 'following' ) {
		store = new FeedStream( {
			id: storeId,
			fetcher: wpcomUndoc.readFollowing.bind( wpcomUndoc ),
			keyMaker: feedKeyMaker,
			onNextPageFetch: addMetaToNextPageFetch
		} );
	} else if ( storeId === 'a8c' ) {
		store = new FeedStream( {
			id: storeId,
			fetcher: wpcomUndoc.readA8C.bind( wpcomUndoc ),
			keyMaker: feedKeyMaker,
			onNextPageFetch: addMetaToNextPageFetch
		} );
	} else if ( storeId === 'likes' ) {
		store = new FeedStream( {
			id: storeId,
			fetcher: wpcomUndoc.readLiked.bind( wpcomUndoc ),
			keyMaker: siteKeyMaker,
			onGapFetch: limitSiteParamsForLikes,
			onUpdateFetch: limitSiteParamsForLikes,
			dateProperty: 'date_liked'
		} );
	} else if ( storeId === 'recommendations_posts' ) {
		store = getStoreForRecommendedPosts( storeId );
	} else if ( startsWith( storeId, 'cold_posts' ) ) {
		store = getStoreForRecommendedPosts( storeId );
	} else if ( startsWith( storeId, 'custom_recs' ) ) {
		store = getStoreForRecommendedPosts( storeId );
	} else if ( storeId.indexOf( 'feed:' ) === 0 ) {
		store = getStoreForFeed( storeId );
	} else if ( storeId.indexOf( 'tag:' ) === 0 ) {
		store = getStoreForTag( storeId );
	} else if ( storeId.indexOf( 'list:' ) === 0 ) {
		store = getStoreForList( storeId );
	} else if ( storeId.indexOf( 'site:' ) === 0 ) {
		store = getStoreForSite( storeId );
	} else if ( storeId.indexOf( 'featured:' ) === 0 ) {
		store = getStoreForFeatured( storeId );
	} else if ( storeId.indexOf( 'search:' ) === 0 ) {
		store = getStoreForSearch( storeId );
	} else {
		throw new Error( 'Unknown feed store ID' );
	}

	store.dispatchToken = Dispatcher.register( store.handlePayload.bind( store ) );

	FeedStreamCache.set( storeId, store );
	return store;
}
