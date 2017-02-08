/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import page from 'page';
import i18n from 'i18n-calypso';
import { trim, defer } from 'lodash';
import qs from 'qs';

/**
 * Internal Dependencies
 */
import { abtest } from 'lib/abtest';
import route from 'lib/route';
import config from 'config';
import feedStreamFactory from 'lib/feed-stream-store';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, trackScrollPage, setPageTitle } from './controller-helper';
import FeedError from 'reader/feed-error';
import FeedSubscriptionActions from 'lib/reader-feed-subscriptions/actions';
import {
	getPrettyFeedUrl,
	getPrettySiteUrl
} from 'reader/route';
import { recordTrack } from 'reader/stats';
import { renderWithReduxStore } from 'lib/react-helpers';
import ReaderSidebarComponent from 'reader/sidebar';
import ReaderFullPost from 'blocks/reader-full-post';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import userSettings from 'lib/user-settings';

const analyticsPageTitle = 'Reader';

import ListStream from 'reader/list-stream';
import SearchStream from 'reader/search-stream';
import SiteStream from 'reader/site-stream';
import FollowingEdit from 'reader/following-edit';
import LikedPostsStream from 'reader/liked-stream/main';
import RecommendedPostsStream from 'reader/recommendations/posts';
import RecommendedForYou from 'reader/recommendations/for-you';
import TagStream from 'reader/tag-stream/main';
import StreamComponent from 'reader/following/main';
import TeamComponent from 'reader/team/main';
import FeedStream from 'reader/feed-stream';

// TODO why does this exist?
import FeedSubscriptionStore from 'lib/reader-feed-subscriptions';// eslint-disable-line no-unused-vars
import PostEmailSubscriptionStore from 'lib/reader-post-email-subscriptions'; // eslint-disable-line no-unused-vars
import CommentEmailSubscriptionStore from 'lib/reader-comment-email-subscriptions'; // eslint-disable-line no-unused-vars
import feedLookup from 'lib/feed-lookup';

const activeAbTests = [
	// active tests would go here
];
let lastRoute = null;

function userHasHistory( context ) {
	return !! context.lastRoute;
}

function renderFeedError( context ) {
	renderWithReduxStore(
		React.createElement( FeedError ),
		document.getElementById( 'primary' ),
		context.store
	);
}

export function initAbTests( context, next ) {
	// spin up the ab tests that are currently active for the reader
	activeAbTests.forEach( test => abtest( test ) );
	next();
}

export function prettyRedirects( context, next ) {
	// Do we have a 'pretty' site or feed URL?
	let redirect;
	if ( context.params.blog_id ) {
		redirect = getPrettySiteUrl( context.params.blog_id );
	} else if ( context.params.feed_id ) {
		redirect = getPrettyFeedUrl( context.params.feed_id );
	}

	if ( redirect ) {
		return page.redirect( redirect );
	}

	next();
}

export function legacyRedirects( context, next ) {
	const legacyPathRegexes = {
		feedStream: /^\/read\/blog\/feed\/([0-9]+)$/i,
		feedFullPost: /^\/read\/post\/feed\/([0-9]+)\/([0-9]+)$/i,
		blogStream: /^\/read\/blog\/id\/([0-9]+)$/i,
		blogFullPost: /^\/read\/post\/id\/([0-9]+)\/([0-9]+)$/i,
	};

	if ( context.path.match( legacyPathRegexes.feedStream ) ) {
		page.redirect( `/read/feeds/${ context.params.feed_id }` );
	} else if ( context.path.match( legacyPathRegexes.feedFullPost ) ) {
		page.redirect( `/read/feeds/${ context.params.feed_id }/posts/${ context.params.post_id }` );
	} else if ( context.path.match( legacyPathRegexes.blogStream ) ) {
		page.redirect( `/read/blogs/${ context.params.blog_id }` );
	} else if ( context.path.match( legacyPathRegexes.blogFullPost ) ) {
		page.redirect( `/read/blogs/${ context.params.blog_id }/posts/${ context.params.post_id }` );
	}

	next();
}

export function updateLastRoute( context, next ) {
	if ( lastRoute ) {
		context.lastRoute = lastRoute;
	}
	lastRoute = context.path;
	next();
}

