import calypsoConfig from '@automattic/calypso-config';
import { createRootRouteWithContext, createRouter } from '@tanstack/react-router';
import { APP_CONTEXT_DEFAULT_CONFIG } from 'calypso/dashboard/app/context';
import { handleOnCatch, initLogger } from 'calypso/dashboard/app/logger';
import * as appRouterDomains from 'calypso/dashboard/app/router/domains';
import * as appRouterEmails from 'calypso/dashboard/app/router/emails';
import * as appRouterMe from 'calypso/dashboard/app/router/me';
import * as appRouterSites from 'calypso/dashboard/app/router/sites';
import Root from 'calypso/sites/v2/components/root';
import {
	createBrowserHistoryAndMemoryRouterSync,
	getRouterOptions,
} from 'calypso/sites/v2/utils/router';
import type { AnyRoute } from '@tanstack/react-router';
import type { AppConfig } from 'calypso/dashboard/app/context';
import type { RootRouterContext } from 'calypso/dashboard/app/router/root';
import type { ErrorInfo } from 'react';

/**
 * The Dashboard's billing components reference their route objects directly
 * (`purchaseSettingsRoute.useParams()`, `<Link to={ cancelPurchaseRoute.fullPath } />`
 * and so on), so this backport reuses those very objects rather than rebuilding
 * equivalents from their options the way `calypso/sites/v2` does. A route's
 * `id`/`fullPath` are derived at router init from whatever tree it is placed in,
 * which means re-homing the three section routes below is enough to move the
 * whole subtree from `/me/billing/*` to the site-level `/purchases/*` URLs —
 * every descendant link, redirect and `useParams()` call follows along without
 * the components knowing anything changed.
 *
 * The trade-off is that we mutate route singletons owned by another module.
 * That is safe here only because the Dashboard's own `me` route tree is never
 * built in the Calypso bundle (it is built on the `my.wordpress.com` Dashboard
 * environment instead), so nothing else observes these objects. If that ever
 * stops being true, this has to become an options-copy plus a route indirection
 * inside `client/dashboard/me/billing-purchases`.
 */
function rehome< TRoute extends AnyRoute >(
	route: TRoute,
	getParentRoute: () => AnyRoute,
	path: string
): TRoute {
	Object.assign( route.options, { getParentRoute, path } );
	return route;
}

/**
 * Routes the billing components can navigate to that live outside this subtree.
 * They are included so `.fullPath`/`.to` resolve to real URLs; actually visiting
 * one leaves the embedded router, because the history sync hands any path this
 * tree owns no component for back to page.js.
 */
function createExitRoute< TRoute extends AnyRoute >(
	route: TRoute,
	getParentRoute: () => AnyRoute,
	path: string
): TRoute {
	Object.assign( route.options, {
		getParentRoute,
		path,
		beforeLoad: undefined,
		loader: undefined,
		component: () => null,
	} );
	return route;
}

export const rootRoute = createRootRouteWithContext< RootRouterContext >()( {
	component: Root,
} );

const createRouteTree = () => {
	const subscriptionsRoute = rehome(
		appRouterMe.purchasesRoute,
		() => rootRoute,
		'purchases/subscriptions/$siteSlug'
	);
	const billingHistoryRoute = rehome(
		appRouterMe.billingHistoryRoute,
		() => rootRoute,
		'purchases/billing-history/$siteSlug'
	);
	const paymentMethodsRoute = rehome(
		appRouterMe.paymentMethodsRoute,
		() => rootRoute,
		'purchases/payment-methods/$siteSlug'
	);

	const emailsRoute = createExitRoute( appRouterEmails.emailsRoute, () => rootRoute, 'emails' );

	return rootRoute.addChildren( [
		subscriptionsRoute.addChildren( [
			appRouterMe.purchasesIndexRoute,
			appRouterMe.purchaseSettingsRoute.addChildren( [
				appRouterMe.purchaseSettingsIndexRoute,
				appRouterMe.changePaymentMethodRoute,
				appRouterMe.cancelPurchaseRoute,
				appRouterMe.siteActionsRoute,
			] ),
		] ),
		billingHistoryRoute.addChildren( [
			appRouterMe.billingHistoryIndexRoute,
			appRouterMe.receiptRoute,
		] ),
		paymentMethodsRoute.addChildren( [
			appRouterMe.paymentMethodsIndexRoute,
			appRouterMe.addPaymentMethodRoute,
		] ),
		createExitRoute( appRouterSites.siteRoute, () => rootRoute, 'sites/$siteSlug' ),
		createExitRoute( appRouterDomains.domainRoute, () => rootRoute, 'domains/$domainName' ),
		emailsRoute.addChildren( [
			createExitRoute(
				appRouterEmails.addMailboxRoute,
				() => emailsRoute,
				'add-mailbox/$domain/$provider/$interval'
			),
		] ),
	] );
};

export const { syncBrowserHistoryToRouter, syncMemoryRouterToBrowserHistory } =
	createBrowserHistoryAndMemoryRouterSync();

export const getRouter = ( config: AppConfig ) => {
	const router = createRouter( {
		...getRouterOptions( config ),
		routeTree: createRouteTree(),
		defaultOnCatch: ( error: Error, errorInfo: ErrorInfo ) => {
			handleOnCatch( error, errorInfo, router, {
				severity: calypsoConfig( 'env_id' ) === 'production' ? 'error' : 'debug',
				dashboard_backport: true,
			} );
		},
	} );

	initLogger( router );

	return router;
};

export const routerConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	basePath: '/',
};

export default getRouter( routerConfig );
