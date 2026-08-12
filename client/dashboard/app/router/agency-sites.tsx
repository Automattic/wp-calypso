import {
	agencySiteQuery,
	queryClient,
	rawUserPreferencesQuery,
	siteApmAggregateRollingQuery,
	siteApmDetailQuery,
	siteBackupsQuery,
	siteBySlugQuery,
	sitePerformancePagesQuery,
	siteScanQuery,
	siteSettingsQuery,
} from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { createRoute, createLazyRoute, notFound } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { getSiteTypeFeatureSupports } from '../../utils/site-type-feature-support';
import { agencyRouteGuard } from './agency';
import { dashboardRedirect, redirectAsNotAllowed } from './redirect';
import { rootRoute } from './root';

// Pathless layout route so the agency site routes share the agency guard
// while registering as their own route group.
const agencySitesLayoutRoute = createRoute( {
	getParentRoute: () => rootRoute,
	id: 'agency-sites',
	beforeLoad: agencyRouteGuard,
} );

// `/sites` – agency-managed sites
export const agencySitesRoute = createRoute( {
	staticData: { requiresAgencyCapability: 'a4a_read_managed_sites' },
	head: () => ( {
		meta: [ { title: __( 'Sites' ) } ],
	} ),
	getParentRoute: () => agencySitesLayoutRoute,
	path: 'sites',
	loader: () => queryClient.ensureQueryData( rawUserPreferencesQuery() ),
} ).lazy( () =>
	import( '../../agency/sites' ).then( ( d ) =>
		createLazyRoute( 'agency-sites' )( {
			component: d.default,
		} )
	)
);

// `/sites/$siteSlug` – agency site detail (a layout that hosts the section routes)
export const agencySiteRoute = createRoute( {
	staticData: { requiresAgencyCapability: 'a4a_read_managed_sites' },
	getParentRoute: () => agencySitesLayoutRoute,
	path: 'sites/$siteSlug',
	beforeLoad: async ( { cause, params: { siteSlug }, matches } ) => {
		if ( cause === 'preload' ) {
			return;
		}

		let site;
		try {
			site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		} catch {
			// Do nothing and propagate the error through the loader function.
			return;
		}

		const siteTypeSupports = getSiteTypeFeatureSupports( site );
		for ( const match of matches ) {
			const required = match.staticData?.requiresSiteTypeSupport;
			if ( required && ! siteTypeSupports[ required ] ) {
				throw redirectAsNotAllowed( { to: `/sites/${ siteSlug }` } );
			}
		}
	},
	loader: async ( { params: { siteSlug } } ) => {
		// The sidebar needs the full site to decide section visibility before first paint.
		const [ site ] = await Promise.all( [
			queryClient.ensureQueryData( agencySiteQuery( siteSlug ) ),
			queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) ),
		] );
		if ( ! site ) {
			throw notFound();
		}
		return site;
	},
} ).lazy( () =>
	import( '../../agency/sites/site' ).then( ( d ) =>
		createLazyRoute( 'agency-site' )( {
			component: d.default,
		} )
	)
);

const agencySiteOverviewRoute = createRoute( {
	getParentRoute: () => agencySiteRoute,
	path: '/',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		queryClient.prefetchQuery( sitePerformancePagesQuery( site.ID ) );
	},
} ).lazy( () =>
	import( '../../agency/sites/site/overview' ).then( ( d ) =>
		createLazyRoute( 'agency-site-overview' )( {
			component: d.default,
		} )
	)
);

// `/sites/$siteSlug/backups` – layout that hosts the backups list/detail views
export const agencySiteBackupsRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Backups' ) } ] } ),
	getParentRoute: () => agencySiteRoute,
	path: 'backups',
	loader: async ( { params: { siteSlug } } ) => {
		const [ agencySite, site ] = await Promise.all( [
			queryClient.ensureQueryData( agencySiteQuery( siteSlug ) ),
			queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) ),
		] );

		if ( ! agencySite?.has_backup ) {
			return;
		}

		await Promise.all( [
			queryClient.ensureQueryData( siteSettingsQuery( site.ID ) ),
			queryClient.ensureQueryData( siteBackupsQuery( site.ID ) ),
		] );
	},
} ).lazy( () =>
	import( '../../agency/sites/site/backups' ).then( ( d ) =>
		createLazyRoute( 'agency-site-backups' )( {
			component: d.default,
		} )
	)
);

