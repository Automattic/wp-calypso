import { Router, Route, RootRoute, redirect, ErrorComponent, Outlet } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import {
	updateProfile,
	fetchProfile,
	fetchSite,
	fetchSites,
	type ProfileObject,
	type SiteObject,
	type DomainObject,
	type EmailObject,
	fetchDomains,
	fetchEmails,
} from '../data';
import Domains from '../domains';
import Emails from '../emails';
import Header from '../header';
import Billing from '../me/billing';
import MeNotifications from '../me/notifications';
import Privacy from '../me/privacy';
import Security from '../me/security';
import Profile from '../profile';
import Reader from '../reader';
import Site from '../site';
import SiteDeployments from '../site-deployments';
import SiteOverview from '../site-overview';
import Sites from '../sites';
import NotFound from './404';
import { queryClient } from './query-client';

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
const indexRoute = new Route( {
	getParentRoute: () => rootRoute,
	path: '/',
	beforeLoad: () => {
		throw redirect( { to: '/sites' } );
	},
} );

const sitesRoute = new Route( {
	getParentRoute: () => rootRoute,
	path: 'sites',
	component: Sites,
	loader: () =>
		queryClient.ensureQueryData( {
			queryKey: [ 'sites' ],
			queryFn: fetchSites,
		} ) as Promise< SiteObject[] >,
} );

const siteRoute = new Route( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteId',
	component: Site,
	loader: ( { params: { siteId } } ) =>
		queryClient.ensureQueryData( {
			queryKey: [ 'site', siteId ],
			queryFn: () => fetchSite( siteId ),
		} ) as Promise< SiteObject >,
} );

const siteOverviewRoute = new Route( {
	getParentRoute: () => siteRoute,
	path: '/',
	component: SiteOverview,
} );

const siteDeploymentsRoute = new Route( {
	getParentRoute: () => siteRoute,
	path: 'deployments',
	component: SiteDeployments,
} );

const domainsRoute = new Route( {
	getParentRoute: () => rootRoute,
	path: 'domains',
	component: Domains,
	loader: () =>
		queryClient.ensureQueryData( {
			queryKey: [ 'domains' ],
			queryFn: fetchDomains,
		} ) as Promise< DomainObject[] >,
} );

const emailsRoute = new Route( {
	getParentRoute: () => rootRoute,
	path: 'emails',
	component: Emails,
	loader: () =>
		queryClient.ensureQueryData( {
			queryKey: [ 'emails' ],
			queryFn: fetchEmails,
		} ) as Promise< EmailObject >,
} );

const profileRoute = new Route( {
	getParentRoute: () => rootRoute,
	path: 'me/profile',
	component: Profile,
	loader: () =>
		queryClient.ensureQueryData( {
			queryKey: [ 'profile' ],
			queryFn: fetchProfile,
		} ) as Promise< ProfileObject >,
	actionHandler: async ( { request } ) => {
		const data = await request.json();
		try {
			await updateProfile( data as ProfileObject );
			return { ok: true };
		} catch ( error ) {
			throw new Error( __( 'Failed to update profile' ) );
		}
	},
} );

const billingRoute = new Route( {
	getParentRoute: () => rootRoute,
	path: 'me/billing',
	component: Billing,
} );

const securityRoute = new Route( {
	getParentRoute: () => rootRoute,
	path: 'me/security',
	component: Security,
} );

const privacyRoute = new Route( {
	getParentRoute: () => rootRoute,
	path: 'me/privacy',
	component: Privacy,
} );

const notificationsRoute = new Route( {
	getParentRoute: () => rootRoute,
	path: 'me/notifications',
	component: MeNotifications,
} );

const readerRoute = new Route( {
	getParentRoute: () => rootRoute,
	path: 'reader',
	component: Reader,
} );

const notFoundRoute = new Route( {
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
	profileRoute,
	billingRoute,
	securityRoute,
	privacyRoute,
	notificationsRoute,
	readerRoute,
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
