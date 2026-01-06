import calypsoConfig from '@automattic/calypso-config';
import { Router, createLazyRoute, createRoute } from '@tanstack/react-router';
import { APP_CONTEXT_DEFAULT_CONFIG } from 'calypso/dashboard/app/context';
import { handleOnCatch } from 'calypso/dashboard/app/logger';
import * as appRouterSites from 'calypso/dashboard/app/router/sites';
import { rootRoute, dashboardSitesCompatibilityRoute, siteRoute } from '../router';
import { getRouterOptions, createBrowserHistoryAndMemoryRouterSync } from '../utils/router';
import type { AppConfig } from 'calypso/dashboard/app/context';
import type { ErrorInfo } from 'react';

const settingsRoute = createRoute( {
	...appRouterSites.siteSettingsRoute.options,
	getParentRoute: () => siteRoute,
} );

const settingsIndexRoute = createRoute( {
	getParentRoute: () => settingsRoute,
	path: '/',
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings' ).then( ( d ) =>
		createLazyRoute( 'settings' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteVisibilityRoute = createRoute( {
	...appRouterSites.siteSettingsSiteVisibilityRoute.options,
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-site-visibility' ).then( ( d ) =>
		createLazyRoute( 'site-visibility' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const subscriptionGiftingRoute = createRoute( {
	...appRouterSites.siteSettingsSubscriptionGiftingRoute.options,
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-subscription-gifting' ).then( ( d ) =>
		createLazyRoute( 'subscription-gifting' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const holidaySnowRoute = createRoute( {
	...appRouterSites.siteSettingsHolidaySnowRoute.options,
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-holiday-snow' ).then( ( d ) =>
		createLazyRoute( 'holiday-snow' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const wordpressRoute = createRoute( {
	...appRouterSites.siteSettingsWordPressRoute.options,
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-wordpress' ).then( ( d ) =>
		createLazyRoute( 'wordpress' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const phpRoute = createRoute( {
	...appRouterSites.siteSettingsPHPRoute.options,
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-php' ).then( ( d ) =>
		createLazyRoute( 'php' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const databaseRoute = createRoute( {
	// Bypass type issue by omitting the loader.
	...Object.assign( appRouterSites.siteSettingsDatabaseRoute.options, { loader: undefined } ),
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-database' ).then( ( d ) =>
		createLazyRoute( 'database' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencyRoute = createRoute( {
	...appRouterSites.siteSettingsAgencyRoute.options,
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-agency' ).then( ( d ) =>
		createLazyRoute( 'agency' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const hundredYearPlanRoute = createRoute( {
	...appRouterSites.siteSettingsHundredYearPlanRoute.options,
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-hundred-year-plan' ).then( ( d ) =>
		createLazyRoute( 'hundred-year-plan' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const primaryDataCenterRoute = createRoute( {
	...appRouterSites.siteSettingsPrimaryDataCenterRoute.options,
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-primary-data-center' ).then( ( d ) =>
		createLazyRoute( 'primary-data-center' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const staticFile404Route = createRoute( {
	...appRouterSites.siteSettingsStaticFile404Route.options,
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-static-file-404' ).then( ( d ) =>
		createLazyRoute( 'static-file-404' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const cachingRoute = createRoute( {
	...appRouterSites.siteSettingsCachingRoute.options,
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-caching' ).then( ( d ) =>
		createLazyRoute( 'caching' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const defensiveModeRoute = createRoute( {
	...appRouterSites.siteSettingsDefensiveModeRoute.options,
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-defensive-mode' ).then( ( d ) =>
		createLazyRoute( 'defensive-mode' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const sftpSshRoute = createRoute( {
	...appRouterSites.siteSettingsSftpSshRoute.options,
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-sftp-ssh' ).then( ( d ) =>
		createLazyRoute( 'sftp-ssh' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const transferSiteRoute = createRoute( {
	// Bypass type issue by omitting the loader.
	...Object.assign( appRouterSites.siteSettingsTransferSiteRoute.options, { loader: undefined } ),
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-transfer-site' ).then( ( d ) =>
		createLazyRoute( 'transfer-site' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const webApplicationFirewallRoute = createRoute( {
	...appRouterSites.siteSettingsWebApplicationFirewallRoute.options,
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-web-application-firewall' ).then( ( d ) =>
		createLazyRoute( 'web-application-firewall' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const wpcomLoginRoute = createRoute( {
	...appRouterSites.siteSettingsWpcomLoginRoute.options,
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-wpcom-login' ).then( ( d ) =>
		createLazyRoute( 'wpcom-login' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const experimentalRoute = createRoute( {
	...appRouterSites.siteSettingsExperimentalRoute.options,
	getParentRoute: () => settingsRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-ai-assistant' ).then( ( d ) =>
		createLazyRoute( 'ai-assistant' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const createRouteTree = () =>
	rootRoute.addChildren( [
		siteRoute.addChildren( [
			settingsRoute.addChildren( [
				settingsIndexRoute,
				siteVisibilityRoute,
				subscriptionGiftingRoute,
				holidaySnowRoute,
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
				wpcomLoginRoute,
				experimentalRoute,
			] ),
		] ),
		dashboardSitesCompatibilityRoute,
	] );

export const { syncBrowserHistoryToRouter, syncMemoryRouterToBrowserHistory } =
	createBrowserHistoryAndMemoryRouterSync();

export const getRouter = ( config: AppConfig ) => {
	const routeTree = createRouteTree();
	const router = new Router( {
		...getRouterOptions( config ),
		routeTree,
		defaultOnCatch: ( error: Error, errorInfo: ErrorInfo ) => {
			handleOnCatch( error, errorInfo, router, {
				severity: calypsoConfig( 'env_id' ) === 'production' ? 'error' : 'debug',
				dashboard_backport: true,
			} );
		},
	} );

	return router;
};

export const routerConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	basePath: '/',
};

export default getRouter( routerConfig );