export function incompleteUrlRedirects( context, next ) {
	let redirect;
	// Have we arrived at a URL ending in /posts? Redirect to feed stream/blog stream
	if ( context.path.match( /^\/read\/feeds\/([0-9]+)\/posts$/i ) ) {
		redirect = `/read/feeds/${ context.params.feed_id }`;
	} else if ( context.path.match( /^\/read\/blogs\/([0-9]+)\/posts$/i ) ) {
		redirect = `/read/blogs/${ context.params.blog_id }`;
	}

	if ( redirect ) {
		return page.redirect( redirect );
	}

	next();
}

export function loadSubscriptions( context, next ) {
	// these three are included to ensure that the stores required have been loaded and can accept actions
	FeedSubscriptionActions.fetchAll();
	next();
}

export function	sidebar( context, next ) {
	renderWithReduxStore(
		<ReaderSidebarComponent path={ context.path } />,
		document.getElementById( 'secondary' ),
		context.store
	);

	next();
}

export function unmountSidebar( context, next ) {
	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	next();
}

export function following( context ) {
	const basePath = route.sectionify( context.path );
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > Following';
	const followingStore = feedStreamFactory( 'following' );
	const mcKey = 'following';

	const recommendationsStore = feedStreamFactory( 'custom_recs_posts_with_images' );
	recommendationsStore.perPage = 4;

	ensureStoreLoading( followingStore, context );

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_following_loaded' );

	setPageTitle( context, i18n.translate( 'Following' ) );

	renderWithReduxStore(
		React.createElement( StreamComponent, {
			key: 'following',
			listName: i18n.translate( 'Followed Sites' ),
			postsStore: followingStore,
			recommendationsStore,
			showPrimaryFollowButtonOnCards: false,
			trackScrollPage: trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			),
			onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey )
		} ),
		document.getElementById( 'primary' ),
		context.store,
	);
}

export function feedDiscovery( context, next ) {
	if ( ! context.params.feed_id.match( /^\d+$/ ) ) {
		feedLookup( context.params.feed_id )
		.then( function( feedId ) {
			page.redirect( `/read/feeds/${ feedId }` );
		} )
		.catch( function() {
			renderFeedError( context );
		} );
	} else {
		next();
	}
}

