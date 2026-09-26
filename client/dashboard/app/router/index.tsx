import calypsoConfig from '@automattic/calypso-config';
import { addBreadcrumb, setTag } from '@automattic/calypso-sentry';
import { createRouter, createRoute } from '@tanstack/react-router';
import NotFound from '../404';
import UnknownError from '../500';
import { handleOnCatch, initLogger } from '../logger';
import { normalizeRouteId, startPerformanceTracking } from '../performance-tracking';
import { createAgencyRoutes } from './agency';
import { createAgencyClientRoutes } from './agency-client';
import { createDomainsRoutes } from './domains';
import { createEmailsRoutes } from './emails';
import { createMeRoutes } from './me';
import { createPluginsRoutes } from './plugins';
import { dashboardRedirect } from './redirect';
import { rootRoute } from './root';
import { createSitesRoutes } from './sites';
import { startStoreRoute } from './start-store';
import { switchRoute } from './switch';
import type { SiteTypeFeature } from '../../utils/site-type-feature-support';
import type { AppConfig } from '../context';
import type { AgencyCapability } from '@automattic/api-core';
import type { ErrorInfo } from 'react';

/**
 * Module augmentation for TanStack router's staticData.
 */
declare module '@tanstack/react-router' {
	interface StaticDataRouteOption {
		/**
		 * If set, the route is only accessible when the site type supports this feature.
		 * The check is performed in siteRoute.beforeLoad and agencySiteRoute.beforeLoad
		 * against getSiteTypeFeatureSupports(site).
		 */
		requiresSiteTypeSupport?: SiteTypeFeature;
		availableToInaccessibleJetpackSites?: boolean;
		/**
		 * If set, the route is only accessible when the agency user holds at least one
		 * of these capabilities. Enforced in agencyRoute.beforeLoad.
		 */
		requiresAgencyCapability?: AgencyCapability | AgencyCapability[];
	}
}

interface RouteContext {
	config?: AppConfig;
}

const indexRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '/',
	beforeLoad: ( { context }: { context: RouteContext } ) => {
		if ( context.config ) {
			throw dashboardRedirect( { to: context.config.mainRoute } );
		}
	},
} );

// Catch-all so every unmatched path still resolves to a route. Without it, an
// unmatched path renders the not-found component but has no matched route, and
// navigation APIs like useBlocker throw "No route found for location".
const catchAllRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '$',
	component: NotFound,
} );

const createRouteTree = ( config: AppConfig ) => {
	const children = [];

	children.push( indexRoute );

	if ( config.supports.agency ) {
		children.push( ...createAgencyRoutes() );
	}

	if ( config.supports.agencyClient ) {
		children.push( ...createAgencyClientRoutes() );
	}

	if ( config.supports.sites ) {
		children.push( ...createSitesRoutes( config ) );
	}

	if ( config.supports.plugins ) {
		children.push( ...createPluginsRoutes() );
	}

	if ( config.supports.domains ) {
		children.push( ...createDomainsRoutes() );
	}

	if ( config.supports.emails ) {
		children.push( ...createEmailsRoutes() );
	}

	if ( config.supports.me ) {
		children.push( ...createMeRoutes( config ) );
	}

	if ( config.supports.startStoreRoute ) {
		children.push( startStoreRoute );
	}

	if ( config.supports.switch ) {
		children.push( switchRoute );
	}

	children.push( catchAllRoute );

	return rootRoute.addChildren( children );
};

export const getRouter = ( config: AppConfig ) => {
	const routeTree = createRouteTree( config );
	const router = createRouter( {
		routeTree,
		basepath: config.basePath,
		context: {
			config,
		},
		defaultErrorComponent: UnknownError,
		defaultNotFoundComponent: NotFound,
		defaultOnCatch: ( error: Error, errorInfo: ErrorInfo ) => {
			handleOnCatch( error, errorInfo, router, {
				severity: calypsoConfig( 'env_id' ) === 'dashboard-production' ? 'error' : 'debug',
				calypso_section: 'dashboard',
			} );
		},
		defaultPreload: 'intent',
		defaultPreloadStaleTime: 0,
		// Calling document.startViewTransition() ourselves is really tricky,
		// Tanstack Router knows how to do it best. Even though it says
		// "default", we can still customize it in CSS and add more transition
		// areas.
		defaultViewTransition: true,
		scrollRestoration: true,
	} );

	initLogger( router );

	// `onResolved` is emitted from a layout effect, i.e. after React commits. A
	// commit-phase crash aborts before that, so the route is recorded here
	// instead — otherwise the tag names the route the user came from, or is
	// absent entirely on a cold load of the crashing URL.
	let previousRouteId: string | undefined;
	router.subscribe( 'onBeforeLoad', () => {
		const routeId = router.state.pendingMatches?.at( -1 )?.routeId;
		if ( ! routeId ) {
			return;
		}

		startPerformanceTracking( routeId );

		// Route patterns rather than hrefs: Sentry's own navigation breadcrumbs are
		// dropped in favour of these (see `beforeBreadcrumb` in calypso-sentry), and
		// hrefs would carry site slugs and query strings — `/me/agent` alone accepts
		// `pair_token`, `token` and `telegram_id`. The specific site is already on
		// the event as the `site_slug` tag. Normalized so the value joins against
		// the same route id in RUM and Tracks, which both strip the trailing slash
		// TanStack leaves on index routes.
		const normalizedRouteId = normalizeRouteId( routeId );
		setTag( 'route_id', normalizedRouteId );
		addBreadcrumb( {
			category: 'navigation',
			data: {
				should_capture: true,
				from: previousRouteId,
				to: normalizedRouteId,
			},
		} );
		previousRouteId = normalizedRouteId;
	} );

	return router;
};
