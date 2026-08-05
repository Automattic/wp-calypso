import {
	JetpackLicenseFilter,
	JetpackLicenseSortField,
	JetpackLicenseSortDirection,
} from '@automattic/api-core';
import {
	activeAgencyQuery,
	agencyProductsQuery,
	agencyQuery,
	agencyResourcesQuery,
	agencySiteQuery,
	agencySitesWithPluginsQuery,
	agencyWooPaymentsDataQuery,
	jetpackAgencyLicensesQuery,
	mcpSettingsQuery,
	queryClient,
	rawUserPreferencesQuery,
	siteApmAggregateRollingQuery,
	siteApmDetailQuery,
	siteBackupsQuery,
	siteBySlugQuery,
	sitePerformancePagesQuery,
	siteScanQuery,
	siteSettingsQuery,
	referralsQuery,
	referralCommissionPayoutQuery,
	tipaltiPayeeQuery,
} from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { createRoute, createLazyRoute, notFound, Outlet } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { getSiteTypeFeatureSupports } from '../../utils/site-type-feature-support';
import { dashboardRedirect, redirectAsNotAllowed } from './redirect';
import { rootRoute } from './root';
import type { AgencyCapability } from '@automattic/api-core';
import type { AnyRoute, StaticDataRouteOption } from '@tanstack/react-router';

/**
 * Any-of (OR): true when `capabilities` contains at least one required capability.
 */
export function hasAnyCapability(
	capabilities: readonly string[],
	required: AgencyCapability | AgencyCapability[]
): boolean {
	const list = Array.isArray( required ) ? required : [ required ];
	return list.some( ( capability ) => capabilities.includes( capability ) );
}

function satisfiesStaticData(
	staticData: StaticDataRouteOption | undefined,
	capabilities: readonly string[]
): boolean {
	const required = staticData?.requiresAgencyCapability;
	return ! required || hasAnyCapability( capabilities, required );
}

/**
 * True when every matched agency route's declared capability requirement is
 * satisfied. Routes without `requiresAgencyCapability` are unrestricted.
 */
export function isAllowedByCapabilities(
	matches: ReadonlyArray< { staticData?: StaticDataRouteOption } >,
	capabilities: readonly string[]
): boolean {
	return matches.every( ( match ) => satisfiesStaticData( match.staticData, capabilities ) );
}

/**
 * The same check against a route object, for surfaces that decide whether to
 * link to a route at all (the sidebar) rather than guarding a navigation to it.
 * Reading the requirement off the route keeps the menu and the guard in sync.
 */
export function isRouteAllowedByCapabilities(
	route: AnyRoute,
	capabilities: readonly string[]
): boolean {
	return satisfiesStaticData( route.options.staticData, capabilities );
}

