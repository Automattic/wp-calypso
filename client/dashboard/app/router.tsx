import {
	Router,
	createRoute,
	createRootRoute,
	redirect,
	createLazyRoute,
} from '@tanstack/react-router';
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
	loader: () => queryClient.ensureQueryData( sitesQuery() ),
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
} ).lazy( () =>
	import( '../sites/settings' ).then( ( d ) =>
		createLazyRoute( 'site-settings' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteSettingsSiteVisibilityRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/site-visibility',
	loader: ( { params: { siteSlug } } ) =>
		queryClient.ensureQueryData( siteSettingsQuery( siteSlug ) ),
} ).lazy( () =>
	import( '../sites/settings-site-visibility' ).then( ( d ) =>
		createLazyRoute( 'site-settings-site-visibility' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteSettingsSubscriptionGiftingRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/subscription-gifting',
	loader: ( { params: { siteSlug } } ) =>
		queryClient.ensureQueryData( siteSettingsQuery( siteSlug ) ),
} ).lazy( () =>
	import( '../sites/settings-subscription-gifting' ).then( ( d ) =>
		createLazyRoute( 'site-settings-subscription-gifting' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const domainsRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'domains',
	loader: () => queryClient.ensureQueryData( domainsQuery() ),
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
				siteSettingsSiteVisibilityRoute,
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
		// Calling document.startViewTransition() ourselves is really tricky,
		// Tanstack Router knows how to do it best. Even though it says
		// "default", we can still customize it in CSS and add more transition
		// areas.
		defaultViewTransition: true,
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
	siteSettingsSiteVisibilityRoute,
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
