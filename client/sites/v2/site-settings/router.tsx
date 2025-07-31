import { Router, createLazyRoute, createRoute } from '@tanstack/react-router';
import * as appRouter from 'calypso/dashboard/app/router';
import { rootRoute, dashboardSitesCompatibilityRoute, siteRoute } from '../router';
import { getRouterOptions, createBrowserHistoryAndMemoryRouterSync } from '../utils/router';

const settingsRoute = createRoute( {
	...appRouter.siteSettingsRoute.options,
	getParentRoute: () => siteRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings' ).then( ( d ) =>
		createLazyRoute( 'settings' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteVisibilityRoute = createRoute( {
	...appRouter.siteSettingsSiteVisibilityRoute.options,
	getParentRoute: () => siteRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-site-visibility' ).then( ( d ) =>
		createLazyRoute( 'site-visibility' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const subscriptionGiftingRoute = createRoute( {
	...appRouter.siteSettingsSubscriptionGiftingRoute.options,
	getParentRoute: () => siteRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-subscription-gifting' ).then( ( d ) =>
		createLazyRoute( 'subscription-gifting' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const wordpressRoute = createRoute( {
	...appRouter.siteSettingsWordPressRoute.options,
	getParentRoute: () => siteRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-wordpress' ).then( ( d ) =>
		createLazyRoute( 'wordpress' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const phpRoute = createRoute( {
	...appRouter.siteSettingsPHPRoute.options,
	getParentRoute: () => siteRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-php' ).then( ( d ) =>
		createLazyRoute( 'php' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const databaseRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/database', // Bypass type issue by hard-coding the path instead of reusing the route.
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-database' ).then( ( d ) =>
		createLazyRoute( 'database' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencyRoute = createRoute( {
	...appRouter.siteSettingsAgencyRoute.options,
	getParentRoute: () => siteRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-agency' ).then( ( d ) =>
		createLazyRoute( 'agency' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const hundredYearPlanRoute = createRoute( {
	...appRouter.siteSettingsHundredYearPlanRoute.options,
	getParentRoute: () => siteRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-hundred-year-plan' ).then( ( d ) =>
		createLazyRoute( 'hundred-year-plan' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const primaryDataCenterRoute = createRoute( {
	...appRouter.siteSettingsPrimaryDataCenterRoute.options,
	getParentRoute: () => siteRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-primary-data-center' ).then( ( d ) =>
		createLazyRoute( 'primary-data-center' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const staticFile404Route = createRoute( {
	...appRouter.siteSettingsStaticFile404Route.options,
	getParentRoute: () => siteRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-static-file-404' ).then( ( d ) =>
		createLazyRoute( 'static-file-404' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const cachingRoute = createRoute( {
	...appRouter.siteSettingsCachingRoute.options,
	getParentRoute: () => siteRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-caching' ).then( ( d ) =>
		createLazyRoute( 'caching' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const defensiveModeRoute = createRoute( {
	...appRouter.siteSettingsDefensiveModeRoute.options,
	getParentRoute: () => siteRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-defensive-mode' ).then( ( d ) =>
		createLazyRoute( 'defensive-mode' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const sftpSshRoute = createRoute( {
	...appRouter.siteSettingsSftpSshRoute.options,
	getParentRoute: () => siteRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-sftp-ssh' ).then( ( d ) =>
		createLazyRoute( 'sftp-ssh' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const transferSiteRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/transfer-site', // Bypass type issue by hard-coding the path instead of reusing the route.
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-transfer-site' ).then( ( d ) =>
		createLazyRoute( 'transfer-site' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const webApplicationFirewallRoute = createRoute( {
	...appRouter.siteSettingsWebApplicationFirewallRoute.options,
	getParentRoute: () => siteRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-web-application-firewall' ).then( ( d ) =>
		createLazyRoute( 'web-application-firewall' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const createRouteTree = () =>
	rootRoute.addChildren( [
		siteRoute.addChildren( [
			settingsRoute,
			siteVisibilityRoute,
			subscriptionGiftingRoute,
			wordpressRoute,
			phpRoute,
			databaseRoute,
			agencyRoute,
			hundredYearPlanRoute,
			primaryDataCenterRoute,
			staticFile404Route,
			cachingRoute,
			defensiveModeRoute,
			transferSiteRoute,
			sftpSshRoute,
			webApplicationFirewallRoute,
		] ),
		dashboardSitesCompatibilityRoute,
	] );

export const { syncBrowserHistoryToRouter, syncMemoryRouterToBrowserHistory } =
	createBrowserHistoryAndMemoryRouterSync();

export const getRouter = ( { basePath }: { basePath: string } ) => {
	const routeTree = createRouteTree();
	const router = new Router( {
		...getRouterOptions(),
		routeTree,
		basepath: basePath,
	} );

	return router;
};

export const routerConfig = {
	basePath: '/',
};

export default getRouter( routerConfig );