export function feedListing( context ) {
	const basePath = '/read/feeds/:feed_id';
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > Feed > ' + context.params.feed_id;
	const feedStore = feedStreamFactory( 'feed:' + context.params.feed_id );
	const mcKey = 'blog';

	ensureStoreLoading( feedStore, context );

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_blog_preview', {
		feed_id: context.params.feed_id
	} );

	renderWithReduxStore(
		React.createElement( FeedStream, {
			key: 'feed-' + context.params.feed_id,
			postsStore: feedStore,
			feedId: +context.params.feed_id,
			trackScrollPage: trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			),
			onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
			showPrimaryFollowButtonOnCards: false,
			suppressSiteNameLink: true,
			showBack: userHasHistory( context )
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

export function blogListing( context ) {
	const basePath = '/read/blogs/:blog_id';
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > Site > ' + context.params.blog_id;
	const feedStore = feedStreamFactory( 'site:' + context.params.blog_id );
	const mcKey = 'blog';

	ensureStoreLoading( feedStore, context );

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_blog_preview', {
		blog_id: context.params.blog_id
	} );

	renderWithReduxStore(
		React.createElement( SiteStream, {
			key: 'site-' + context.params.blog_id,
			postsStore: feedStore,
			siteId: +context.params.blog_id,
			trackScrollPage: trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			),
			onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
			showPrimaryFollowButtonOnCards: false,
			suppressSiteNameLink: true,
			showBack: userHasHistory( context )
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

export function readA8C( context ) {
	const basePath = route.sectionify( context.path );
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > A8C';
	const feedStore = feedStreamFactory( 'a8c' );
	const mcKey = 'a8c';

	ensureStoreLoading( feedStore, context );

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

	setPageTitle( context, 'Automattic' );

	renderWithReduxStore(
		React.createElement( TeamComponent, {
			key: 'read-a8c',
			className: 'is-a8c',
			listName: 'Automattic',
			postsStore: feedStore,
			trackScrollPage: trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			),
			showPrimaryFollowButtonOnCards: false,
			onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey )
		} ),
		document.getElementById( 'primary' ),
		context.store,
	);
}

export function tagListing( context ) {
	const basePath = '/tag/:slug';
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > Tag > ' + context.params.tag;
	const tagSlug = trim( context.params.tag )
		.toLowerCase()
		.replace( /\s+/g, '-' )
		.replace( /-{2,}/g, '-' );
	const encodedTag = encodeURIComponent( tagSlug ).toLowerCase();
	const tagStore = feedStreamFactory( 'tag:' + tagSlug );
	const mcKey = 'topic';

	ensureStoreLoading( tagStore, context );

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_tag_loaded', {
		tag: tagSlug
	} );

	renderWithReduxStore(
		React.createElement( TagStream, {
			key: 'tag-' + encodedTag,
			postsStore: tagStore,
			tag: encodedTag,
			trackScrollPage: trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			),
			onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
			showBack: !! context.lastRoute,
			showPrimaryFollowButtonOnCards: true
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

function renderPostNotFound() {
	const sidebarAndPageTitle = i18n.translate( 'Post not found' );

	setPageTitle( context, sidebarAndPageTitle );

	renderWithReduxStore(
		<FeedError sidebarTitle={ sidebarAndPageTitle } message={ i18n.translate( 'Post Not Found' ) } />,
		document.getElementById( 'primary' ),
		context.store
	);
}

export function blogPost( context ) {
	const blogId = context.params.blog;
	const postId = context.params.post;
	const basePath = '/read/blogs/:blog_id/posts/:post_id';
	const fullPageTitle = analyticsPageTitle + ' > Blog Post > ' + blogId + ' > ' + postId;

	let referral;
	if ( context.query.ref_blog && context.query.ref_post ) {
		referral = { blogId: context.query.ref_blog, postId: context.query.ref_post };
	}
	trackPageLoad( basePath, fullPageTitle, 'full_post' );

	renderWithReduxStore(
		React.createElement( ReaderFullPost, {
			blogId: blogId,
			postId: postId,
			referral: referral,
			onClose: function() {
				page.back( context.lastRoute || '/' );
			},
			onPostNotFound: renderPostNotFound
		} ),
		document.getElementById( 'primary' ),
		context.store,
	);

	defer( function() {
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}
	} );
}

export function feedPost( context ) {
	const feedId = context.params.feed;
	const postId = context.params.post;
	const basePath = '/read/feeds/:feed_id/posts/:feed_item_id';
	const fullPageTitle = analyticsPageTitle + ' > Feed Post > ' + feedId + ' > ' + postId;

	trackPageLoad( basePath, fullPageTitle, 'full_post' );

	function closer() {
		page.back( context.lastRoute || '/' );
	}

	renderWithReduxStore(
		<ReaderFullPost
			feedId={ feedId }
			postId={ postId }
			onClose={ closer }
			onPostNotFound={ renderPostNotFound } />
		,
		document.getElementById( 'primary' ),
		context.store,
	);

	defer( function() {
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}
	} );
}

export function recommendedForYou( context ) {
	const basePath = '/recommendations';
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > Recommended Sites For You';
	const mcKey = 'recommendations_for_you';

	renderWithReduxStore(
		React.createElement( RecommendedForYou, {
			trackScrollPage: trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			)
		} ),
		document.getElementById( 'primary' ),
		context.store
	);

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Recommended Sites For You ‹ Reader' ) ) );
}

	// Post Recommendations - Used by the Data team to test recommendation algorithms
