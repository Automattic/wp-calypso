/**
 * External Dependencies
 */
const ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	page = require( 'page' ),
	debug = require( 'debug' )( 'calypso:reader:controller' ),
	trim = require( 'lodash/string/trim' ),
	startsWith = require( 'lodash/string/startsWith' ),
	moment = require( 'moment' );

/**
 * Internal Dependencies
 */
const i18n = require( 'lib/mixins/i18n' ),
	route = require( 'lib/route' ),
	pageNotifier = require( 'lib/route/page-notifier' ),
	analytics = require( 'analytics' ),
	config = require( 'config' ),
	feedStreamFactory = require( 'lib/feed-stream-store' ),
	FeedStreamStoreActions = require( 'lib/feed-stream-store/actions' ),
	analyticsPageTitle = 'Reader',
	TitleStore = require( 'lib/screen-title/store' ),
	titleActions = require( 'lib/screen-title/actions' ),
	setSection = require( 'state/ui/actions' ).setSection,
	FeedSubscriptionActions = require( 'lib/reader-feed-subscriptions/actions' ),
	readerRoute = require( 'reader/route'),
	renderWithReduxStore = require( 'lib/react-helpers' ).renderWithReduxStore;

import userSettings from 'lib/user-settings';

// This is a tri-state.
// null == nothing instantiated, nothing pending
// false === waiting for transitions to end so we can unmount
// function === instance alive and being used
var __fullPostRemover = null,
	// This holds the last title set on the page. Removing the overlay doesn't trigger a re-render, so we need a way to
	// reset it
	__lastTitle = null;

function trackPageLoad( path, title, readerView ) {
	analytics.pageView.record( path, title );
	analytics.mc.bumpStat( 'reader_views', readerView === 'full_post' ? readerView : readerView + '_load' );
}

function trackUpdatesLoaded( key ) {
	analytics.mc.bumpStat( 'reader_views', key + '_load_new' );
	analytics.ga.recordEvent( 'Reader', 'Clicked Load New Posts', key );
}

function trackScrollPage( path, title, category, readerView, pageNum ) {
	debug( 'scroll [%s], [%s], [%s], [%d]', path, title, category, pageNum );

	analytics.ga.recordEvent( category, 'Loaded Next Page', 'page', pageNum );
	analytics.tracks.recordEvent( 'calypso_reader_infinite_scroll_performed' );
	analytics.pageView.record( path, title );
	analytics.mc.bumpStat( {
		newdash_pageviews: 'scroll',
		reader_views: readerView + '_scroll'
	} );
}

// Listen for route changes and remove the full post dialog when we navigate away from it
pageNotifier( function removeFullPostOnLeave( newContext, oldContext ) {
	if ( ! oldContext ) {
		return;
	}

	const fullPostViewPrefix = '/read/post/';

	if ( startsWith( oldContext.path, fullPostViewPrefix ) &&
		! startsWith( newContext.path, fullPostViewPrefix ) &&
		__fullPostRemover ) {
		__fullPostRemover();
		__fullPostRemover = false;
	}
} );

