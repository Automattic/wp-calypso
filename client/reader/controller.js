/**
 * External Dependencies
 */
const ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	page = require( 'page' ),
	debug = require( 'debug' )( 'calypso:reader:controller' ),
	trim = require( 'lodash/trim' ),
	moment = require( 'moment' ),
	ReduxProvider = require( 'react-redux' ).Provider;

/**
 * Internal Dependencies
 */
const abtest = require( 'lib/abtest' ).abtest,
	i18n = require( 'lib/mixins/i18n' ),
	route = require( 'lib/route' ),
	pageNotifier = require( 'lib/route/page-notifier' ),
	analytics = require( 'analytics' ),
	config = require( 'config' ),
	feedStreamFactory = require( 'lib/feed-stream-store' ),
	FeedStreamStoreActions = require( 'lib/feed-stream-store/actions' ),
	analyticsPageTitle = 'Reader',
	TitleStore = require( 'lib/screen-title/store' ),
	titleActions = require( 'lib/screen-title/actions' ),
	hideReaderFullPost = require( 'state/ui/reader/fullpost/actions' ).hideReaderFullPost,
	FeedSubscriptionActions = require( 'lib/reader-feed-subscriptions/actions' ),
	readerRoute = require( 'reader/route' ),
	stats = require( 'reader/stats' );

import userSettings from 'lib/user-settings';

// This holds the last title set on the page. Removing the overlay doesn't trigger a re-render, so we need a way to
// reset it
let __lastTitle = null;
const activeAbTests = [
	'readerShorterFeatures2'
];

function trackPageLoad( path, title, readerView ) {
	analytics.pageView.record( path, title );
	analytics.mc.bumpStat( 'reader_views', readerView === 'full_post' ? readerView : readerView + '_load' );
}

function trackUpdatesLoaded( key ) {
	analytics.mc.bumpStat( 'reader_views', key + '_load_new' );
	analytics.ga.recordEvent( 'Reader', 'Clicked Load New Posts', key );
	stats.recordTrack( 'calypso_reader_load_new_posts', {
		section: key
	} );
}

function trackScrollPage( path, title, category, readerView, pageNum ) {
	debug( 'scroll [%s], [%s], [%s], [%d]', path, title, category, pageNum );

	analytics.ga.recordEvent( category, 'Loaded Next Page', 'page', pageNum );
	stats.recordTrack( 'calypso_reader_infinite_scroll_performed', {
		path: path,
		page: pageNum,
		section: readerView
	} );
	analytics.pageView.record( path, title );
	analytics.mc.bumpStat( {
		newdash_pageviews: 'scroll',
		reader_views: readerView + '_scroll'
	} );
}

// Listen for route changes and remove the full post dialog when we navigate away from it
pageNotifier( function removeFullPostOnLeave( newContext, oldContext ) {
	const fullPostViewRegex = /^\/read\/(blogs|feeds)\/([0-9]+)\/posts\/([0-9]+)$/i;

	if ( ( ! oldContext || oldContext.path.match( fullPostViewRegex ) ) && ! newContext.path.match( fullPostViewRegex ) ) {
		newContext.store.dispatch( hideReaderFullPost() );
	}
} );

function removeFullPostDialog() {
	ReactDom.unmountComponentAtNode( document.getElementById( 'tertiary' ) );
}

function userHasHistory( context ) {
	return !! context.lastRoute;
}

function ensureStoreLoading( store, context ) {
	if ( store.getPage() === 1 ) {
		if ( context.query.at ) {
			const startDate = moment( context.query.at );
			if ( startDate.isValid() ) {
				store.startDate = startDate.format();
			}
		}
		FeedStreamStoreActions.fetchNextPage( store.id );
	}
	return store;
}

function setPageTitle( title ) {
	titleActions.setTitle( i18n.translate( '%s ‹ Reader', { args: title } ) );
}

