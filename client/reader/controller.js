/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	page = require( 'page' ),
	debug = require( 'debug' )( 'calypso:reader:controller' ),
	trim = require( 'lodash/string/trim' );

/**
 * Internal Dependencies
 */
var i18n = require( 'lib/mixins/i18n' ),
	route = require( 'lib/route' ),
	analytics = require( 'analytics' ),
	config = require( 'config' ),
	feedStreamFactory = require( 'lib/feed-stream-store' ),
	FeedStreamStoreActions = require( 'lib/feed-stream-store/actions' ),
	analyticsPageTitle = 'Reader',
	i18n = require( 'lib/mixins/i18n' ),
	TitleStore = require( 'lib/screen-title/store' ),
	titleActions = require( 'lib/screen-title/actions' ),
	FeedSubscriptionActions = require( 'lib/reader-feed-subscriptions/actions' );

// This is a tri-state.
// null == nothing instantiated, nothing pending
// false === waiting for transitions to end so we can unmount
// object === instance alive and being used
var __fullPostInstance = null,
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

function removeFullPostDialog() {
	ReactDom.unmountComponentAtNode( document.getElementById( 'tertiary' ) );
	__fullPostInstance = null;
}

function ensureStoreLoading( store ) {
	if ( store.getPage() === 1 ) {
		FeedStreamStoreActions.fetchNextPage( store.id );
	}
	return store;
}

function pageTitleSetter() {
	return function( title ) {
		titleActions.setTitle( i18n.translate( '%s ‹ Reader', { args: title } ) );
	};
}

