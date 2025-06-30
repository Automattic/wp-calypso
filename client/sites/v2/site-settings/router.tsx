import page from '@automattic/calypso-router';
import {
	Outlet,
	Router,
	createLazyRoute,
	createRootRoute,
	createRoute,
	redirect,
} from '@tanstack/react-router';
import { siteBySlugQuery } from 'calypso/dashboard/app/queries/site';
import { siteAgencyBlogQuery } from 'calypso/dashboard/app/queries/site-agency';
import { siteEdgeCacheStatusQuery } from 'calypso/dashboard/app/queries/site-cache';
import { siteDefensiveModeSettingsQuery } from 'calypso/dashboard/app/queries/site-defensive-mode';
import { sitePHPVersionQuery } from 'calypso/dashboard/app/queries/site-php-version';
import { sitePrimaryDataCenterQuery } from 'calypso/dashboard/app/queries/site-primary-data-center';
import { siteSettingsQuery } from 'calypso/dashboard/app/queries/site-settings';
import { siteSftpUsersQuery } from 'calypso/dashboard/app/queries/site-sftp';
import { siteSshAccessStatusQuery } from 'calypso/dashboard/app/queries/site-ssh';
import { siteStaticFile404SettingQuery } from 'calypso/dashboard/app/queries/site-static-file-404';
import { siteWordPressVersionQuery } from 'calypso/dashboard/app/queries/site-wordpress-version';
import { queryClient } from 'calypso/dashboard/app/query-client';
import {
	canManageSite,
	canViewWordPressSettings,
	canViewPHPSettings,
	canViewDefensiveModeSettings,
	canViewPrimaryDataCenterSettings,
	canViewStaticFile404Settings,
	canViewHundredYearPlanSettings,
	canViewCachingSettings,
	canViewSshSettings,
	canViewSftpSettings,
} from 'calypso/dashboard/sites/features';
import Root from '../components/root';
import { getRouterOptions, createBrowserHistoryAndMemoryRouterSync } from '../utils/router';

const rootRoute = createRootRoute( { component: Root } );

const dashboardSitesCompatibilityRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites',
	beforeLoad: ( { cause } ) => {
		if ( cause !== 'enter' ) {
			return;
		}
		page.show( '/sites' );
	},
} );

const dashboardSiteSettingsCompatibilityRouteRoot = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug/settings',
	loader: ( { params: { siteSlug } } ) => {
		throw redirect( { to: `/${ siteSlug }` } );
	},
} );

const dashboardSiteSettingsCompatibilityRouteWithFeature = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug/settings/$feature',
	loader: ( { params: { siteSlug, feature } } ) => {
		throw redirect( { to: `/${ siteSlug }/${ feature }` } );
	},
} );

const siteRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '$siteSlug',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( ! canManageSite( site ) ) {
			page.redirect( '/sites' );
		}
		queryClient.ensureQueryData( siteSettingsQuery( site.ID ) );
	},
	component: () => <Outlet />,
} );

const settingsRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: '/',
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings' ).then( ( d ) =>
		createLazyRoute( 'settings' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteVisibilityRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'site-visibility',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		queryClient.ensureQueryData( siteSettingsQuery( site.ID ) );
	},
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-site-visibility' ).then( ( d ) =>
		createLazyRoute( 'site-visibility' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const subscriptionGiftingRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'subscription-gifting',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		queryClient.ensureQueryData( siteSettingsQuery( site.ID ) );
	},
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-subscription-gifting' ).then( ( d ) =>
		createLazyRoute( 'subscription-gifting' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const wordpressRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'wordpress',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( canViewWordPressSettings( site ) ) {
			await queryClient.ensureQueryData( siteWordPressVersionQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-wordpress' ).then( ( d ) =>
		createLazyRoute( 'wordpress' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const phpRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'php',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( canViewPHPSettings( site ) ) {
			await queryClient.ensureQueryData( sitePHPVersionQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-php' ).then( ( d ) =>
		createLazyRoute( 'php' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const databaseRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'database',
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-database' ).then( ( d ) =>
		createLazyRoute( 'database' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencyRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'agency',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( site.is_wpcom_atomic ) {
			await queryClient.ensureQueryData( siteAgencyBlogQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-agency' ).then( ( d ) =>
		createLazyRoute( 'agency' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const hundredYearPlanRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'hundred-year-plan',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( canViewHundredYearPlanSettings( site ) ) {
			await queryClient.ensureQueryData( siteSettingsQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-hundred-year-plan' ).then( ( d ) =>
		createLazyRoute( 'hundred-year-plan' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const primaryDataCenterRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'primary-data-center',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( canViewPrimaryDataCenterSettings( site ) ) {
			await queryClient.ensureQueryData( sitePrimaryDataCenterQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-primary-data-center' ).then( ( d ) =>
		createLazyRoute( 'primary-data-center' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const staticFile404Route = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'static-file-404',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( canViewStaticFile404Settings( site ) ) {
			await queryClient.ensureQueryData( siteStaticFile404SettingQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-static-file-404' ).then( ( d ) =>
		createLazyRoute( 'static-file-404' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const cachingRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'caching',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( canViewCachingSettings( site ) ) {
			await queryClient.ensureQueryData( siteEdgeCacheStatusQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-caching' ).then( ( d ) =>
		createLazyRoute( 'caching' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const defensiveModeRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'defensive-mode',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( canViewDefensiveModeSettings( site ) ) {
			await queryClient.ensureQueryData( siteDefensiveModeSettingsQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-defensive-mode' ).then( ( d ) =>
		createLazyRoute( 'defensive-mode' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const sftpSshRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'sftp-ssh',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		return Promise.all( [
			canViewSftpSettings( site ) && queryClient.ensureQueryData( siteSftpUsersQuery( site.ID ) ),
			canViewSshSettings( site ) &&
				queryClient.ensureQueryData( siteSshAccessStatusQuery( site.ID ) ),
		] );
	},
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-sftp-ssh' ).then( ( d ) =>
		createLazyRoute( 'sftp-ssh' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const transferSiteRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'transfer-site',
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-transfer-site' ).then( ( d ) =>
		createLazyRoute( 'transfer-site' )( {
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
		] ),
		dashboardSitesCompatibilityRoute,
		dashboardSiteSettingsCompatibilityRouteRoot,
		dashboardSiteSettingsCompatibilityRouteWithFeature,
	] );

const compatibilityRoutes = [
	dashboardSiteSettingsCompatibilityRouteRoot,
	dashboardSiteSettingsCompatibilityRouteWithFeature,
];

export const { syncBrowserHistoryToRouter, syncMemoryRouterToBrowserHistory } =
	createBrowserHistoryAndMemoryRouterSync( { compatibilityRoutes } );

export const getRouter = ( { basePath }: { basePath: string } ) => {
	const routeTree = createRouteTree();
	const router = new Router( {
		...getRouterOptions(),
		routeTree,
		basepath: basePath,
	} );

	return router;
};
