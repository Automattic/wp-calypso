import config from '@automattic/calypso-config';
import page, { Context } from '@automattic/calypso-router';
import { addMiddleware } from 'redux-dynamic-middlewares';
import {
	makeLayout,
	redirectLoggedOut,
	redirectLoggedOutToSignup,
	render as clientRender,
	setSelectedSiteIdByOrigin,
} from 'calypso/controller';
import { getUserProfileBasePath } from 'calypso/reader/user-profile/user-profile.utils';
import {
	blogListing,
	feedDiscovery,
	feedListing,
	following,
	incompleteUrlRedirects,
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
	setupReadRoutes,
} from './controller';
import { userPosts, userLists } from './user-profile/controller';

import './style.scss';

function forceTeamA8C( context: Context, next: () => void ): void {
	context.params.team = 'a8c';
	next();
}

export async function lazyLoadDependencies(): Promise< void > {
	const isBrowser = typeof window === 'object';
	if ( isBrowser && config.isEnabled( 'lasagna' ) && config.isEnabled( 'reader' ) ) {
		const lasagnaMiddleware = await import(
			/* webpackChunkName: "lasagnaMiddleware" */ 'calypso/state/lasagna/middleware.js'
		);
		addMiddleware( lasagnaMiddleware.default );
	}
}

export default async function (): Promise< void > {
	await lazyLoadDependencies();
	setupReadRoutes();

	if ( config.isEnabled( 'reader' ) ) {
		page(
			'/reader',
			redirectLoggedOutToDiscover,
			updateLastRoute,
			sidebar,
			setSelectedSiteIdByOrigin,
			following,
			makeLayout,
			clientRender
		);

		// Incomplete paths that should be redirected to `/reader`
		page(
			[
				'/reader/following',
				'/reader/blogs',
				'/reader/feeds',
				'/reader/blog',
				'/reader/post',
				'/reader/feed',
			],
			() => page.redirect( '/reader' )
		);

		// Feed stream
		page( '/reader/feeds/:feed_id/posts', incompleteUrlRedirects );
		page(
			'/reader/feeds/:feed_id',
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
		page( '/reader/blogs/:blog_id/posts', incompleteUrlRedirects );
		page(
			'/reader/blogs/:blog_id',
			redirectLoggedOutToSignup,
			updateLastRoute,
			sidebar,
			blogListing,
			makeLayout,
			clientRender
		);

		// User profile
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

	// Automattic Employee Posts
	page(
		'/reader/a8c',
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
		'/reader/p2',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		readFollowingP2,
		makeLayout,
		clientRender
	);

	// Sites subscription management
	page(
		'/reader/subscriptions',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		siteSubscriptionsManager,
		makeLayout,
		clientRender
	);
	page(
		'/reader/subscriptions/comments',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		commentSubscriptionsManager,
		makeLayout,
		clientRender
	);
	page(
		'/reader/subscriptions/pending',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		pendingSubscriptionsManager,
		makeLayout,
		clientRender
	);
	page(
		'/reader/subscriptions/:subscription_id',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		siteSubscription,
		makeLayout,
		clientRender
	);
	page(
		'/reader/site/subscription/:blog_id',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		siteSubscription,
		makeLayout,
		clientRender
	);
}
