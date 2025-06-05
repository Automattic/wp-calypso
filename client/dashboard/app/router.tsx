import {
	Router,
	createRoute,
	createRootRoute,
	redirect,
	createLazyRoute,
} from '@tanstack/react-router';
import { fetchTwoStep } from '../data';
import {
	canUpdatePHPVersion,
	canUpdateDefensiveMode,
	canUpdateHundredYearPlanFeatures,
	canUpdateWordPressVersion,
	canGetPrimaryDataCenter,
	canSetStaticFile404Handling,
	canUpdateCaching,
} from '../utils/site-features';
import NotFound from './404';
import UnknownError from './500';
import {
	sitesQuery,
	siteQuery,
	siteSettingsQuery,
	domainsQuery,
	emailsQuery,
	profileQuery,
	siteCurrentPlanQuery,
	siteEngagementStatsQuery,
	siteStaticFile404Query,
	siteWordPressVersionQuery,
	sitePHPVersionQuery,
	sitePrimaryDataCenterQuery,
	siteEdgeCacheStatusQuery,
	siteDefensiveModeQuery,
	agencyBlogQuery,
} from './queries';
import { queryClient } from './query-client';
import Root from './root';
import type { AppConfig } from './context';

declare module '@tanstack/react-router' {
	interface StaticDataRouteOption {
		// An untranslated title recorded in analytics.
		analytics_title: string;
	}
}

interface RouteContext {
	config?: AppConfig;
}

const rootRoute = createRootRoute( { component: Root, staticData: { analytics_title: '' } } );

const indexRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '/',
	staticData: { analytics_title: '' },
	beforeLoad: ( { context }: { context: RouteContext } ) => {
		if ( context.config ) {
			throw redirect( { to: context.config.mainRoute } );
		}
	},
} );

const overviewRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'overview',
	staticData: { analytics_title: 'Agency Overview' },
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
	staticData: { analytics_title: 'Sites' },
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
	staticData: { analytics_title: 'Site' },
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
	staticData: { analytics_title: 'Site > Overview' },
	loader: ( { params: { siteSlug }, preload } ) =>
		Promise.all( [
			// The current plan is nice to have preloaded, but not blocking for
			// navigation.
			preload ? queryClient.ensureQueryData( siteCurrentPlanQuery( siteSlug ) ) : undefined,
			queryClient.ensureQueryData( siteEngagementStatsQuery( siteSlug ) ),
		] ),
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
	staticData: { analytics_title: 'Site > Deployments' },
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
	staticData: { analytics_title: 'Site > Performance' },
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
	staticData: { analytics_title: 'Site > Settings' },
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
	staticData: { analytics_title: 'Site > Settings > Site visibility' },
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
	staticData: { analytics_title: 'Site > Settings > Subscription gifting' },
	loader: ( { params: { siteSlug } } ) =>
		queryClient.ensureQueryData( siteSettingsQuery( siteSlug ) ),
} ).lazy( () =>
	import( '../sites/settings-subscription-gifting' ).then( ( d ) =>
		createLazyRoute( 'site-settings-subscription-gifting' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteSettingsWordPressRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/wordpress',
	staticData: { analytics_title: 'Site > Settings > WordPress' },
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( canUpdateWordPressVersion( site ) ) {
			await queryClient.ensureQueryData( siteWordPressVersionQuery( siteSlug ) );
		}
	},
} ).lazy( () =>
	import( '../sites/settings-wordpress' ).then( ( d ) =>
		createLazyRoute( 'site-settings-wordpress' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteSettingsPHPRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/php',
	staticData: { analytics_title: 'Site > Settings > PHP' },
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( canUpdatePHPVersion( site ) ) {
			await queryClient.ensureQueryData( sitePHPVersionQuery( siteSlug ) );
		}
	},
} ).lazy( () =>
	import( '../sites/settings-php' ).then( ( d ) =>
		createLazyRoute( 'site-settings-php' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteSettingsDatabaseRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/database',
	staticData: { analytics_title: 'Site > Settings > Database' },
} ).lazy( () =>
	import( '../sites/settings-database' ).then( ( d ) =>
		createLazyRoute( 'site-settings-database' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteSettingsAgencyRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/agency',
	staticData: { analytics_title: 'Site > Settings > PHP' },
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( site.is_wpcom_atomic ) {
			await queryClient.ensureQueryData( agencyBlogQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../sites/settings-agency' ).then( ( d ) =>
		createLazyRoute( 'site-settings-agency' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteSettingsHundredYearPlanRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/hundred-year-plan',
	staticData: { analytics_title: 'Site > Settings > Hundred year plan' },
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( canUpdateHundredYearPlanFeatures( site ) ) {
			await queryClient.ensureQueryData( siteSettingsQuery( siteSlug ) );
		}
	},
} ).lazy( () =>
	import( '../sites/settings-hundred-year-plan' ).then( ( d ) =>
		createLazyRoute( 'site-settings-hundred-year-plan' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteSettingsPrimaryDataCenterRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/primary-data-center',
	staticData: { analytics_title: 'Site > Settings > Primary data center' },
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( canGetPrimaryDataCenter( site ) ) {
			await queryClient.ensureQueryData( sitePrimaryDataCenterQuery( siteSlug ) );
		}
	},
} ).lazy( () =>
	import( '../sites/settings-primary-data-center' ).then( ( d ) =>
		createLazyRoute( 'site-settings-primary-data-center' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteSettingsStaticFile404Route = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/static-file-404',
	staticData: { analytics_title: 'Site > Settings > Static file 404' },
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( canSetStaticFile404Handling( site ) ) {
			await queryClient.ensureQueryData( siteStaticFile404Query( siteSlug ) );
		}
	},
} ).lazy( () =>
	import( '../sites/settings-static-file-404' ).then( ( d ) =>
		createLazyRoute( 'site-settings-static-file-404' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteSettingsCachingRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/caching',
	staticData: { analytics_title: 'Site > Settings > Caching' },
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( canUpdateCaching( site ) ) {
			await queryClient.ensureQueryData( siteEdgeCacheStatusQuery( siteSlug ) );
		}
	},
} ).lazy( () =>
	import( '../sites/settings-caching' ).then( ( d ) =>
		createLazyRoute( 'site-settings-caching' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteSettingsDefensiveModeRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/defensive-mode',
	staticData: { analytics_title: 'Site > Settings > Defensive mode' },
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( canUpdateDefensiveMode( site ) ) {
			await queryClient.ensureQueryData( siteDefensiveModeQuery( siteSlug ) );
		}
	},
} ).lazy( () =>
	import( '../sites/settings-defensive-mode' ).then( ( d ) =>
		createLazyRoute( 'site-settings-defensive-mode' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteSettingsTransferSiteRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/transfer-site',
	staticData: { analytics_title: 'Site > Settings > Transfer site' },
} ).lazy( () =>
	import( '../sites/settings-transfer-site' ).then( ( d ) =>
		createLazyRoute( 'site-settings-transfer-site' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const domainsRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'domains',
	staticData: { analytics_title: 'Domains' },
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
	staticData: { analytics_title: 'Emails' },
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
	staticData: { analytics_title: 'Me' },
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
	staticData: { analytics_title: 'Me > Profile' },
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
	staticData: { analytics_title: 'Me > Billing' },
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
	staticData: { analytics_title: 'Me > Billing > Billing history' },
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
	staticData: { analytics_title: 'Me > Billing > Active subscriptions' },
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
	staticData: { analytics_title: 'Me > Billing > Payment methods' },
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
	staticData: { analytics_title: 'Me > Billing > Tax details' },
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
	staticData: { analytics_title: 'Me > Security' },
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
	staticData: { analytics_title: 'Me > Privacy' },
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
	staticData: { analytics_title: 'Me > Notifications' },
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
				siteSettingsDatabaseRoute,
				siteSettingsWordPressRoute,
				siteSettingsPHPRoute,
				siteSettingsAgencyRoute,
				siteSettingsHundredYearPlanRoute,
				siteSettingsPrimaryDataCenterRoute,
				siteSettingsStaticFile404Route,
				siteSettingsCachingRoute,
				siteSettingsDefensiveModeRoute,
				siteSettingsTransferSiteRoute,
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