export const agencySiteBackupsIndexRoute = createRoute( {
	getParentRoute: () => agencySiteBackupsRoute,
	path: '/',
} ).lazy( () =>
	import( '../../agency/sites/site/backups-list-page' ).then( ( d ) =>
		createLazyRoute( 'agency-site-backups-index' )( {
			component: d.default,
		} )
	)
);

// `/sites/$siteSlug/backups/$rewindId` – layout hosting the detail view + restore/download flows
export const agencySiteBackupDetailRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Backups' ) } ] } ),
	getParentRoute: () => agencySiteBackupsRoute,
	path: '$rewindId',
} );

const agencySiteBackupDetailIndexRoute = createRoute( {
	getParentRoute: () => agencySiteBackupDetailRoute,
	path: '/',
} ).lazy( () =>
	import( '../../agency/sites/site/backups-list-page' ).then( ( d ) =>
		createLazyRoute( 'agency-site-backup-detail' )( {
			component: d.default,
		} )
	)
);

export const agencySiteBackupRestoreRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Site restore' ) } ] } ),
	getParentRoute: () => agencySiteBackupDetailRoute,
	path: 'restore',
} ).lazy( () =>
	import( '../../agency/sites/site/backup-restore' ).then( ( d ) =>
		createLazyRoute( 'agency-site-backup-restore' )( {
			component: d.default,
		} )
	)
);

export const agencySiteBackupDownloadRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Download backup' ) } ] } ),
	getParentRoute: () => agencySiteBackupDetailRoute,
	path: 'download',
	validateSearch: ( search ) => {
		const downloadId = Number( search.downloadId );
		return {
			downloadId: downloadId > 0 ? downloadId : undefined,
		};
	},
} ).lazy( () =>
	import( '../../agency/sites/site/backup-download' ).then( ( d ) =>
		createLazyRoute( 'agency-site-backup-download' )( {
			component: d.default,
		} )
	)
);

// `/sites/$siteSlug/scan` – layout that gates on the agency site's has_scan flag
const agencySiteScanRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Scan' ) } ] } ),
	getParentRoute: () => agencySiteRoute,
	path: 'scan',
	loader: async ( { params: { siteSlug } } ) => {
		const agencySite = await queryClient.ensureQueryData( agencySiteQuery( siteSlug ) );
		if ( ! agencySite?.has_scan ) {
			return;
		}
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		await Promise.all( [
			queryClient.ensureQueryData( siteSettingsQuery( site.ID ) ),
			queryClient.ensureQueryData( siteScanQuery( site.ID ) ),
		] );
	},
} ).lazy( () =>
	import( '../../agency/sites/site/scan' ).then( ( d ) =>
		createLazyRoute( 'agency-site-scan' )( {
			component: d.default,
		} )
	)
);

// `/sites/$siteSlug/logs` – logs parent, redirects to the activity log
export const agencySiteLogsRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Logs' ) } ] } ),
	getParentRoute: () => agencySiteRoute,
	path: 'logs',
} );

const agencySiteLogsIndexRoute = createRoute( {
	getParentRoute: () => agencySiteLogsRoute,
	path: '/',
	beforeLoad: ( { params: { siteSlug } } ) => {
		throw dashboardRedirect( { to: `/sites/${ siteSlug }/logs/activity` } );
	},
} );

// `/sites/$siteSlug/logs/activity` – activity log detailed view
export const agencySiteActivityRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Activity' ) } ] } ),
	getParentRoute: () => agencySiteLogsRoute,
	path: 'activity',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( ! site.__inaccessible_jetpack_error ) {
			await queryClient.prefetchQuery( siteSettingsQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../agency/sites/site/activity' ).then( ( d ) =>
		createLazyRoute( 'agency-site-activity' )( {
			component: d.default,
		} )
	)
);

const agencySiteScanIndexRoute = createRoute( {
	getParentRoute: () => agencySiteScanRoute,
	path: '/',
	beforeLoad: ( { params: { siteSlug } } ) => {
		throw dashboardRedirect( { to: `/sites/${ siteSlug }/scan/active` } );
	},
} );

export const agencySiteScanActiveRoute = createRoute( {
	getParentRoute: () => agencySiteScanRoute,
	path: 'active',
} ).lazy( () =>
	import( '../../agency/sites/site/scan-page' ).then( ( d ) =>
		createLazyRoute( 'agency-site-scan-active' )( {
			component: () => <d.default scanTab="active" />,
		} )
	)
);

