import {
	Outlet,
	Router,
	createLazyRoute,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	redirect,
	type AnyRouter,
} from '@tanstack/react-router';
import {
	siteQuery,
	siteSettingsQuery,
	siteStaticFile404Query,
	siteWordPressVersionQuery,
	sitePHPVersionQuery,
	sitePrimaryDataCenterQuery,
	siteEdgeCacheStatusQuery,
	siteDefensiveModeQuery,
	agencyBlogQuery,
	siteSftpUsersQuery,
	siteSshAccessStatusQuery,
} from 'calypso/dashboard/app/queries';
import { queryClient } from 'calypso/dashboard/app/query-client';
import {
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
import Root from './root';

const rootRoute = createRootRoute( { component: Root } );

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
	loader: ( { params: { siteSlug } } ) =>
		queryClient.ensureQueryData( siteSettingsQuery( siteSlug ) ),
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
	loader: ( { params: { siteSlug } } ) =>
		queryClient.ensureQueryData( siteSettingsQuery( siteSlug ) ),
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
	loader: ( { params: { siteSlug } } ) =>
		queryClient.ensureQueryData( siteSettingsQuery( siteSlug ) ),
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
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( canViewWordPressSettings( site ) ) {
			await queryClient.ensureQueryData( siteWordPressVersionQuery( siteSlug ) );
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
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( canViewPHPSettings( site ) ) {
			await queryClient.ensureQueryData( sitePHPVersionQuery( siteSlug ) );
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
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( site.is_wpcom_atomic ) {
			await queryClient.ensureQueryData( agencyBlogQuery( site.ID ) );
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
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( canViewHundredYearPlanSettings( site ) ) {
			await queryClient.ensureQueryData( siteSettingsQuery( siteSlug ) );
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
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( canViewPrimaryDataCenterSettings( site ) ) {
			await queryClient.ensureQueryData( sitePrimaryDataCenterQuery( siteSlug ) );
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
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( canViewStaticFile404Settings( site ) ) {
			await queryClient.ensureQueryData( siteStaticFile404Query( siteSlug ) );
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
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( canViewCachingSettings( site ) ) {
			await queryClient.ensureQueryData( siteEdgeCacheStatusQuery( siteSlug ) );
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
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		if ( canViewDefensiveModeSettings( site ) ) {
			await queryClient.ensureQueryData( siteDefensiveModeQuery( siteSlug ) );
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
		const site = await queryClient.ensureQueryData( siteQuery( siteSlug ) );
		return Promise.all( [
			canViewSftpSettings( site ) && queryClient.ensureQueryData( siteSftpUsersQuery( siteSlug ) ),
			canViewSshSettings( site ) &&
				queryClient.ensureQueryData( siteSshAccessStatusQuery( siteSlug ) ),
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
		dashboardSiteSettingsCompatibilityRouteRoot,
		dashboardSiteSettingsCompatibilityRouteWithFeature,
	] );

const isCompatibilityRoute = ( router: AnyRouter, url: string ) => {
	const matches = router.matchRoutes( url );
	if ( ! matches ) {
		return false;
	}

	return matches.some(
		( match: { routeId: string } ) =>
			match.routeId === dashboardSiteSettingsCompatibilityRouteRoot.id ||
			match.routeId === dashboardSiteSettingsCompatibilityRouteWithFeature.id
	);
};

const syncMemoryRouterToBrowserHistory = ( router: AnyRouter ) => {
	let lastPath = '';

	// Sync TanStack Router's history to the browser history.
	router.history.subscribe( () => {
		const { pathname, search } = router.history.location;
		const newUrl = `${ pathname }${ search }`;

		// Avoid pushing redirect routes to the browser history.
		if ( isCompatibilityRoute( router, newUrl ) ) {
			return;
		}

		if ( window.location.pathname + window.location.search !== newUrl ) {
			window.history.pushState( null, '', newUrl );
			lastPath = newUrl;
		}
	} );

	window.addEventListener( 'popstate', () => {
		const currentPath = `${ window.location.pathname }${ window.location.search }`;
		const basepath = router.options.basepath;

		// Avoid handling routes outside of the basepath.
		if ( basepath && ! currentPath.startsWith( basepath ) ) {
			return;
		}

		if ( currentPath !== lastPath ) {
			router.navigate( { to: currentPath, replace: true } );
			lastPath = currentPath;
		}
	} );
};

export const getRouter = ( { basePath }: { basePath: string } ) => {
	const routeTree = createRouteTree();
	const router = new Router( {
		routeTree,
		basepath: basePath,
		defaultPreload: 'intent',
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: () => null,
		defaultViewTransition: true,

		// Use memory history to compartmentalize TanStack Router's history management.
		// This way, we separate TanStack Router's history implementation from the browser history used by page.js.
		history: createMemoryHistory( { initialEntries: [ window.location.pathname ] } ),
	} );

	syncMemoryRouterToBrowserHistory( router );
	return router;
};
