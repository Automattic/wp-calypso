import './style.scss';
import config from '@automattic/calypso-config';
import page, { Context } from '@automattic/calypso-router';
import { getAnyLanguageRouteParam, getLanguageRouteParam } from '@automattic/i18n-utils';
import { addMiddleware } from 'redux-dynamic-middlewares';
import {
	makeLayout,
	redirectLoggedOut,
	redirectLoggedOutToSignup,
	render as clientRender,
	setSelectedSiteIdByOrigin,
} from 'calypso/controller';
import { RedirectRouteList, setupRedirectRoutes } from 'calypso/utils';
import {
	blogListing,
	feedDiscovery,
	feedListing,
	feedLookup,
	following,
	readA8C,
	readFollowingP2,
	redirectLoggedOutToDiscover,
	sidebar,
	blogDiscoveryByFeedId,
	siteSubscriptionsManager,
	siteSubscription,
	commentSubscriptionsManager,
	pendingSubscriptionsManager,
	setupReadRoutes,
	setBeforePrimary,
	loadNewSubscriptionPage,
} from './controller';
import readerPostEntitiesMiddleware from './data/reader-post-entities-middleware';
import {
	createList,
	deleteList,
	editList,
	editListItems,
	exportList,
	listListing,
} from './list/controller';
import { onThisDay } from './on-this-day/controller';
import { redirectMeToCurrentUser, userProfile } from './user-profile/controller';

function forceTeamA8C( context: Context, next: () => void ): void {
	context.params.team = 'a8c';
	next();
}

export async function lazyLoadDependencies(): Promise< void > {
	addMiddleware( readerPostEntitiesMiddleware );

	const isBrowser = typeof window === 'object';
	if ( isBrowser && config.isEnabled( 'lasagna' ) ) {
		const lasagnaMiddleware = await import(
			/* webpackChunkName: "lasagnaMiddleware" */ 'calypso/state/lasagna/middleware.js'
		);
		addMiddleware( lasagnaMiddleware.default );
	}
}