module.exports = {
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

		context.layout.setState( {
			section: 'reader',
			noSidebar: false
		} );

		ReactDom.render(
			React.createElement( ReaderSidebarComponent, { path: context.path } ),
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

		ensureStoreLoading( followingStore );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		pageTitleSetter()( i18n.translate( 'Following' ) );

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
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Feed > ' + context.params.feed_id,
			feedStore = feedStreamFactory( 'feed:' + context.params.feed_id ),
			setPageTitle = pageTitleSetter( context ),
			mcKey = 'blog';

		ensureStoreLoading( feedStore );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		analytics.tracks.recordEvent( 'calypso_reader_blog_preview' );

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
				suppressSiteNameLink: true
			} ),
			document.getElementById( 'primary' )
		);
	},

	blogListing: function( context ) {
		var SiteStream = require( 'reader/site-stream' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Site > ' + context.params.blog_id,
			feedStore = feedStreamFactory( 'site:' + context.params.blog_id ),
			setPageTitle = pageTitleSetter( context ),
			mcKey = 'blog';

		ensureStoreLoading( feedStore );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		analytics.tracks.recordEvent( 'calypso_reader_blog_preview' );

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
				suppressSiteNameLink: true
			} ),
			document.getElementById( 'primary' )
		);
	},

	feedPost: function( context ) {
		var FullPostDialog = require( 'reader/full-post' ),
			feedId = context.params.feed,
			postId = context.params.post,
			basePath = route.sectionify( context.path ),
			fullPageTitle = analyticsPageTitle + ' > Feed Post > ' + feedId + ' > ' + postId,
			setPageTitle = pageTitleSetter( context );

		__lastTitle = TitleStore.getState().title;

		trackPageLoad( basePath, fullPageTitle, 'full_post' );

		// this will automatically unmount anything that was already mounted
		// in #tertiary, so we don't have to check the current state of
		// __fullPostInstance before making another
		__fullPostInstance = ReactDom.render(
			React.createElement( FullPostDialog, {
				feedId: feedId,
				postId: postId,
				setPageTitle: setPageTitle,
				onClose: function() {
					page.back( context.lastRoute || '/' );
				},
				onClosed: removeFullPostDialog
			} ),
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
			basePath = route.sectionify( context.path ),
			fullPageTitle = analyticsPageTitle + ' > Blog Post > ' + blogId + ' > ' + postId,
			setPageTitle = pageTitleSetter( context );

		__lastTitle = TitleStore.getState().title;

		trackPageLoad( basePath, fullPageTitle, 'full_post' );

		// this will automatically unmount anything that was already mounted
		// in #tertiary, so we don't have to check the current state of
		// __fullPostInstance before making another
		__fullPostInstance = ReactDom.render(
			React.createElement( FullPostDialog, {
				blogId: blogId,
				postId: postId,
				context: context,
				setPageTitle: setPageTitle,
				onClose: function() {
					page.back( context.lastRoute || '/' );
				},
				onClosed: removeFullPostDialog
			} ),
			document.getElementById( 'tertiary' )
		);
	},

	removePost: function( context, next ) {
		if ( __fullPostInstance ) {
			__fullPostInstance.setState( { isVisible: false } );
			__fullPostInstance = false;
		}

		next();
	},

	tagListing: function( context ) {
		var TagStream = require( 'reader/tag-stream' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Tag > ' + context.params.tag,
			tagSlug = trim( context.params.tag )
				.toLowerCase()
				.replace( /\s+/g, '-' )
				.replace( /-{2,}/g, '-' ),
			encodedTag = encodeURIComponent( tagSlug ).toLowerCase(),
			tagStore = feedStreamFactory( 'tag:' + tagSlug ),
			setPageTitle = pageTitleSetter( context ),
			mcKey = 'topic';

		ensureStoreLoading( tagStore );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		analytics.tracks.recordEvent( 'calypso_reader_tag_loaded' );

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
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey )
			} ),
			document.getElementById( 'primary' )
		);
	},

	listListing: function( context ) {
		var ListStream = require( 'reader/list-stream' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > List > ' + context.params.user + ' - ' + context.params.list,
			listStore = feedStreamFactory( 'list:' + context.params.user + '-' + context.params.list ),
			setPageTitle = pageTitleSetter( context ),
			mcKey = 'list';

		ensureStoreLoading( listStore );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		analytics.tracks.recordEvent( 'calypso_reader_list_loaded' );

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

		ensureStoreLoading( feedStore );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		pageTitleSetter( context )( 'Automattic' );

		ReactDom.render(
			React.createElement( FollowingComponent, {
				key: 'read-a8c',
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
			setPageTitle = pageTitleSetter( context ),
			mcKey = 'postlike';

		ensureStoreLoading( likedPostsStore );

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

		pageTitleSetter( context )( i18n.translate( 'Manage Followed Sites' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( FollowingEdit, {
				key: 'following-edit',
				initialFollowUrl: context.query.follow,
				search: search,
				context: context
			} ),
			document.getElementById( 'primary' )
		);
	},

	recommendedForYou: function( context ) {
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
		pageTitleSetter( context )( i18n.translate( 'Recommended Sites For You' ) );
	},

	listManagementContents: function( context ) {
		var listManagementContents = require( 'reader/list-management/contents' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage List',
			mcKey = 'list_edit';

		pageTitleSetter( context )( i18n.translate( 'Manage List' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( listManagementContents, {
				key: 'list-management-contents',
				list: {
					owner: context.params.user,
					slug: context.params.list
				}
			} ),
			document.getElementById( 'primary' )
		);
	},

	listManagementDescriptionEdit: function( context ) {
		var listManagementDescriptionEdit = require( 'reader/list-management/description-edit' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage List Description',
			mcKey = 'list_edit_description';

		pageTitleSetter( context )( i18n.translate( 'Manage List Description' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( listManagementDescriptionEdit, {
				key: 'list-management-description-edit',
				list: {
					owner: context.params.user,
					slug: context.params.list
				}
			} ),
			document.getElementById( 'primary' )
		);
	},

	listManagementFollowers: function( context ) {
		var listManagementFollowers = require( 'reader/list-management/followers' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > List Followers',
			mcKey = 'list_followers';

		pageTitleSetter( context )( i18n.translate( 'List Followers' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( listManagementFollowers, {
				key: 'list-management-followers',
				list: {
					owner: context.params.user,
					slug: context.params.list
				}
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

		ensureStoreLoading( feedStore );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		analytics.tracks.recordEvent( 'calypso_reader_discover_viewed' );

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
