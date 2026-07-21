import {
	activeAgencyQuery,
	agencyQuery,
	agencyResourcesQuery,
	agencySiteQuery,
	mcpSettingsQuery,
	queryClient,
	rawUserPreferencesQuery,
	siteBackupsQuery,
	siteBySlugQuery,
	siteScanQuery,
	siteSettingsQuery,
} from '@automattic/api-queries';
import { createRoute, createLazyRoute, notFound } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { dashboardRedirect, redirectAsNotAllowed } from './redirect';
import { rootRoute } from './root';

// Pathless layout route that guards every agency route (blocks client users).
const agencyRoute = createRoute( {
	getParentRoute: () => rootRoute,
	id: 'agency',
	beforeLoad: async ( { cause } ) => {
		if ( cause === 'preload' ) {
			return; // Don't redirect on hover/intent preloads.
		}

		const [ agency ] = await Promise.all( [
			queryClient.ensureQueryData( agencyQuery() ),
			queryClient.ensureQueryData( activeAgencyQuery() ),
		] );
		if ( agency.isClientUser ) {
			throw redirectAsNotAllowed( { to: '/client/subscriptions' } );
		}
	},
} );

// `/overview` – agency overview
const agencyOverviewRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Agency Overview' ),
			},
		],
	} ),
	getParentRoute: () => agencyRoute,
	path: 'overview',
} ).lazy( () =>
	import( '../../agency/overview' ).then( ( d ) =>
		createLazyRoute( 'agency-overview' )( {
			component: d.default,
		} )
	)
);

// `/tiers` – agency tiers & benefits
const agencyTiersRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Tiers' ),
			},
		],
	} ),
	getParentRoute: () => agencyRoute,
	path: 'agency/tiers',
	loader: () => queryClient.ensureQueryData( activeAgencyQuery() ),
} ).lazy( () =>
	import( '../../agency/tiers' ).then( ( d ) =>
		createLazyRoute( 'agency-tiers' )( {
			component: d.default,
		} )
	)
);

// `/marketplace/exclusive-offers` – partner offers (Refer / Resell)
const exclusiveOffersRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Exclusive offers' ),
			},
		],
	} ),
	getParentRoute: () => agencyRoute,
	path: 'marketplace/exclusive-offers',
} ).lazy( () =>
	import( '../../agency/marketplace/exclusive-offers' ).then( ( d ) =>
		createLazyRoute( 'exclusive-offers' )( {
			component: d.default,
		} )
	)
);

// `/resources/learn` – guides, articles, and training for agencies
const learnRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Learn' ),
			},
		],
	} ),
	getParentRoute: () => agencyRoute,
	path: 'resources/learn',
	loader: () => queryClient.ensureQueryData( agencyResourcesQuery() ),
} ).lazy( () =>
	import( '../../agency/resources/learn' ).then( ( d ) =>
		createLazyRoute( 'resources-learn' )( {
			component: d.default,
		} )
	)
);

// Prefetch MCP settings for the screens that read them. The connect screen is
// static, so it intentionally doesn't depend on this request.
const ensureMcpSettings = async () => {
	const agency = await queryClient.ensureQueryData( activeAgencyQuery() );
	if ( agency?.id ) {
		await queryClient.ensureQueryData( mcpSettingsQuery( agency.id ) );
	}
};

const mcpRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'MCP' ) } ] } ),
	getParentRoute: () => agencyRoute,
	path: 'resources/ai-mcp',
	beforeLoad: async ( { cause } ) => {
		if ( cause === 'preload' ) {
			return;
		}

		const agency = await queryClient.ensureQueryData( activeAgencyQuery() );
		if ( ! agency?.mcp?.allowed ) {
			throw redirectAsNotAllowed( { to: '/overview' } );
		}
	},
} );

const mcpOverviewRoute = createRoute( {
	getParentRoute: () => mcpRoute,
	path: '/',
	loader: ensureMcpSettings,
} ).lazy( () =>
	import( '../../agency/resources/mcp' ).then( ( d ) =>
		createLazyRoute( 'resources-mcp' )( { component: d.default } )
	)
);

const mcpAvailableToolsRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Available tools' ) } ] } ),
	getParentRoute: () => mcpRoute,
	path: 'tools',
	loader: ensureMcpSettings,
} ).lazy( () =>
	import( '../../agency/resources/mcp/available-tools' ).then( ( d ) =>
		createLazyRoute( 'resources-mcp-tools' )( { component: d.default } )
	)
);

const mcpConnectRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Connect external AI assistant' ) } ] } ),
	getParentRoute: () => mcpRoute,
	path: 'connect',
} ).lazy( () =>
	import( '../../agency/resources/mcp/connect-agent' ).then( ( d ) =>
		createLazyRoute( 'resources-mcp-connect' )( { component: d.default } )
	)
);

// `/sites` – agency-managed sites
export const agencySitesRoute = createRoute( {
	head: () => ( {
		meta: [ { title: __( 'Sites' ) } ],
	} ),
	getParentRoute: () => agencyRoute,
	path: 'sites',
	loader: () => queryClient.ensureQueryData( rawUserPreferencesQuery() ),
} ).lazy( () =>
	import( '../../agency/sites' ).then( ( d ) =>
		createLazyRoute( 'agency-sites' )( {
			component: d.default,
		} )
	)
);

// `/team` – manage agency team members and invitations
export const agencyTeamRoute = createRoute( {
	head: () => ( {
		meta: [ { title: __( 'Team' ) } ],
	} ),
	getParentRoute: () => agencyRoute,
	path: 'team',
	loader: () => queryClient.ensureQueryData( rawUserPreferencesQuery() ),
} ).lazy( () =>
	import( '../../agency/team' ).then( ( d ) =>
		createLazyRoute( 'agency-team' )( {
			component: d.default,
		} )
	)
);

// `/earn` – summary of the agency's earning programs (default Earn screen)
const earnOverviewRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Overview' ) } ] } ),
	getParentRoute: () => agencyRoute,
	path: 'earn',
} ).lazy( () =>
	import( '../../agency/earn/overview' ).then( ( d ) =>
		createLazyRoute( 'earn-overview' )( { component: d.default } )
	)
);

// `/earn/referrals` – referral commissions
const earnReferralsRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Referrals' ) } ] } ),
	getParentRoute: () => agencyRoute,
	path: 'earn/referrals',
} ).lazy( () =>
	import( '../../agency/earn/referrals' ).then( ( d ) =>
		createLazyRoute( 'earn-referrals' )( { component: d.default } )
	)
);

// `/earn/woopayments` – WooPayments revenue share
const earnWooPaymentsRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'WooPayments' ) } ] } ),
	getParentRoute: () => agencyRoute,
	path: 'earn/woopayments',
} ).lazy( () =>
	import( '../../agency/earn/woopayments' ).then( ( d ) =>
		createLazyRoute( 'earn-woopayments' )( { component: d.default } )
	)
);

// `/earn/migrations` – migration commissions
const earnMigrationsRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Migrations' ) } ] } ),
	getParentRoute: () => agencyRoute,
	path: 'earn/migrations',
} ).lazy( () =>
	import( '../../agency/earn/migrations' ).then( ( d ) =>
		createLazyRoute( 'earn-migrations' )( { component: d.default } )
	)
);

// `/earn/payout-settings` – where and how the agency gets paid
const earnPayoutSettingsRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Payout settings' ) } ] } ),
	getParentRoute: () => agencyRoute,
	path: 'earn/payout-settings',
} ).lazy( () =>
	import( '../../agency/earn/payout-settings' ).then( ( d ) =>
		createLazyRoute( 'earn-payout-settings' )( { component: d.default } )
	)
);

// `/sites/$siteSlug` – agency site detail (a layout that hosts the section routes)
export const agencySiteRoute = createRoute( {
	getParentRoute: () => agencyRoute,
	path: 'sites/$siteSlug',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( agencySiteQuery( siteSlug ) );
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

export const createAgencyRoutes = () => [
	agencyRoute.addChildren( [
		agencyOverviewRoute,
		agencyTiersRoute,
		exclusiveOffersRoute,
		learnRoute,
		mcpRoute.addChildren( [ mcpOverviewRoute, mcpAvailableToolsRoute, mcpConnectRoute ] ),
		agencySitesRoute,
		agencyTeamRoute,
		earnOverviewRoute,
		earnReferralsRoute,
		earnWooPaymentsRoute,
		earnMigrationsRoute,
		earnPayoutSettingsRoute,
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
			agencySiteLogsRoute.addChildren( [ agencySiteLogsIndexRoute, agencySiteActivityRoute ] ),
		] ),
	] ),
];