function removeFullPostDialog() {
	ReactDom.unmountComponentAtNode( document.getElementById( 'tertiary' ) );
	__fullPostRemover = null;
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
	redirects: function( context, next ) {
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

		context.store.dispatch( setSection( 'reader' ) );

		renderWithReduxStore(
			React.createElement( ReaderSidebarComponent, { path: context.path } ),
			document.getElementById( 'secondary' ),
			context.store
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

		setPageTitle( i18n.translate( 'Following' ) );

		renderWithReduxStore(
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
			document.getElementById( 'primary' ),
			context.store
		);
	},

	feedListing: function( context ) {
		var FeedStream = require( 'reader/feed-stream' ),
			basePath = '/read/blog/feed/:feed_id',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Feed > ' + context.params.feed_id,
			feedStore = feedStreamFactory( 'feed:' + context.params.feed_id ),
			mcKey = 'blog';

		ensureStoreLoading( feedStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		analytics.tracks.recordEvent( 'calypso_reader_blog_preview', {
			feed_id: context.params.feed_id
		} );

		renderWithReduxStore(
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
			document.getElementById( 'primary' ),
			context.store
		);
	},

	blogListing: function( context ) {
		var SiteStream = require( 'reader/site-stream' ),
			basePath = '/read/blog/id/:blog_id',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Site > ' + context.params.blog_id,
			feedStore = feedStreamFactory( 'site:' + context.params.blog_id ),
			mcKey = 'blog';

		ensureStoreLoading( feedStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		analytics.tracks.recordEvent( 'calypso_reader_blog_preview', {
			blog_id: context.params.blog_id
		} );

		renderWithReduxStore(
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
			document.getElementById( 'primary' ),
			context.store
		);
	},

	feedPost: function( context ) {
		var FullPostDialog = require( 'reader/full-post' ),
			feedId = context.params.feed,
			postId = context.params.post,
			basePath = '/read/post/feed/:feed_id/:feed_item_id',
			fullPageTitle = analyticsPageTitle + ' > Feed Post > ' + feedId + ' > ' + postId;

		__lastTitle = TitleStore.getState().title;

		trackPageLoad( basePath, fullPageTitle, 'full_post' );

		// this will automatically unmount anything that was already mounted
		// in #tertiary, so we don't have to check the current state of
		// __fullPostRemover before making another
		renderWithReduxStore(
			React.createElement( FullPostDialog, {
				feedId: feedId,
				postId: postId,
				setPageTitle: setPageTitle,
				onClose: function() {
					page.back( context.lastRoute || '/' );
				},
				onClosed: removeFullPostDialog,
				removeAnimationHandlerSetter: function removeAnimationHandlerSetter( startRemoveAnimation ) {
					__fullPostRemover = startRemoveAnimation;
				}
			} ),
			document.getElementById( 'tertiary' ),
			context.store
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
			basePath = '/read/post/id/:blog_id/:post_id',
			fullPageTitle = analyticsPageTitle + ' > Blog Post > ' + blogId + ' > ' + postId;

		__lastTitle = TitleStore.getState().title;

		trackPageLoad( basePath, fullPageTitle, 'full_post' );

		// this will automatically unmount anything that was already mounted
		// in #tertiary, so we don't have to check the current state of
		// __fullPostRemover before making another
		renderWithReduxStore(
			React.createElement( FullPostDialog, {
				blogId: blogId,
				postId: postId,
				context: context,
				setPageTitle: setPageTitle,
				onClose: function() {
					page.back( context.lastRoute || '/' );
				},
				onClosed: removeFullPostDialog,
				removeAnimationHandlerSetter: function removeAnimationHandlerSetter( startRemoveAnimation ) {
					__fullPostRemover = startRemoveAnimation;
				}
			} ),
			document.getElementById( 'tertiary' ),
			context.store
		);
	},

	removePost: function( context, next ) {
		if ( __fullPostRemover ) {
			__fullPostRemover();
			__fullPostRemover = false;
		}

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
		analytics.tracks.recordEvent( 'calypso_reader_tag_loaded', {
			tag: tagSlug
		} );

		renderWithReduxStore(
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
			document.getElementById( 'primary' ),
			context.store
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
		analytics.tracks.recordEvent( 'calypso_reader_list_loaded', {
			list_owner: context.params.user,
			list_slug: context.params.list
		} );

		renderWithReduxStore(
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
			document.getElementById( 'primary' ),
			context.store
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

		renderWithReduxStore(
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
			document.getElementById( 'primary' ),
			context.store
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

		renderWithReduxStore(
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
			document.getElementById( 'primary' ),
			context.store
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

		renderWithReduxStore(
			React.createElement( FollowingEdit, {
				key: 'following-edit',
				initialFollowUrl: context.query.follow,
				search: search,
				context: context,
				userSettings: userSettings
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	recommendedForYou: function() {
		const RecommendedForYou = require( 'reader/recommendations/for-you' ),
			basePath = '/recommendations',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Recommended Sites For You',
			mcKey = 'recommendations_for_you';

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
		setPageTitle( i18n.translate( 'Recommended Sites For You' ) );
	},

	listManagementSites: function( context ) {
		const listManagement = require( 'reader/list-management' ),
			basePath = '/read/list/:owner/:slug/sites',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage List > Sites',
			mcKey = 'list_sites';

		setPageTitle( i18n.translate( 'Manage List' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		renderWithReduxStore(
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
			document.getElementById( 'primary' ),
			context.store
		);
	},

	listManagementTags: function( context ) {
		const listManagement = require( 'reader/list-management' ),
			basePath = '/read/list/:owner/:slug/tags',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage List > Tags',
			mcKey = 'list_tags';

		setPageTitle( i18n.translate( 'Manage List' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		renderWithReduxStore(
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
			document.getElementById( 'primary' ),
			context.store
		);
	},

	listManagementDescriptionEdit: function( context ) {
		const listManagement = require( 'reader/list-management' ),
			basePath = '/read/list/:owner/:slug/edit',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage List > Description',
			mcKey = 'list_edit';

		setPageTitle( i18n.translate( 'Manage List Description' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		renderWithReduxStore(
			React.createElement( listManagement, {
				key: 'list-management-description-edit',
				list: {
					owner: context.params.user,
					slug: context.params.list
				},
				tab: 'description-edit'
			} ),
			document.getElementById( 'primary' ),
			context.store
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
		analytics.tracks.recordEvent( 'calypso_reader_discover_viewed' );

		renderWithReduxStore(
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
			document.getElementById( 'primary' ),
			context.store
		);
	}
};