// Pathless layout route that guards every agency route (blocks client users).
const agencyRoute = createRoute( {
	getParentRoute: () => rootRoute,
	id: 'agency',
	beforeLoad: async ( { cause, matches } ) => {
		if ( cause === 'preload' ) {
			return; // Don't redirect on hover/intent preloads.
		}

		const [ agency, activeAgency ] = await Promise.all( [
			queryClient.ensureQueryData( agencyQuery() ),
			queryClient.ensureQueryData( activeAgencyQuery() ),
		] );
		if ( agency.isClientUser ) {
			throw redirectAsNotAllowed( { to: '/client/subscriptions' } );
		}

		const capabilities = activeAgency?.user?.capabilities ?? [];
		if ( ! isAllowedByCapabilities( matches, capabilities ) ) {
			throw redirectAsNotAllowed( { to: '/overview' } );
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
export const agencyTiersRoute = createRoute( {
	staticData: { requiresAgencyCapability: 'a4a_read_agency_tier' },
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
export const exclusiveOffersRoute = createRoute( {
	staticData: { requiresAgencyCapability: 'a4a_read_exclusive_offers' },
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
export const learnRoute = createRoute( {
	staticData: { requiresAgencyCapability: 'a4a_read_learn' },
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

export const mcpRoute = createRoute( {
	staticData: { requiresAgencyCapability: 'a4a_read_learn' },
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
	staticData: { requiresAgencyCapability: 'a4a_read_managed_sites' },
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
	staticData: { requiresAgencyCapability: 'a4a_read_users' },
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
export const earnOverviewRoute = createRoute( {
	// TODO: replace with a top-level `a4a_read_earnings` capability when one exists.
	staticData: { requiresAgencyCapability: [ 'a4a_read_referrals', 'a4a_read_migrations' ] },
	head: () => ( { meta: [ { title: __( 'Overview' ) } ] } ),
	getParentRoute: () => agencyRoute,
	path: 'earn',
} ).lazy( () =>
	import( '../../agency/earn/overview' ).then( ( d ) =>
		createLazyRoute( 'earn-overview' )( { component: d.default } )
	)
);

// `/earn/referrals` – referral commissions
export const earnReferralsRoute = createRoute( {
	staticData: { requiresAgencyCapability: 'a4a_read_referrals' },
	head: () => ( { meta: [ { title: __( 'Referrals' ) } ] } ),
	getParentRoute: () => agencyRoute,
	path: 'earn/referrals',
} ).lazy( () =>
	import( '../../agency/earn/referrals' ).then( ( d ) =>
		createLazyRoute( 'earn-referrals' )( { component: d.default } )
	)
);

// `/earn/woopayments` – WooPayments revenue share
export const earnWooPaymentsRoute = createRoute( {
	// TODO: replace with a dedicated WooPayments capability when one exists.
	staticData: { requiresAgencyCapability: 'a4a_read_referrals' },
	head: () => ( { meta: [ { title: __( 'WooPayments' ) } ] } ),
	getParentRoute: () => agencyRoute,
	path: 'earn/woopayments',
	loader: async () => {
		const agency = await queryClient.ensureQueryData( activeAgencyQuery() );
		if ( ! agency?.id ) {
			return;
		}
		const [ sitesWithPlugins, licenses ] = await Promise.all( [
			queryClient.ensureQueryData(
				agencySitesWithPluginsQuery( agency.id, [ 'woocommerce-payments/woocommerce-payments' ] )
			),
			queryClient.ensureQueryData(
				jetpackAgencyLicensesQuery( agency.id, {
					filter: JetpackLicenseFilter.Attached,
					search: 'woopayments',
					sortField: JetpackLicenseSortField.IssuedAt,
					sortDirection: JetpackLicenseSortDirection.Descending,
				} )
			),
		] );
		if ( sitesWithPlugins.length > 0 || licenses.length > 0 ) {
			await Promise.all( [
				queryClient.ensureQueryData( agencyWooPaymentsDataQuery( agency.id ) ),
				queryClient.ensureQueryData( tipaltiPayeeQuery( agency.id ) ),
			] );
		}
	},
} ).lazy( () =>
	import( '../../agency/earn/woopayments' ).then( ( d ) =>
		createLazyRoute( 'earn-woopayments' )( { component: d.default } )
	)
);

// `/earn/migrations` – migration commissions
export const earnMigrationsRoute = createRoute( {
	staticData: { requiresAgencyCapability: 'a4a_read_migrations' },
	head: () => ( { meta: [ { title: __( 'Migrations' ) } ] } ),
	getParentRoute: () => agencyRoute,
	path: 'earn/migrations',
} ).lazy( () =>
	import( '../../agency/earn/migrations' ).then( ( d ) =>
		createLazyRoute( 'earn-migrations' )( { component: d.default } )
	)
);

// `/earn/payout-settings` – where and how the agency gets paid
export const earnPayoutSettingsRoute = createRoute( {
	// TODO: replace with a top-level `a4a_read_earnings` capability when one exists.
	staticData: { requiresAgencyCapability: [ 'a4a_read_referrals', 'a4a_read_migrations' ] },
	head: () => ( { meta: [ { title: __( 'Payout settings' ) } ] } ),
	getParentRoute: () => agencyRoute,
	path: 'earn/payout-settings',
} ).lazy( () =>
	import( '../../agency/earn/payout-settings' ).then( ( d ) =>
		createLazyRoute( 'earn-payout-settings' )( { component: d.default } )
	)
);

// `/earn/referrals/$referralId` – referral (client) detail view; hosts the tab routes
export const earnReferralRoute = createRoute( {
	staticData: { requiresAgencyCapability: 'a4a_read_referrals' },
	head: () => ( { meta: [ { title: __( 'Referral details' ) } ] } ),
	getParentRoute: () => agencyRoute,
	path: 'earn/referrals/$referralId',
	loader: async () => {
		const agency = await queryClient.ensureQueryData( activeAgencyQuery() );
		const agencyId = agency?.id ?? 0;
		if ( agencyId ) {
			await Promise.all( [
				queryClient.ensureQueryData( referralsQuery( agencyId ) ),
				queryClient.ensureQueryData( agencyProductsQuery( agencyId ) ).catch( () => undefined ),
			] );
			queryClient.prefetchQuery( referralCommissionPayoutQuery( agencyId ) );
		}
	},
	component: Outlet,
} );

const earnReferralOverviewRoute = createRoute( {
	getParentRoute: () => earnReferralRoute,
	path: '/',
} ).lazy( () =>
	import( '../../agency/earn/referrals/referral/overview' ).then( ( d ) =>
		createLazyRoute( 'earn-referral-overview' )( { component: d.default } )
	)
);

const earnReferralOrdersRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Referrals' ) } ] } ),
	getParentRoute: () => earnReferralRoute,
	path: 'orders',
} ).lazy( () =>
	import( '../../agency/earn/referrals/referral/referrals-tab' ).then( ( d ) =>
		createLazyRoute( 'earn-referral-orders' )( { component: d.default } )
	)
);

const earnReferralPurchasesRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Purchases' ) } ] } ),
	getParentRoute: () => earnReferralRoute,
	path: 'purchases',
} ).lazy( () =>
	import( '../../agency/earn/referrals/referral/purchases' ).then( ( d ) =>
		createLazyRoute( 'earn-referral-purchases' )( { component: d.default } )
	)
);

// `/sites/$siteSlug` – agency site detail (a layout that hosts the section routes)
export const agencySiteRoute = createRoute( {
	staticData: { requiresAgencyCapability: 'a4a_read_managed_sites' },
	getParentRoute: () => agencyRoute,
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
		earnReferralRoute.addChildren( [
			earnReferralOverviewRoute,
			earnReferralOrdersRoute,
			earnReferralPurchasesRoute,
		] ),
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
			agencySiteLogsRoute.addChildren( [ agencySiteLogsIndexRoute, agencySiteActivityRoute ] ),
		] ),
	] ),
];
