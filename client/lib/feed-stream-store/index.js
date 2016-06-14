/**
 * Internal dependencies
 */
var config = require( 'config' ),
	Dispatcher = require( 'dispatcher' ),
	FeedStream = require( './feed-stream' ),
	PagedStream = require( './paged-stream' ),
	FeedStreamCache = require( './feed-stream-cache' ),
	analytics = require( 'lib/analytics'),
	forEach = require( 'lodash/forEach' ),
	wpcomUndoc = require( 'lib/wp' ).undocumented();

function feedKeyMaker( post ) {
	return {
		feedId: post.feed_ID,
		postId: post.ID
	};
}

function siteKeyMaker( post ) {
	return {
		blogId: post.site_ID,
		postId: post.ID
	};
}

function mixedKeyMaker( post ) {
	if ( post.feed_ID ) {
		return {
			feedId: post.feed_ID,
			postId: post.ID
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

function getStoreForFeed( storeId ) {
	var feedId = storeId.split( ':' )[ 1 ],
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

	if ( config.isEnabled( 'reader/tags-with-elasticsearch' ) ){
		return new PagedStream( {
			id: storeId,
			fetcher: fetcher,
			keyMaker: siteKeyMaker,
			perPage: 5
		} );
	} else {
		return new FeedStream( {
			id: storeId,
			fetcher: fetcher,
			keyMaker: mixedKeyMaker,
			onGapFetch: limitSiteParams,
			onUpdateFetch: limitSiteParams,
			dateProperty: 'tagged_on'
		} );
	}
}

function getStoreForSearch( storeId ) {
	const slug = storeId.split( ':' )[ 1 ];
	const fetcher = function( query, callback ) {
		query.q = slug;
		wpcomUndoc.readSearch( query, callback );
	};

	return new PagedStream( {
		id: storeId,
		fetcher: fetcher,
		keyMaker: siteKeyMaker,
		perPage: 5
	} );
}

function getStoreForList( storeId ) {
	var listKey = storeId.split( ':' )[ 1 ],
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
	var siteId = storeId.split( ':' )[ 1 ],
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
	var siteId = storeId.split( ':' )[ 1 ],
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
	var fetcher = function( query, callback ) {
		function trainTracksProxy( err, response ) {
			var eventName= 'calypso_traintracks_render',
				eventProperties = {};
			forEach ( response && response.posts, ( post, index ) => {
				let railcar = analytics.tracks.createRandomId() + "-" + index;
				eventProperties = {
					railcar: railcar,
					ui_algo: 'warm-start-v1',
					ui_position: query.offset + index,
					fetch_algo: response.algorithm,
					fetch_position: query.offset + index
				};
				post.railcar = railcar;
				analytics.tracks.recordEvent( eventName, eventProperties );
			} );
			callback( err, response );
		}
		wpcomUndoc.readRecommendedPosts( query, trainTracksProxy );
	};

	return new PagedStream( {
		id: storeId,
		fetcher: fetcher,
		keyMaker: siteKeyMaker,
		perPage: 5
	} );
}

function feedStoreFactory( storeId ) {
	var store = FeedStreamCache.get( storeId );

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
	}else {
		throw new Error( 'Unknown feed store ID' );
	}

	store.dispatchToken = Dispatcher.register( store.handlePayload.bind( store ) );

	FeedStreamCache.set( storeId, store );
	return store;
}

module.exports = feedStoreFactory;
