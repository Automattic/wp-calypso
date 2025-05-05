import {
	Router,
	createRoute,
	createRootRoute,
	redirect,
	createLazyRoute,
} from '@tanstack/react-router';
import NotFound from '../404';
import UnknownError from '../500';
import { fetchTwoStep } from '../data';
import Root from '../root';
import { sitesQuery, siteQuery, domainsQuery, emailsQuery, profileQuery } from './queries';
import { queryClient } from './query-client';
import type { AppConfig } from './context';
import type { FetchQueryOptions } from '@tanstack/react-query';

interface RouteContext {
	config?: AppConfig;
}

async function maybeAwaitFetch( options: FetchQueryOptions ) {
	const cachedData = queryClient.getQueryData( options.queryKey );
	if ( ! cachedData ) {
		await queryClient.fetchQuery( options );
	}
}

const rootRoute = createRootRoute( { component: Root } );

const indexRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '/',
	beforeLoad: ( { context }: { context: RouteContext } ) => {
		if ( context.config ) {
			throw redirect( { to: context.config.mainRoute } );
		}
	},
} );

const overviewRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'overview',
} ).lazy( () =>
	import( '../agency-overview' ).then( ( d ) =>
		createLazyRoute( 'agency-overview' )( {
			component: d.default,
		} )
	)
);

const sitesRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites',
	loader: () => maybeAwaitFetch( sitesQuery() ),
} ).lazy( () =>
	import( '../sites' ).then( ( d ) =>
		createLazyRoute( 'sites' )( {
			component: d.default,
		} )
	)
);

const siteRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug',
	loader: ( { params: { siteSlug } } ) => maybeAwaitFetch( siteQuery( siteSlug ) ),
} ).lazy( () =>
	import( '../site' ).then( ( d ) =>
		createLazyRoute( 'site' )( {
			component: d.default,
		} )
	)
);

const siteOverviewRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: '/',
} ).lazy( () =>
	import( '../site-overview' ).then( ( d ) =>
		createLazyRoute( 'site-overview' )( {
			component: d.default,
		} )
	)
);

const siteDeploymentsRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'deployments',
} ).lazy( () =>
	import( '../site-deployments' ).then( ( d ) =>
		createLazyRoute( 'site-deployments' )( {
			component: d.default,
		} )
	)
);

const sitePerformanceRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'performance',
} ).lazy( () =>
	import( '../site-performance' ).then( ( d ) =>
		createLazyRoute( 'site-performance' )( {
			component: d.default,
		} )
	)
);

const siteSettingsRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings',
} ).lazy( () =>
	import( '../site-settings' ).then( ( d ) =>
		createLazyRoute( 'site-settings' )( {
			component: d.default,
		} )
	)
);

const domainsRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'domains',
	loader: () => maybeAwaitFetch( domainsQuery() ),
} ).lazy( () =>
	import( '../domains' ).then( ( d ) =>
		createLazyRoute( 'domains' )( {
			component: d.default,
		} )
	)
);

const emailsRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'emails',
	loader: () => maybeAwaitFetch( emailsQuery() ),
} ).lazy( () =>
	import( '../emails' ).then( ( d ) =>
		createLazyRoute( 'emails' )( {
			component: d.default,
		} )
	)
);

const meRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'me',
	loader: () => maybeAwaitFetch( profileQuery() ),
	beforeLoad: async ( { cause } ) => {
		if ( cause !== 'enter' ) {
			return;
		}
		const twoStep = await fetchTwoStep();
		if ( twoStep.two_step_reauthorization_required ) {
			const currentPath = window.location.pathname;
			const loginUrl = `/reauth-required?redirect_to=${ encodeURIComponent( currentPath ) }`;
			window.location.href = loginUrl;
		}
	},
} ).lazy( () =>
	import( '../me' ).then( ( d ) =>
		createLazyRoute( 'me' )( {
			component: d.default,
		} )
	)
);

const profileRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'profile',
} ).lazy( () =>
	import( '../profile' ).then( ( d ) =>
		createLazyRoute( 'profile' )( {
			component: d.default,
		} )
	)
);

const billingRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'billing',
} ).lazy( () =>
	import( '../billing' ).then( ( d ) =>
		createLazyRoute( 'billing' )( {
			component: d.default,
		} )
	)
);

const billingHistoryRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'billing/billing-history',
} ).lazy( () =>
	import( '../billing-history' ).then( ( d ) =>
		createLazyRoute( 'billing-history' )( {
			component: d.default,
		} )
	)
);

const activeSubscriptionsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'billing/active-subscriptions',
} ).lazy( () =>
	import( '../active-subscriptions' ).then( ( d ) =>
		createLazyRoute( 'active-subscriptions' )( {
			component: d.default,
		} )
	)
);

const paymentMethodsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'billing/payment-methods',
} ).lazy( () =>
	import( '../payment-methods' ).then( ( d ) =>
		createLazyRoute( 'payment-methods' )( {
			component: d.default,
		} )
	)
);

const taxDetailsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'billing/tax-details',
} ).lazy( () =>
	import( '../tax-details' ).then( ( d ) =>
		createLazyRoute( 'tax-details' )( {
			component: d.default,
		} )
	)
);

const securityRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'security',
} ).lazy( () =>
	import( '../security' ).then( ( d ) =>
		createLazyRoute( 'security' )( {
			component: d.default,
		} )
	)
);

const privacyRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'privacy',
} ).lazy( () =>
	import( '../privacy' ).then( ( d ) =>
		createLazyRoute( 'privacy' )( {
			component: d.default,
		} )
	)
);

const notificationsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'notifications',
} ).lazy( () =>
	import( '../notifications' ).then( ( d ) =>
		createLazyRoute( 'notifications' )( {
			component: d.default,
		} )
	)
);

const createRouteTree = ( config: AppConfig ) => {
	const children = [];

	children.push( indexRoute );

	if ( config.supports.overview ) {
		children.push( overviewRoute );
	}

	if ( config.supports.sites ) {
		children.push(
			sitesRoute,
			siteRoute.addChildren( [
				siteOverviewRoute,
				siteDeploymentsRoute,
				sitePerformanceRoute,
				siteSettingsRoute,
			] )
		);
	}

	if ( config.supports.domains ) {
		children.push( domainsRoute );
	}

	if ( config.supports.emails ) {
		children.push( emailsRoute );
	}

	if ( config.supports.me ) {
		children.push(
			meRoute.addChildren( [
				profileRoute,
				billingRoute,
				billingHistoryRoute,
				activeSubscriptionsRoute,
				paymentMethodsRoute,
				taxDetailsRoute,
				securityRoute,
				privacyRoute,
				notificationsRoute,
			] )
		);
	}

	return rootRoute.addChildren( children );
};

export const getRouter = ( config: AppConfig ) => {
	const routeTree = createRouteTree( config );
	return new Router( {
		routeTree,
		basepath: config.basePath,
		defaultErrorComponent: UnknownError,
		defaultNotFoundComponent: NotFound,
	} );
};

export {
	rootRoute,
	indexRoute,
	overviewRoute,
	sitesRoute,
	siteRoute,
	siteOverviewRoute,
	siteDeploymentsRoute,
	sitePerformanceRoute,
	siteSettingsRoute,
	domainsRoute,
	emailsRoute,
	meRoute,
	profileRoute,
	billingRoute,
	billingHistoryRoute,
	activeSubscriptionsRoute,
	paymentMethodsRoute,
	taxDetailsRoute,
	securityRoute,
	privacyRoute,
	notificationsRoute,
};