export default async function (): Promise< void > {
	await lazyLoadDependencies();
	setupReadRoutes();

	page(
		[ '/reader', '/reader/recent/:feed_id' ],
		redirectLoggedOutToDiscover,
		sidebar,
		setBeforePrimary,
		setSelectedSiteIdByOrigin,
		following,
		makeLayout,
		clientRender
	);

	// On This Day
	page(
		'/reader/on-this-day',
		redirectLoggedOut,
		sidebar,
		setBeforePrimary,
		onThisDay,
		makeLayout,
		clientRender
	);

	page(
		[
			'/reader/new',
			'/reader/new/reddit',
			'/reader/new/youtube',
			'/reader/new/tumblr',
			'/reader/new/substack',
		],
		redirectLoggedOutToSignup,
		sidebar,
		setBeforePrimary,
		setSelectedSiteIdByOrigin,
		loadNewSubscriptionPage,
		makeLayout,
		clientRender
	);

	// Feed stream
	page(
		'/reader/feeds/:feed_id',
		blogDiscoveryByFeedId,
		redirectLoggedOutToSignup,
		sidebar,
		setBeforePrimary,
		feedDiscovery,
		feedListing,
		makeLayout,
		clientRender
	);

	// Blog stream
	page(
		'/reader/blogs/:blog_id',
		redirectLoggedOutToSignup,
		sidebar,
		setBeforePrimary,
		setSelectedSiteIdByOrigin,
		blogListing,
		makeLayout,
		clientRender
	);

	// User profile
	page(
		'/reader/users/id/:user_id',
		blogDiscoveryByFeedId,
		redirectLoggedOutToSignup,
		sidebar,
		setBeforePrimary,
		userProfile,
		makeLayout,
		clientRender
	);

	page(
		[ '/reader/users/me', '/reader/users/me/:view' ],
		redirectLoggedOutToSignup,
		redirectMeToCurrentUser
	);

	page(
		[ '/reader/users/:user_login', '/reader/users/:user_login/:view' ],
		blogDiscoveryByFeedId,
		redirectLoggedOutToSignup,
		setBeforePrimary,
		sidebar,
		userProfile,
		makeLayout,
		clientRender
	);

	page( '/reader/feeds/lookup/*', redirectLoggedOutToSignup, feedLookup );

	// Lists
	page(
		'/reader/list/:user/:list/edit/items',
		sidebar,
		setBeforePrimary,
		editListItems,
		makeLayout,
		clientRender
	);
	page(
		'/reader/list/:user/:list/edit',
		sidebar,
		setBeforePrimary,
		editList,
		makeLayout,
		clientRender
	);

	page( '/reader/list/new', sidebar, setBeforePrimary, createList, makeLayout, clientRender );

	page(
		'/reader/list/:user/:list/export',
		sidebar,
		setBeforePrimary,
		exportList,
		makeLayout,
		clientRender
	);

	page(
		'/reader/list/:user/:list/delete',
		sidebar,
		setBeforePrimary,
		deleteList,
		makeLayout,
		clientRender
	);

	page(
		[ '/reader/list/:user/:list', '/reader/list/:user/:list/:view' ],
		sidebar,
		setBeforePrimary,
		listListing,
		makeLayout,
		clientRender
	);

	// Automattic Employee Posts
	page(
		'/reader/a8c',
		redirectLoggedOut,
		setBeforePrimary,
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
		sidebar,
		setBeforePrimary,
		readFollowingP2,
		makeLayout,
		clientRender
	);

	// Sites subscription management
	page(
		'/reader/subscriptions',
		redirectLoggedOut,
		sidebar,
		setBeforePrimary,
		siteSubscriptionsManager,
		makeLayout,
		clientRender
	);
	page(
		'/reader/subscriptions/comments',
		redirectLoggedOut,
		sidebar,
		setBeforePrimary,
		commentSubscriptionsManager,
		makeLayout,
		clientRender
	);
	page(
		'/reader/subscriptions/pending',
		redirectLoggedOut,
		sidebar,
		setBeforePrimary,
		pendingSubscriptionsManager,
		makeLayout,
		clientRender
	);
	page(
		'/reader/subscriptions/:subscription_id',
		redirectLoggedOut,
		sidebar,
		setBeforePrimary,
		siteSubscription,
		makeLayout,
		clientRender
	);
	page(
		'/reader/site/subscription/:blog_id',
		redirectLoggedOut,
		sidebar,
		setBeforePrimary,
		siteSubscription,
		makeLayout,
		clientRender
	);

	setupReaderRedirects();
}

/**
 * Setup redirects for the reader routes.
 */
function setupReaderRedirects(): void {
	const langParam = getLanguageRouteParam();
	const anyLangParam = getAnyLanguageRouteParam();

	const readerRedirectsList: RedirectRouteList[] = [
		{
			path: `/${ langParam }/reader`,
			getRedirect: () => '/reader',
		},
		{
			path: `/${ anyLangParam }/reader`,
			getRedirect: () => '/reader',
		},
		// Incomplete paths that should be redirected to `/reader`
		{
			path: '/reader/following',
			getRedirect: () => '/reader',
		},
		{
			path: '/reader/blogs',
			getRedirect: () => '/reader',
		},
		{
			path: '/reader/feeds',
			getRedirect: () => '/reader',
		},
		{
			path: '/reader/blog',
			getRedirect: () => '/reader',
		},
		{
			path: '/reader/post',
			getRedirect: () => '/reader',
		},
		{
			path: '/reader/feed',
			getRedirect: () => '/reader',
		},
		// Feed stream
		{
			path: '/reader/feeds/:feed_id/posts',
			regex: /^\/reader\/feeds\/([0-9]+)\/posts$/i,
			getRedirect: ( params?: Record< string, string > ) => `/reader/feeds/${ params?.feed_id }`,
		},
		// Blog stream
		{
			path: '/reader/blogs/:blog_id/posts',
			regex: /^\/reader\/blogs\/([0-9]+)\/posts$/i,
			getRedirect: ( params?: Record< string, string > ) => `/reader/blogs/${ params?.blog_id }`,
		},
	];

	setupRedirectRoutes( readerRedirectsList );
}