module.exports = {
	initAbTests: function( context, next ) {
		// spin up the ab tests that are currently active for the reader
		activeAbTests.forEach( test => abtest( test ) );
		next();
	},
	prettyRedirects: function( context, next ) {
		// Do we have a 'pretty' site or feed URL?
		let redirect;
		if ( context.params.blog_id ) {
			redirect = readerRoute.getPrettySiteUrl( context.params.blog_id );
		} else if ( context.params.feed_id ) {
			redirect = readerRoute.getPrettyFeedUrl( context.params.feed_id );
		}

		if ( redirect ) {
			return page.redirect( redirect );
		}

		next();
	},

	legacyRedirects: function( context, next ) {
		const legacyPathRegexes = {
			feedStream: /^\/read\/blog\/feed\/([0-9]+)$/i,
			feedFullPost: /^\/read\/post\/feed\/([0-9]+)\/([0-9]+)$/i,
			blogStream: /^\/read\/blog\/id\/([0-9]+)$/i,
			blogFullPost: /^\/read\/post\/id\/([0-9]+)\/([0-9]+)$/i,
		};

		if ( context.path.match( legacyPathRegexes.feedStream ) ) {
			page.redirect( `/read/feeds/${context.params.feed_id}` );
		} else if ( context.path.match( legacyPathRegexes.feedFullPost ) ) {
			page.redirect( `/read/feeds/${context.params.feed_id}/posts/${context.params.post_id}` );
		} else if ( context.path.match( legacyPathRegexes.blogStream ) ) {
			page.redirect( `/read/blogs/${context.params.blog_id}` );
		} else if ( context.path.match( legacyPathRegexes.blogFullPost ) ) {
			page.redirect( `/read/blogs/${context.params.blog_id}/posts/${context.params.post_id}` );
		}

		next();
	},

	incompleteUrlRedirects: function( context, next ) {
		let redirect;
		// Have we arrived at a URL ending in /posts? Redirect to feed stream/blog stream
		if ( context.path.match( /^\/read\/feeds\/([0-9]+)\/posts$/i ) ) {
			redirect = `/read/feeds/${context.params.feed_id}`
		} else if ( context.path.match( /^\/read\/blogs\/([0-9]+)\/posts$/i ) ) {
			redirect = `/read/blogs/${context.params.blog_id}`
		}

		if ( redirect ) {
			return page.redirect( redirect );
		}

		next();
	},

	loadSubscriptions: function( context, next ) {
		// these three are included to ensure that the stores required have been loaded and can accept actions
		const FeedSubscriptionStore = require( 'lib/reader-feed-subscriptions' ), // eslint-disable-line no-unused-vars
			PostEmailSubscriptionStore = require( 'lib/reader-post-email-subscriptions' ), // eslint-disable-line no-unused-vars
			CommentEmailSubscriptionStore = require( 'lib/reader-comment-email-subscriptions' ); // eslint-disable-line no-unused-vars
		FeedSubscriptionActions.fetchAll();
		next();
	},

	sidebar: function( context, next ) {
		var ReaderSidebarComponent = require( 'reader/sidebar' );

		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( ReaderSidebarComponent, { path: context.path } )
			),
			document.getElementById( 'secondary' )
		);

		next();
	},

	following: function( context ) {
		var FollowingComponent = require( 'reader/following-stream' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Following',
			followingStore = feedStreamFactory( 'following' ),
			mcKey = 'following';

		ensureStoreLoading( followingStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		stats.recordTrack( 'calypso_reader_following_loaded' );

		setPageTitle( i18n.translate( 'Following' ) );

		ReactDom.render(
			React.createElement( FollowingComponent, {
				key: 'following',
				listName: i18n.translate( 'Followed Sites' ),
				store: followingStore,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey )
			} ),
			document.getElementById( 'primary' )
		);
	},

	feedListing: function( context ) {
		var FeedStream = require( 'reader/feed-stream' ),
			basePath = '/read/feeds/:feed_id',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Feed > ' + context.params.feed_id,
			feedStore = feedStreamFactory( 'feed:' + context.params.feed_id ),
			mcKey = 'blog';

		ensureStoreLoading( feedStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		stats.recordTrack( 'calypso_reader_blog_preview', {
			feed_id: context.params.feed_id
		} );

		ReactDom.render(
			React.createElement( FeedStream, {
				key: 'feed-' + context.params.feed_id,
				store: feedStore,
				feedId: context.params.feed_id,
				setPageTitle: setPageTitle,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
				suppressSiteNameLink: true,
				showBack: userHasHistory( context )
			} ),
			document.getElementById( 'primary' )
		);
	},

	blogListing: function( context ) {
		var SiteStream = require( 'reader/site-stream' ),
			basePath = '/read/blogs/:blog_id',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Site > ' + context.params.blog_id,
			feedStore = feedStreamFactory( 'site:' + context.params.blog_id ),
			mcKey = 'blog';

		ensureStoreLoading( feedStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		stats.recordTrack( 'calypso_reader_blog_preview', {
			blog_id: context.params.blog_id
		} );

		ReactDom.render(
			React.createElement( SiteStream, {
				key: 'site-' + context.params.blog_id,
				store: feedStore,
				siteId: context.params.blog_id,
				setPageTitle: setPageTitle,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
				suppressSiteNameLink: true,
				showBack: userHasHistory( context )
			} ),
			document.getElementById( 'primary' )
		);
	},

	feedPost: function( context ) {
		var FullPostDialog = require( 'reader/full-post' ),
			feedId = context.params.feed,
			postId = context.params.post,
			basePath = '/read/feeds/:feed_id/posts/:feed_item_id',
			fullPageTitle = analyticsPageTitle + ' > Feed Post > ' + feedId + ' > ' + postId;

		__lastTitle = TitleStore.getState().title;

		trackPageLoad( basePath, fullPageTitle, 'full_post' );

		// this will automatically unmount anything that was already mounted
		// in #tertiary, so we don't have to check the current state of
		// __fullPostInstance before making another
		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( FullPostDialog, {
					feedId: feedId,
					postId: postId,
					setPageTitle: setPageTitle,
					onClose: function() {
						page.back( context.lastRoute || '/' );
					},
					onClosed: removeFullPostDialog
				} )
			),
			document.getElementById( 'tertiary' )
		);
	},

	resetTitle: function( context, next ) {
		if ( __lastTitle ) {
			titleActions.setTitle( __lastTitle );
			__lastTitle = null;
		}
		next();
	},

	blogPost: function( context ) {
		var FullPostDialog = require( 'reader/full-post' ),
			blogId = context.params.blog,
			postId = context.params.post,
			basePath = '/read/blogs/:blog_id/posts/:post_id',
			fullPageTitle = analyticsPageTitle + ' > Blog Post > ' + blogId + ' > ' + postId;

		__lastTitle = TitleStore.getState().title;

		trackPageLoad( basePath, fullPageTitle, 'full_post' );

		// this will automatically unmount anything that was already mounted
		// in #tertiary, so we don't have to check the current state
		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( FullPostDialog, {
					blogId: blogId,
					postId: postId,
					context: context,
					setPageTitle: setPageTitle,
					onClose: function() {
						page.back( context.lastRoute || '/' );
					},
					onClosed: removeFullPostDialog
				} )
			),
			document.getElementById( 'tertiary' )
		);
	},

	removePost: function( context, next ) {
		context.store.dispatch( hideReaderFullPost() );
		next();
	},

	tagListing: function( context ) {
		var TagStream = require( 'reader/tag-stream' ),
			basePath = '/tag/:slug',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Tag > ' + context.params.tag,
			tagSlug = trim( context.params.tag )
				.toLowerCase()
				.replace( /\s+/g, '-' )
				.replace( /-{2,}/g, '-' ),
			encodedTag = encodeURIComponent( tagSlug ).toLowerCase(),
			tagStore = feedStreamFactory( 'tag:' + tagSlug ),
			mcKey = 'topic';

		ensureStoreLoading( tagStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		stats.recordTrack( 'calypso_reader_tag_loaded', {
			tag: tagSlug
		} );

		ReactDom.render(
			React.createElement( TagStream, {
				key: 'tag-' + encodedTag,
				store: tagStore,
				tag: encodedTag,
				setPageTitle: setPageTitle,
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
			document.getElementById( 'primary' )
		);
	},

	listListing: function( context ) {
		var ListStream = require( 'reader/list-stream' ),
			basePath = '/read/list/:owner/:slug',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > List > ' + context.params.user + ' - ' + context.params.list,
			listStore = feedStreamFactory( 'list:' + context.params.user + '-' + context.params.list ),
			mcKey = 'list';

		ensureStoreLoading( listStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		stats.recordTrack( 'calypso_reader_list_loaded', {
			list_owner: context.params.user,
			list_slug: context.params.list
		} );

		ReactDom.render(
			React.createElement( ListStream, {
				key: 'tag-' + context.params.user + '-' + context.params.list,
				store: listStore,
				list: {
					owner: context.params.user,
					slug: context.params.list
				},
				setPageTitle: setPageTitle,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey )
			} ),
			document.getElementById( 'primary' )
		);
	},

	readA8C: function( context ) {
		var FollowingComponent = require( 'reader/following-stream' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > A8C',
			feedStore = feedStreamFactory( 'a8c' ),
			mcKey = 'a8c';

		ensureStoreLoading( feedStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		setPageTitle( 'Automattic' );

		ReactDom.render(
			React.createElement( FollowingComponent, {
				key: 'read-a8c',
				className: 'is-a8c',
				listName: 'Automattic',
				store: feedStore,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey )
			} ),
			document.getElementById( 'primary' )
		);
	},

	likes: function( context ) {
		var LikedPostsStream = require( 'reader/liked-stream' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > My Likes',
			likedPostsStore = feedStreamFactory( 'likes' ),
			mcKey = 'postlike';

		ensureStoreLoading( likedPostsStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( LikedPostsStream, {
				key: 'liked',
				store: likedPostsStore,
				setPageTitle: setPageTitle,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey )
			} ),
			document.getElementById( 'primary' )
		);
	},

	followingEdit: function( context ) {
		var FollowingEdit = require( 'reader/following-edit' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage Followed Sites',
			mcKey = 'following_edit',
			search = context.query.s;

		setPageTitle( i18n.translate( 'Manage Followed Sites' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( FollowingEdit, {
				key: 'following-edit',
				initialFollowUrl: context.query.follow,
				search: search,
				context: context,
				userSettings: userSettings
			} ),
			document.getElementById( 'primary' )
		);
	},

	recommendedForYou: function() {
		const RecommendedForYou = require( 'reader/recommendations/for-you' ),
			basePath = '/recommendations',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Recommended Sites For You',
			mcKey = 'recommendations_for_you';

		ReactDom.render(
			React.createElement( RecommendedForYou, {
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				)
			} ),
			document.getElementById( 'primary' )
		);

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		setPageTitle( i18n.translate( 'Recommended Sites For You' ) );
	},

	listManagementSites: function( context ) {
		const listManagement = require( 'reader/list-management' ),
			basePath = '/read/list/:owner/:slug/sites',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage List > Sites',
			mcKey = 'list_sites';

		setPageTitle( i18n.translate( 'Manage List' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( listManagement, {
				key: 'list-management-sites',
				list: {
					owner: context.params.user,
					slug: context.params.list
				},
				tab: 'sites',
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				)
			} ),
			document.getElementById( 'primary' )
		);
	},

	listManagementTags: function( context ) {
		const listManagement = require( 'reader/list-management' ),
			basePath = '/read/list/:owner/:slug/tags',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage List > Tags',
			mcKey = 'list_tags';

		setPageTitle( i18n.translate( 'Manage List' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( listManagement, {
				key: 'list-management-tags',
				list: {
					owner: context.params.user,
					slug: context.params.list
				},
				tab: 'tags',
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				)
			} ),
			document.getElementById( 'primary' )
		);
	},

	listManagementDescriptionEdit: function( context ) {
		const listManagement = require( 'reader/list-management' ),
			basePath = '/read/list/:owner/:slug/edit',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage List > Description',
			mcKey = 'list_edit';

		setPageTitle( i18n.translate( 'Manage List Description' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( listManagement, {
				key: 'list-management-description-edit',
				list: {
					owner: context.params.user,
					slug: context.params.list
				},
				tab: 'description-edit'
			} ),
			document.getElementById( 'primary' )
		);
	},

	discover: function( context ) {
		var blogId = config( 'discover_blog_id' ),
			SiteStream = require( 'reader/site-stream' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Site > ' + blogId,
			feedStore = feedStreamFactory( 'site:' + blogId ),
			mcKey = 'discover';

		titleActions.setTitle( 'Discover' );

		ensureStoreLoading( feedStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		stats.recordTrack( 'calypso_reader_discover_viewed' );

		ReactDom.render(
			React.createElement( SiteStream, {
				key: 'site-' + blogId,
				store: feedStore,
				siteId: blogId,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
				suppressSiteNameLink: true,
				showBack: false
			} ),
			document.getElementById( 'primary' )
		);
	}
};
