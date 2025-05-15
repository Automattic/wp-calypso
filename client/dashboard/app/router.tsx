import {
	Router,
	createRoute,
	createRootRoute,
	redirect,
	createLazyRoute,
} from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { fetchTwoStep } from '../data';
import NotFound from './404';
import UnknownError from './500';
import {
	sitesQuery,
	siteQuery,
	siteSettingsQuery,
	domainsQuery,
	emailsQuery,
	profileQuery,
} from './queries';
import { queryClient } from './query-client';
import Root from './root';
import type { AppConfig } from './context';

interface RouteContext {
	config?: AppConfig;
}

const rootRoute = createRootRoute( {
	component: Root,
	staticData: {
		label: () => __( 'Root' ),
	},
} );

const indexRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '/',
	staticData: {
		label: () => __( 'Home' ),
	},
	beforeLoad: ( { context }: { context: RouteContext } ) => {
		if ( context.config ) {
			throw redirect( { to: context.config.mainRoute } );
		}
	},
} );

const overviewRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'overview',
	staticData: {
		label: () => __( 'Overview' ),
	},
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
	loader: () => queryClient.ensureQueryData( sitesQuery() ),
	staticData: {
		label: () => __( 'Sites' ),
	},
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
	loader: ( { params: { siteSlug } } ) => queryClient.ensureQueryData( siteQuery( siteSlug ) ),
	staticData: {
		label: () => __( 'Site' ),
	},
} ).lazy( () =>
	import( '../sites/site' ).then( ( d ) =>
		createLazyRoute( 'site' )( {
			component: d.default,
		} )
	)
);

const siteOverviewRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: '/',
	staticData: {
		label: () => __( 'Overview' ),
	},
} ).lazy( () =>
	import( '../sites/overview' ).then( ( d ) =>
		createLazyRoute( 'site-overview' )( {
			component: d.default,
		} )
	)
);

const siteDeploymentsRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'deployments',
	staticData: {
		label: () => __( 'Deployments' ),
	},
} ).lazy( () =>
	import( '../sites/deployments' ).then( ( d ) =>
		createLazyRoute( 'site-deployments' )( {
			component: d.default,
		} )
	)
);

const sitePerformanceRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'performance',
	staticData: {
		label: () => __( 'Performance' ),
	},
} ).lazy( () =>
	import( '../sites/performance' ).then( ( d ) =>
		createLazyRoute( 'site-performance' )( {
			component: d.default,
		} )
	)
);

const siteSettingsRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings',
	loader: ( { params: { siteSlug } } ) =>
		queryClient.ensureQueryData( siteSettingsQuery( siteSlug ) ),
	staticData: {
		label: () => __( 'Settings' ),
	},
} ).lazy( () =>
	import( '../sites/settings' ).then( ( d ) =>
		createLazyRoute( 'site-settings' )( {
			component: d.default,
		} )
	)
);

const siteSettingsSubscriptionGiftingRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/subscription-gifting',
	loader: ( { params: { siteSlug } } ) =>
		queryClient.ensureQueryData( siteSettingsQuery( siteSlug ) ),
	staticData: {
		label: () => __( 'Subscription gifting' ),
	},
} ).lazy( () =>
	import( '../sites/settings-subscription-gifting' ).then( ( d ) =>
		createLazyRoute( 'site-settings-subscription-gifting' )( {
			component: d.default,
		} )
	)
);

const domainsRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'domains',
	loader: () => queryClient.ensureQueryData( domainsQuery() ),
	staticData: {
		label: () => __( 'Domains' ),
	},
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
	loader: () => queryClient.ensureQueryData( emailsQuery() ),
	staticData: {
		label: () => __( 'Emails' ),
	},
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
	staticData: {
		label: () => __( 'Account' ),
	},
	loader: () => queryClient.ensureQueryData( profileQuery() ),
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
	staticData: {
		label: () => __( 'Profile' ),
	},
} ).lazy( () =>
	import( '../me/profile' ).then( ( d ) =>
		createLazyRoute( 'profile' )( {
			component: d.default,
		} )
	)
);

const billingRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'billing',
	staticData: {
		label: () => __( 'Billing' ),
	},
} ).lazy( () =>
	import( '../me/billing' ).then( ( d ) =>
		createLazyRoute( 'billing' )( {
			component: d.default,
		} )
	)
);

const billingHistoryRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'billing/billing-history',
	staticData: {
		label: () => __( 'Billing history' ),
	},
} ).lazy( () =>
	import( '../me/billing-history' ).then( ( d ) =>
		createLazyRoute( 'billing-history' )( {
			component: d.default,
		} )
	)
);

const activeSubscriptionsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'billing/active-subscriptions',
	staticData: {
		label: () => __( 'Active subscriptions' ),
	},
} ).lazy( () =>
	import( '../me/active-subscriptions' ).then( ( d ) =>
		createLazyRoute( 'active-subscriptions' )( {
			component: d.default,
		} )
	)
);

const paymentMethodsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'billing/payment-methods',
	staticData: {
		label: () => __( 'Payment methods' ),
	},
} ).lazy( () =>
	import( '../me/payment-methods' ).then( ( d ) =>
		createLazyRoute( 'payment-methods' )( {
			component: d.default,
		} )
	)
);

const taxDetailsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'billing/tax-details',
	staticData: {
		label: () => __( 'Tax details' ),
	},
} ).lazy( () =>
	import( '../me/tax-details' ).then( ( d ) =>
		createLazyRoute( 'tax-details' )( {
			component: d.default,
		} )
	)
);

const securityRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'security',
	staticData: {
		label: () => __( 'Security' ),
	},
} ).lazy( () =>
	import( '../me/security' ).then( ( d ) =>
		createLazyRoute( 'security' )( {
			component: d.default,
		} )
	)
);

const privacyRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'privacy',
	staticData: {
		label: () => __( 'Privacy' ),
	},
} ).lazy( () =>
	import( '../me/privacy' ).then( ( d ) =>
		createLazyRoute( 'privacy' )( {
			component: d.default,
		} )
	)
);

const notificationsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'notifications',
	staticData: {
		label: () => __( 'Notifications' ),
	},
} ).lazy( () =>
	import( '../me/notifications' ).then( ( d ) =>
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
				siteSettingsSubscriptionGiftingRoute,
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
		defaultPreload: 'intent',
		defaultPreloadStaleTime: 0,
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
	siteSettingsSubscriptionGiftingRoute,
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
