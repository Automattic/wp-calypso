import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { addMiddleware } from 'redux-dynamic-middlewares';
import {
	makeLayout,
	redirectLoggedOut,
	redirectLoggedOutToSignup,
	render as clientRender,
	setSelectedSiteIdByOrigin,
} from 'calypso/controller';
import {
	getUserProfileBasePath,
	isUserProfileEnabled,
} from 'calypso/reader/user-stream/user-profile.utils';
import {
	blogListing,
	feedDiscovery,
	feedListing,
	following,
	incompleteUrlRedirects,
	legacyRedirects,
	readA8C,
	readFollowingP2,
	redirectLoggedOutToDiscover,
	sidebar,
	updateLastRoute,
	blogDiscoveryByFeedId,
	siteSubscriptionsManager,
	siteSubscription,
	commentSubscriptionsManager,
	pendingSubscriptionsManager,
} from './controller';
import { userPosts, userLists } from './user-stream/controller';

import './style.scss';

function forceTeamA8C( context, next ) {
	context.params.team = 'a8c';
	next();
}

export async function lazyLoadDependencies() {
	const isBrowser = typeof window === 'object';
	if ( isBrowser && config.isEnabled( 'lasagna' ) && config.isEnabled( 'reader' ) ) {
		const lasagnaMiddleware = await import(
			/* webpackChunkName: "lasagnaMiddleware" */ 'calypso/state/lasagna/middleware.js'
		);
		addMiddleware( lasagnaMiddleware.default );
	}
}

export default async function () {
	await lazyLoadDependencies();

	if ( config.isEnabled( 'reader' ) ) {
		page(
			'/read',
			redirectLoggedOutToDiscover,
			updateLastRoute,
			sidebar,
			setSelectedSiteIdByOrigin,
			following,
			makeLayout,
			clientRender
		);

		// Old and incomplete paths that should be redirected to /
		page( '/read/following', '/read' );
		page( '/read/blogs', '/read' );
		page( '/read/feeds', '/read' );
		page( '/read/blog', '/read' );
		page( '/read/post', '/read' );
		page( '/read/feed', '/read' );

		// Feed stream
		page( '/read/blog/feed/:feed_id', legacyRedirects );
		page( '/read/feeds/:feed_id/posts', incompleteUrlRedirects );
		page(
			'/read/feeds/:feed_id',
			blogDiscoveryByFeedId,
			redirectLoggedOutToSignup,
			updateLastRoute,
			sidebar,
			feedDiscovery,
			feedListing,
			makeLayout,
			clientRender
		);

		// Blog stream
		page( '/read/blog/id/:blog_id', legacyRedirects );
		page( '/read/blogs/:blog_id/posts', incompleteUrlRedirects );
		page(
			'/read/blogs/:blog_id',
			redirectLoggedOutToSignup,
			updateLastRoute,
			sidebar,
			blogListing,
			makeLayout,
			clientRender
		);

		// User profile
		if ( isUserProfileEnabled() ) {
			page(
				getUserProfileBasePath(),
				blogDiscoveryByFeedId,
				redirectLoggedOutToSignup,
				updateLastRoute,
				sidebar,
				userPosts,
				makeLayout,
				clientRender
			);
			page(
				getUserProfileBasePath( 'lists' ),
				blogDiscoveryByFeedId,
				redirectLoggedOutToSignup,
				updateLastRoute,
				sidebar,
				userLists,
				makeLayout,
				clientRender
			);
		}

		// Old full post view
		page( '/read/post/feed/:feed_id/:post_id', legacyRedirects );
		page( '/read/post/id/:blog_id/:post_id', legacyRedirects );

		// Old Freshly Pressed
		page( '/read/fresh', '/discover' );
	}

	// Automattic Employee Posts
	page(
		'/read/a8c',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		forceTeamA8C,
		readA8C,
		makeLayout,
		clientRender
	);

	// new P2 Posts
	page(
		'/read/p2',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		readFollowingP2,
		makeLayout,
		clientRender
	);

	// Sites subscription management
	page(
		'/read/subscriptions',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		siteSubscriptionsManager,
		makeLayout,
		clientRender
	);
	page(
		'/read/subscriptions/comments',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		commentSubscriptionsManager,
		makeLayout,
		clientRender
	);
	page(
		'/read/subscriptions/pending',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		pendingSubscriptionsManager,
		makeLayout,
		clientRender
	);
	page(
		'/read/subscriptions/:subscription_id',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		siteSubscription,
		makeLayout,
		clientRender
	);
	page(
		'/read/site/subscription/:blog_id',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		siteSubscription,
		makeLayout,
		clientRender
	);
}
