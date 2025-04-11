import { Router, createRoute, createRootRoute, redirect } from '@tanstack/react-router';
import NotFound from '../404';
import UnknownError from '../500';
import Billing from '../billing';
import {
	fetchProfile,
	fetchSites,
	fetchDomains,
	fetchEmails,
	fetchSiteWithRouteData,
} from '../data';
import Domains from '../domains';
import Emails from '../emails';
import Me from '../me';
import Notifications from '../notifications';
import Overview from '../overview';
import Privacy from '../privacy';
import Profile from '../profile';
import Root from '../root';
import Security from '../security';
import SiteLayout from '../site';
import SiteDeployments from '../site-deployments';
import SiteOverview from '../site-overview';
import Sites from '../sites';
import { queryClient } from './query-client';
import type { AppConfig } from './context';
import type { Domain, Email, User } from '../data/types';
import type { FetchQueryOptions } from '@tanstack/react-query';

interface RouteContext {
	auth?: {
		twoStep?: {
			two_step_reauthorization_required?: boolean;
		};
	};
}

async function maybeAwaitFetch( options: FetchQueryOptions ) {
	const cachedData = queryClient.getQueryData( options.queryKey );
	if ( ! cachedData ) {
		await queryClient.fetchQuery( options );
	}
	return options;
}

const createRouteTree = ( config: AppConfig ) => {
	const rootRoute = createRootRoute( {
		component: Root,
		notFoundComponent: NotFound,
	} );
	const children = [];

	const indexRoute = createRoute( {
		getParentRoute: () => rootRoute,
		path: '/',
		beforeLoad: () => {
			throw redirect( { to: config.mainRoute } );
		},
	} );
	children.push( indexRoute );

	if ( config.supports.overview ) {
		const overviewRoute = createRoute( {
			getParentRoute: () => rootRoute,
			path: 'overview',
			component: Overview,
		} );

		children.push( overviewRoute );
	}

	if ( config.supports.sites ) {
		const sitesRoute = createRoute( {
			getParentRoute: () => rootRoute,
			path: 'sites',
			component: Sites,
			loader: () =>
				maybeAwaitFetch( {
					queryKey: [ 'sites' ],
					queryFn: fetchSites,
				} ),
		} );

		const siteRoute = createRoute( {
			getParentRoute: () => rootRoute,
			path: 'sites/$siteId',
			component: SiteLayout,
			loader: ( { params: { siteId } } ) =>
				maybeAwaitFetch( {
					queryKey: [ 'site', siteId ],
					queryFn: () => fetchSiteWithRouteData( siteId ),
				} ),
			notFoundComponent: NotFound,
		} );

		const siteOverviewRoute = createRoute( {
			getParentRoute: () => siteRoute,
			path: '/',
			component: SiteOverview,
		} );

		const siteDeploymentsRoute = createRoute( {
			getParentRoute: () => siteRoute,
			path: 'deployments',
			component: SiteDeployments,
		} );

		children.push(
			sitesRoute,
			siteRoute.addChildren( [ siteOverviewRoute, siteDeploymentsRoute ] )
		);
	}

	if ( config.supports.domains ) {
		const domainsRoute = createRoute( {
			getParentRoute: () => rootRoute,
			path: 'domains',
			component: Domains,
			loader: () =>
				queryClient.ensureQueryData( {
					queryKey: [ 'domains' ],
					queryFn: fetchDomains,
				} ) as Promise< Domain[] >,
		} );

		children.push( domainsRoute );
	}

	if ( config.supports.emails ) {
		const emailsRoute = createRoute( {
			getParentRoute: () => rootRoute,
			path: 'emails',
			component: Emails,
			loader: () =>
				queryClient.ensureQueryData( {
					queryKey: [ 'emails' ],
					queryFn: fetchEmails,
				} ) as Promise< Email[] >,
		} );

		children.push( emailsRoute );
	}

	if ( config.supports.me ) {
		const meRoute = createRoute( {
			getParentRoute: () => rootRoute,
			path: 'me',
			component: Me,
			loader: () =>
				queryClient.ensureQueryData( {
					queryKey: [ 'profile' ],
					queryFn: fetchProfile,
				} ) as Promise< User >,
			notFoundComponent: NotFound,
			beforeLoad: ( { context }: { context: RouteContext } ) => {
				if ( context?.auth?.twoStep?.two_step_reauthorization_required ) {
					const currentPath = window.location.pathname;
					const loginUrl = `/reauth-required?redirect_to=${ encodeURIComponent( currentPath ) }`;
					window.location.href = loginUrl;
				}
			},
		} );

		const profileRoute = createRoute( {
			getParentRoute: () => meRoute,
			path: 'profile',
			component: Profile,
		} );

		const billingRoute = createRoute( {
			getParentRoute: () => meRoute,
			path: 'billing',
			component: Billing,
		} );

		const securityRoute = createRoute( {
			getParentRoute: () => meRoute,
			path: 'security',
			component: Security,
		} );

		const privacyRoute = createRoute( {
			getParentRoute: () => meRoute,
			path: 'privacy',
			component: Privacy,
		} );

		const notificationsRoute = createRoute( {
			getParentRoute: () => meRoute,
			path: 'notifications',
			component: Notifications,
		} );

		children.push(
			meRoute.addChildren( [
				profileRoute,
				billingRoute,
				securityRoute,
				privacyRoute,
				notificationsRoute,
			] )
		);
	}

	return rootRoute.addChildren( children );
};

export const getRouter = ( config: AppConfig ) => {
	return new Router( {
		routeTree: createRouteTree( config ),
		basepath: config.basePath,
		defaultErrorComponent: UnknownError,
	} );
};
