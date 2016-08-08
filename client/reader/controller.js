/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import page from 'page';
import { Provider as ReduxProvider } from 'react-redux';
import i18n from 'i18n-calypso';
import config from 'config';
import defer from 'lodash/defer';

/**
 * Internal Dependencies
 */
import abtest from 'lib/abtest';
import route from 'lib/route';
import feedStreamFactory from 'lib/feed-stream-store';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, trackScrollPage, setPageTitle } from './controller-helper';
import FeedError from 'reader/feed-error';
import FeedSubscriptionActions from 'lib/reader-feed-subscriptions/actions';
import {
	getPrettyFeedUrl,
	getPrettySiteUrl
} from 'reader/route';
import { recordTrack } from 'reader/stats';
import { getCurrentUser } from 'state/current-user/selectors';
import { requestGraduate } from 'state/reader/start/actions';
import { isRequestingGraduation } from 'state/reader/start/selectors';
import { hideReaderFullPost } from 'state/ui/reader/fullpost/actions';
import { preload } from 'sections-preload';

const analyticsPageTitle = 'Reader';

const activeAbTests = [
	// active tests would go here
];
let lastRoute = null;

function userHasHistory( context ) {
	return !! context.lastRoute;
}

function renderFeedError() {
	ReactDom.render(
		React.createElement( FeedError ),
		document.getElementById( 'primary' )
	);
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
			redirect = getPrettySiteUrl( context.params.blog_id );
		} else if ( context.params.feed_id ) {
			redirect = getPrettyFeedUrl( context.params.feed_id );
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

	updateLastRoute( context, next ) {
		if ( lastRoute ) {
			context.lastRoute = lastRoute;
		}
		lastRoute = context.path;
		next();
	},

	incompleteUrlRedirects: function( context, next ) {
		let redirect;
		// Have we arrived at a URL ending in /posts? Redirect to feed stream/blog stream
		if ( context.path.match( /^\/read\/feeds\/([0-9]+)\/posts$/i ) ) {
			redirect = `/read/feeds/${context.params.feed_id}`;
		} else if ( context.path.match( /^\/read\/blogs\/([0-9]+)\/posts$/i ) ) {
			redirect = `/read/blogs/${context.params.blog_id}`;
		}

		if ( redirect ) {
			return page.redirect( redirect );
		}

		next();
	},

	preloadReaderBundle: function( context, next ) {
		preload( 'reader' );
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

	checkForColdStart: function( context, next ) {
		const FeedSubscriptionStore = require( 'lib/reader-feed-subscriptions' );
		const user = getCurrentUser( context.store.getState() );
		const numberofTries = 3;

		if ( ! user ) {
			next();
			return;
		}

		if ( ! user.is_new_reader ) {
			next();
			return;
		}

		function checkSubCount( tries ) {
			if ( FeedSubscriptionStore.getCurrentPage() > 0 || FeedSubscriptionStore.isLastPage() ) {
				// we have total subs now, make the decision
				if ( FeedSubscriptionStore.getTotalSubscriptions() < config( 'reader_cold_start_graduation_threshold' ) ) {
					defer( page.redirect.bind( page, '/recommendations/start' ) );
				} else {
					if ( ! isRequestingGraduation( context.store.getState() ) ) {
						context.store.dispatch( requestGraduate() );
					}
					defer( next );
				}
			} else if ( tries > -1 ) {
				FeedSubscriptionStore.once( 'change', checkSubCount.bind( null, --tries ) );
			} else {
				defer( next );
			}
		}

		checkSubCount( numberofTries );
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

	unmountSidebar: function( context, next ) {
		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
		next();
	},

	following: function( context ) {
		var FollowingComponent = require( 'reader/following/main' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Following',
			followingStore = feedStreamFactory( 'following' ),
			mcKey = 'following';

		ensureStoreLoading( followingStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_following_loaded' );

		setPageTitle( i18n.translate( 'Following' ) );

		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
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
				} )
			),
			document.getElementById( 'primary' )
		);
	},

	feedDiscovery: function( context, next ) {
		var feedLookup = require( 'lib/feed-lookup' );

		if ( ! context.params.feed_id.match( /^\d+$/ ) ) {
			feedLookup( context.params.feed_id )
				.then( function( feedId ) {
					page.redirect( `/read/feeds/${feedId}` );
				} )
				.catch( function() {
					renderFeedError();
				} );
		} else {
			next();
		}
	},

	feedListing: function( context ) {
		var FeedStream = require( 'reader/feed-stream' ),
			basePath = '/read/feeds/:feed_id',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Feed > ' + context.params.feed_id,
			feedStore = feedStreamFactory( 'feed:' + context.params.feed_id ),
			mcKey = 'blog';

		ensureStoreLoading( feedStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_blog_preview', {
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
		recordTrack( 'calypso_reader_blog_preview', {
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

	removePost: function( context, next ) {
		context.store.dispatch( hideReaderFullPost() );
		next();
	},

	readA8C: function( context ) {
		var FollowingComponent = require( 'reader/following/main' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > A8C',
			feedStore = feedStreamFactory( 'a8c' ),
			mcKey = 'a8c';

		ensureStoreLoading( feedStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		setPageTitle( 'Automattic' );

		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
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
			),
			document.getElementById( 'primary' )
		);
	}
};
