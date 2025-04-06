import {
	Router,
	createRoute,
	RootRoute,
	redirect,
	ErrorComponent,
	Outlet,
} from '@tanstack/react-router';
import NotFound from '../404';
import Billing from '../billing';
import {
	fetchProfile,
	fetchSite,
	fetchSites,
	fetchDomains,
	fetchEmails,
	FetchSiteRouteResponse,
} from '../data';
import Domains from '../domains';
import Emails from '../emails';
import Header from '../header';
import Me from '../me';
import Notifications from '../notifications';
import Privacy from '../privacy';
import Profile from '../profile';
import Security from '../security';
import SiteLayout from '../site';
import SiteDeployments from '../site-deployments';
import SiteOverview from '../site-overview';
import Sites from '../sites';
import { queryClient } from './query-client';
import type { Domain, Email, Site, User } from '../data/types';

function DashboardLayout() {
	return (
		<div className="dashboard__layout">
			<Header />
			<main className="dashboard__content">
				<Outlet />
			</main>
		</div>
	);
}

// Create the root route
const rootRoute = new RootRoute( {
	component: DashboardLayout,
} );

// Create the routes
const indexRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '/',
	beforeLoad: () => {
		throw redirect( { to: '/sites' } );
	},
} );

const sitesRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites',
	component: Sites,
	loader: () =>
		queryClient.ensureQueryData( {
			queryKey: [ 'sites' ],
			queryFn: fetchSites,
		} ) as Promise< Site[] >,
} );

const siteRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteId',
	component: SiteLayout,
	loader: ( { params: { siteId } } ) =>
		queryClient.ensureQueryData( {
			queryKey: [ 'site', siteId ],
			queryFn: () => fetchSite( siteId ),
		} ) as Promise< FetchSiteRouteResponse >,
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

const emailsRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'emails',
	component: Emails,
	loader: () =>
		queryClient.ensureQueryData( {
			queryKey: [ 'emails' ],
			queryFn: fetchEmails,
		} ) as Promise< Email >,
} );

const meRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'me',
	component: Me,
	loader: () =>
		queryClient.ensureQueryData( {
			queryKey: [ 'profile' ],
			queryFn: fetchProfile,
		} ) as Promise< User >,
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

const notFoundRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '*',
	component: NotFound,
} );

// Create the router
const routeTree = rootRoute.addChildren( [
	indexRoute,
	sitesRoute,
	siteRoute.addChildren( [ siteOverviewRoute, siteDeploymentsRoute ] ),
	domainsRoute,
	emailsRoute,
	meRoute.addChildren( [
		profileRoute,
		billingRoute,
		securityRoute,
		privacyRoute,
		notificationsRoute,
	] ),
	notFoundRoute,
] );

export const router = new Router( {
	routeTree,
	basepath: '/v2',
	defaultErrorComponent: ( { error } ) => <ErrorComponent error={ error as Error } />,
} );

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}
