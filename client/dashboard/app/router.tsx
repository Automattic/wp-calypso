import { Router, createRoute, createRootRoute, redirect } from '@tanstack/react-router';
import NotFound from '../404';
import UnknownError from '../500';
import {
	fetchProfile,
	fetchSites,
	fetchDomains,
	fetchEmails,
	fetchSite,
	fetchSiteMediaStorage,
	fetchSiteMonitorUptime,
	fetchPHPVersion,
	fetchCurrentPlan,
	fetchSitePrimaryDomain,
	fetchSiteEngagementStats,
} from '../data';
import Root from '../root';
import { queryClient } from './query-client';
import type { AppConfig } from './context';
import type { Domain, Email, Profile } from '../data/types';
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
		} ).lazy( () => import( '../agency-overview' ).then( ( d ) => d.Route ) );

		children.push( overviewRoute );
	}

	if ( config.supports.sites ) {
		const sitesRoute = createRoute( {
			getParentRoute: () => rootRoute,
			path: 'sites',
			loader: () =>
				maybeAwaitFetch( {
					queryKey: [ 'sites' ],
					queryFn: fetchSites,
				} ),
		} ).lazy( () => import( '../sites' ).then( ( d ) => d.Route ) );

		const siteRoute = createRoute( {
			getParentRoute: () => rootRoute,
			path: 'sites/$siteId',
			loader: ( { params: { siteId } } ) =>
				maybeAwaitFetch( {
					queryKey: [ 'site', siteId ],
					queryFn: async () => {
						const [
							site,
							mediaStorage,
							siteMonitorUptime,
							phpVersion,
							currentPlan,
							primaryDomain,
							engagementStats,
						] = await Promise.all( [
							fetchSite( siteId ),
							fetchSiteMediaStorage( siteId ),
							fetchSiteMonitorUptime( siteId ),
							fetchPHPVersion( siteId ),
							fetchCurrentPlan( siteId ),
							fetchSitePrimaryDomain( siteId ),
							fetchSiteEngagementStats( siteId ),
						] );
						return {
							site,
							mediaStorage,
							siteMonitorUptime,
							phpVersion,
							currentPlan,
							primaryDomain,
							engagementStats,
						};
					},
				} ),
			notFoundComponent: NotFound,
		} ).lazy( () => import( '../site' ).then( ( d ) => d.Route ) );

		const siteOverviewRoute = createRoute( {
			getParentRoute: () => siteRoute,
			path: '/',
		} ).lazy( () => import( '../site-overview' ).then( ( d ) => d.Route ) );

		const siteDeploymentsRoute = createRoute( {
			getParentRoute: () => siteRoute,
			path: 'deployments',
		} ).lazy( () => import( '../site-deployments' ).then( ( d ) => d.Route ) );

		children.push(
			sitesRoute,
			siteRoute.addChildren( [ siteOverviewRoute, siteDeploymentsRoute ] )
		);
	}

	if ( config.supports.domains ) {
		const domainsRoute = createRoute( {
			getParentRoute: () => rootRoute,
			path: 'domains',
			loader: () =>
				queryClient.ensureQueryData( {
					queryKey: [ 'domains' ],
					queryFn: fetchDomains,
				} ) as Promise< Domain[] >,
		} ).lazy( () => import( '../domains' ).then( ( d ) => d.Route ) );

		children.push( domainsRoute );
	}

	if ( config.supports.emails ) {
		const emailsRoute = createRoute( {
			getParentRoute: () => rootRoute,
			path: 'emails',
			loader: () =>
				queryClient.ensureQueryData( {
					queryKey: [ 'emails' ],
					queryFn: fetchEmails,
				} ) as Promise< Email[] >,
		} ).lazy( () => import( '../emails' ).then( ( d ) => d.Route ) );

		children.push( emailsRoute );
	}

	if ( config.supports.me ) {
		const meRoute = createRoute( {
			getParentRoute: () => rootRoute,
			path: 'me',
			loader: () =>
				queryClient.ensureQueryData( {
					queryKey: [ 'profile' ],
					queryFn: fetchProfile,
				} ) as Promise< Profile >,
			notFoundComponent: NotFound,
			beforeLoad: ( { context }: { context: RouteContext } ) => {
				console.log( { beforeLoadContetext: context } );
				if ( context?.auth?.twoStep?.two_step_reauthorization_required ) {
					const currentPath = window.location.pathname;
					const loginUrl = `/reauth-required?redirect_to=${ encodeURIComponent( currentPath ) }`;
					window.location.href = loginUrl;
				}
			},
		} ).lazy( () => import( '../me' ).then( ( d ) => d.Route ) );

		const profileRoute = createRoute( {
			getParentRoute: () => meRoute,
			path: 'profile',
		} ).lazy( () => import( '../profile' ).then( ( d ) => d.Route ) );

		const billingRoute = createRoute( {
			getParentRoute: () => meRoute,
			path: 'billing',
		} ).lazy( () => import( '../billing' ).then( ( d ) => d.Route ) );

		const securityRoute = createRoute( {
			getParentRoute: () => meRoute,
			path: 'security',
		} ).lazy( () => import( '../security' ).then( ( d ) => d.Route ) );

		const privacyRoute = createRoute( {
			getParentRoute: () => meRoute,
			path: 'privacy',
		} ).lazy( () => import( '../privacy' ).then( ( d ) => d.Route ) );

		const notificationsRoute = createRoute( {
			getParentRoute: () => meRoute,
			path: 'notifications',
		} ).lazy( () => import( '../notifications' ).then( ( d ) => d.Route ) );

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