export function recommendedPosts( context ) {
	const basePath = route.sectionify( context.path );

	let fullAnalyticsPageTitle = '';
	let RecommendedPostsStore = null;
	let mcKey = '';
	switch ( basePath ) {
		case '/recommendations/cold':
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Coldstart Posts';
			RecommendedPostsStore = feedStreamFactory( 'cold_posts' );
			mcKey = 'coldstart_posts';
			break;
		case '/recommendations/cold1w':
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Coldstart+1w Posts';
			RecommendedPostsStore = feedStreamFactory( 'cold_posts_1w' );
			mcKey = 'coldstart_posts_1w';
			break;
		case '/recommendations/cold2w':
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Coldstart+2w Posts';
			RecommendedPostsStore = feedStreamFactory( 'cold_posts_2w' );
			mcKey = 'coldstart_posts_2w';
			break;
		case '/recommendations/cold4w':
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Coldstart+4w Posts';
			RecommendedPostsStore = feedStreamFactory( 'cold_posts_4w' );
			mcKey = 'coldstart_posts_4w';
			break;
		case '/recommendations/coldtopics':
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Coldstart Diverse Posts';
			RecommendedPostsStore = feedStreamFactory( 'cold_posts_topics' );
			mcKey = 'coldstart_posts_topics';
			break;
		default:
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Recommended Posts';
			RecommendedPostsStore = feedStreamFactory( 'custom_recs_posts_with_images' );
			mcKey = 'custom_recs_posts_with_images';
	}

	ensureStoreLoading( RecommendedPostsStore, context );

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

	renderWithReduxStore(
		React.createElement( RecommendedPostsStream, {
			key: 'recommendations_posts',
			postsStore: RecommendedPostsStore,
			trackScrollPage: trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			),
			onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
			showBack: userHasHistory( context )
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

export function discover( context ) {
	const blogId = config( 'discover_blog_id' );
	const basePath = route.sectionify( context.path );
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > Site > ' + blogId;
	const feedStore = feedStreamFactory( 'site:' + blogId );
	const mcKey = 'discover';

	ensureStoreLoading( feedStore, context );

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_discover_viewed' );

	renderWithReduxStore(
		React.createElement( SiteStream, {
			key: 'site-' + blogId,
			postsStore: feedStore,
			siteId: +blogId,
			title: 'Discover',
			trackScrollPage: trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			),
			onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
			suppressSiteNameLink: true,
			showPrimaryFollowButtonOnCards: false,
			showBack: false,
			className: 'is-discover-stream is-site-stream',
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

export function followingEdit( context ) {
	const basePath = route.sectionify( context.path );
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage Followed Sites';
	const mcKey = 'following_edit';
	const searchQuery = context.query.s;

	setPageTitle( context, i18n.translate( 'Manage Followed Sites' ) );

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

	renderWithReduxStore(
		React.createElement( FollowingEdit, {
			key: 'following-edit',
			initialFollowUrl: context.query.follow,
			search: searchQuery,
			context: context,
			userSettings: userSettings
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

export function likes( context ) {
	const basePath = route.sectionify( context.path );
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > My Likes';
	const likedPostsStore = feedStreamFactory( 'likes' );
	const mcKey = 'postlike';

	ensureStoreLoading( likedPostsStore, context );

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

	renderWithReduxStore(
		React.createElement( LikedPostsStream, {
			key: 'liked',
			postsStore: likedPostsStore,
			trackScrollPage: trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			),
			onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey )
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

export function search( context ) {
	const basePath = '/read/search';
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > Search';
	const searchSlug = context.query.q;
	const mcKey = 'search';

	let store;
	if ( searchSlug ) {
		store = feedStreamFactory( 'search:' + searchSlug );
		ensureStoreLoading( store, context );
	} else {
		store = feedStreamFactory( 'custom_recs_posts_with_images' );
		ensureStoreLoading( store, context );
	}

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	if ( searchSlug ) {
		recordTrack( 'calypso_reader_search_performed', {
			query: searchSlug
		} );
	} else {
		recordTrack( 'calypso_reader_search_loaded' );
	}

	renderWithReduxStore(
		React.createElement( SearchStream, {
			key: 'search',
			postsStore: store,
			query: searchSlug,
			trackScrollPage: trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			),
			onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
			showBack: false,
			showPrimaryFollowButtonOnCards: true,
			onQueryChange: function( newValue ) {
				let searchUrl = '/read/search';
				if ( newValue ) {
					searchUrl += '?' + qs.stringify( { q: newValue } );
				}
				page.replace( searchUrl );
			}
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

export function listListing( context ) {
	const basePath = '/read/list/:owner/:slug';
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > List > ' + context.params.user + ' - ' + context.params.list;
	const listStore = feedStreamFactory( 'list:' + context.params.user + '-' + context.params.list );
	const mcKey = 'list';

	ensureStoreLoading( listStore, context );

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_list_loaded', {
		list_owner: context.params.user,
		list_slug: context.params.list
	} );

	renderWithReduxStore(
		React.createElement( ListStream, {
			key: 'tag-' + context.params.user + '-' + context.params.list,
			postsStore: listStore,
			owner: encodeURIComponent( context.params.user ),
			slug: encodeURIComponent( context.params.list ),
			showPrimaryFollowButtonOnCards: false,
			trackScrollPage: trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			),
			onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey )
		} ),
		document.getElementById( 'primary' ),
		context.store,
	);
}