export const agencySiteScanHistoryRoute = createRoute( {
	getParentRoute: () => agencySiteScanRoute,
	path: 'history',
} ).lazy( () =>
	import( '../../agency/sites/site/scan-page' ).then( ( d ) =>
		createLazyRoute( 'agency-site-scan-history' )( {
			component: () => <d.default scanTab="history" />,
		} )
	)
);

// `/sites/$siteSlug/performance` – layout hosting the Frontend and Backend views
const agencySitePerformanceRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'performance' },
	head: () => ( { meta: [ { title: __( 'Performance' ) } ] } ),
	getParentRoute: () => agencySiteRoute,
	path: 'performance',
} ).lazy( () =>
	import( '../../agency/sites/site/performance' ).then( ( d ) =>
		createLazyRoute( 'agency-site-performance' )( {
			component: d.default,
		} )
	)
);

const agencySitePerformanceIndexRoute = createRoute( {
	getParentRoute: () => agencySitePerformanceRoute,
	path: '/',
	beforeLoad: ( { params: { siteSlug } } ) => {
		throw dashboardRedirect( { to: `/sites/${ siteSlug }/performance/frontend` } );
	},
} );

export const agencySitePerformanceFrontendRoute = createRoute( {
	head: () => ( {
		meta: [ { title: isEnabled( 'performance/apm' ) ? __( 'Frontend' ) : undefined } ],
	} ),
	getParentRoute: () => agencySitePerformanceRoute,
	path: 'frontend',
} ).lazy( () =>
	import( '../../sites/performance/frontend' ).then( ( d ) =>
		createLazyRoute( 'agency-site-performance-frontend' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

export const agencySitePerformanceBackendRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Backend' ) } ] } ),
	getParentRoute: () => agencySitePerformanceRoute,
	path: 'backend',
} );

async function prefetchAgencyApmAggregate( siteSlug: string ) {
	const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
	const { getStoredOrDefaultTimeframe, TIMEFRAME_SECONDS } = await import(
		'../../sites/performance/backend/timeframe'
	);
	const windowSec = TIMEFRAME_SECONDS[ getStoredOrDefaultTimeframe() ];
	await queryClient.ensureQueryData( siteApmAggregateRollingQuery( site.ID, windowSec ) );
}

export const agencySitePerformanceBackendIndexRoute = createRoute( {
	getParentRoute: () => agencySitePerformanceBackendRoute,
	path: '/',
	loader: ( { params: { siteSlug } } ) => prefetchAgencyApmAggregate( siteSlug ),
} ).lazy( () =>
	import( '../../sites/performance/backend' ).then( ( d ) =>
		createLazyRoute( 'agency-site-performance-backend' )( {
			component: () => (
				<d.default siteSlug={ agencySiteRoute.useParams().siteSlug } tab="overview" />
			),
		} )
	)
);

export const agencySitePerformanceBackendTransactionsRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Transactions' ) } ] } ),
	getParentRoute: () => agencySitePerformanceBackendRoute,
	path: 'transactions',
	loader: ( { params: { siteSlug } } ) => prefetchAgencyApmAggregate( siteSlug ),
} ).lazy( () =>
	import( '../../sites/performance/backend' ).then( ( d ) =>
		createLazyRoute( 'agency-site-performance-backend-transactions' )( {
			component: () => (
				<d.default siteSlug={ agencySiteRoute.useParams().siteSlug } tab="transactions" />
			),
		} )
	)
);

export const agencySitePerformanceBackendWordPressRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'WordPress' ) } ] } ),
	getParentRoute: () => agencySitePerformanceBackendRoute,
	path: 'wordpress',
	loader: ( { params: { siteSlug } } ) => prefetchAgencyApmAggregate( siteSlug ),
} ).lazy( () =>
	import( '../../sites/performance/backend' ).then( ( d ) =>
		createLazyRoute( 'agency-site-performance-backend-wordpress' )( {
			component: () => (
				<d.default siteSlug={ agencySiteRoute.useParams().siteSlug } tab="wordpress" />
			),
		} )
	)
);

export const agencySitePerformanceBackendDatabaseRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Database' ) } ] } ),
	getParentRoute: () => agencySitePerformanceBackendRoute,
	path: 'database',
	loader: ( { params: { siteSlug } } ) => prefetchAgencyApmAggregate( siteSlug ),
} ).lazy( () =>
	import( '../../sites/performance/backend' ).then( ( d ) =>
		createLazyRoute( 'agency-site-performance-backend-database' )( {
			component: () => (
				<d.default siteSlug={ agencySiteRoute.useParams().siteSlug } tab="database" />
			),
		} )
	)
);

export const agencySitePerformanceBackendExternalRequestsRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'External requests' ) } ] } ),
	getParentRoute: () => agencySitePerformanceBackendRoute,
	path: 'external-requests',
	loader: ( { params: { siteSlug } } ) => prefetchAgencyApmAggregate( siteSlug ),
} ).lazy( () =>
	import( '../../sites/performance/backend' ).then( ( d ) =>
		createLazyRoute( 'agency-site-performance-backend-external-requests' )( {
			component: () => (
				<d.default siteSlug={ agencySiteRoute.useParams().siteSlug } tab="external-requests" />
			),
		} )
	)
);

export const agencySitePerformanceBackendRequestDetailRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Request' ) } ] } ),
	getParentRoute: () => agencySitePerformanceBackendRoute,
	path: 'requests',
	validateSearch: ( search ): { method: string; route: string; bucket?: string } => ( {
		method: typeof search.method === 'string' ? search.method : '',
		route: typeof search.route === 'string' ? search.route : '',
		bucket: typeof search.bucket === 'string' ? search.bucket : undefined,
	} ),
	loaderDeps: ( { search: { method, route } } ) => ( { method, route } ),
	loader: async ( { params: { siteSlug }, deps: { method, route } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		const { TIMEFRAME_SECONDS, getStoredOrDefaultTimeframe } = await import(
			'../../sites/performance/backend/timeframe'
		);
		const windowSec = TIMEFRAME_SECONDS[ getStoredOrDefaultTimeframe() ];
		await queryClient.ensureQueryData(
			siteApmDetailQuery( site.ID, { method, route, windowSec } )
		);
	},
} ).lazy( () =>
	import( '../../sites/performance/backend/request-detail' ).then( ( d ) =>
		createLazyRoute( 'agency-site-performance-backend-request-detail' )( {
			component: () => {
				const { siteSlug } = agencySiteRoute.useParams();
				const { method, route, bucket } =
					agencySitePerformanceBackendRequestDetailRoute.useSearch();
				return (
					<d.default siteSlug={ siteSlug } method={ method } route={ route } bucket={ bucket } />
				);
			},
		} )
	)
);

// `/sites/$siteSlug/monitoring` – server stats detailed view (WP.com sites only)
export const agencySiteMonitoringRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'monitoring' },
	head: () => ( { meta: [ { title: __( 'Monitoring' ) } ] } ),
	getParentRoute: () => agencySiteRoute,
	path: 'monitoring',
} ).lazy( () =>
	import( '../../agency/sites/site/monitoring' ).then( ( d ) =>
		createLazyRoute( 'agency-site-monitoring' )( {
			component: d.default,
		} )
	)
);

export const createAgencySitesRoutes = () => [
	agencySitesLayoutRoute.addChildren( [
		agencySitesRoute,
		agencySiteRoute.addChildren( [
			agencySiteOverviewRoute,
			agencySiteBackupsRoute.addChildren( [
				agencySiteBackupsIndexRoute,
				agencySiteBackupDetailRoute.addChildren( [
					agencySiteBackupDetailIndexRoute,
					agencySiteBackupRestoreRoute,
					agencySiteBackupDownloadRoute,
				] ),
			] ),
			agencySiteScanRoute.addChildren( [
				agencySiteScanIndexRoute,
				agencySiteScanActiveRoute,
				agencySiteScanHistoryRoute,
			] ),
			agencySitePerformanceRoute.addChildren( [
				agencySitePerformanceIndexRoute,
				agencySitePerformanceFrontendRoute,
				agencySitePerformanceBackendRoute.addChildren( [
					agencySitePerformanceBackendIndexRoute,
					agencySitePerformanceBackendTransactionsRoute,
					agencySitePerformanceBackendWordPressRoute,
					agencySitePerformanceBackendDatabaseRoute,
					agencySitePerformanceBackendExternalRequestsRoute,
					agencySitePerformanceBackendRequestDetailRoute,
				] ),
			] ),
			agencySiteMonitoringRoute,
			agencySiteLogsRoute.addChildren( [ agencySiteLogsIndexRoute, agencySiteActivityRoute ] ),
		] ),
	] ),
];
