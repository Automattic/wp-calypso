import {
	DotcomFeatures,
	HostingFeatures,
	JetpackLicenseFilter,
	JetpackLicenseSortField,
	JetpackLicenseSortDirection,
	fetchTwoStep,
} from '@automattic/api-core';
import {
	activeAgencyQuery,
	agencyProductsQuery,
	agencyQuery,
	agencyResourcesQuery,
	agencySiteQuery,
	agencySitesWithPluginsQuery,
	agencyWooPaymentsDataQuery,
	bigSkyPluginQuery,
	codeDeploymentQuery,
	codeDeploymentsQuery,
	githubInstallationsQuery,
	jetpackAgencyLicensesQuery,
	mcpSettingsQuery,
	productsQuery,
	queryClient,
	rawUserPreferencesQuery,
	siteAgencyBlogQuery,
	siteApmAggregateRollingQuery,
	siteApmDetailQuery,
	siteBackupsQuery,
	siteBySlugQuery,
	siteCrontabsQuery,
	siteCurrentPlanQuery,
	siteDefensiveModeSettingsQuery,
	siteEdgeCacheStatusQuery,
	siteJetpackModulesQuery,
	siteJetpackSettingsQuery,
	sitePHPVersionQuery,
	sitePerformancePagesQuery,
	sitePostByEmailSettingsQuery,
	sitePreviewLinksQuery,
	sitePrimaryDataCenterQuery,
	siteRedirectQuery,
	siteScanQuery,
	siteSettingsQuery,
	siteSftpUsersQuery,
	siteSshAccessStatusQuery,
	siteStaticFile404SettingQuery,
	siteWordPressVersionQuery,
	referralsQuery,
	referralCommissionPayoutQuery,
	tipaltiPayeeQuery,
	userSettingsQuery,
	wpOrgCoreVersionQuery,
} from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { createRoute, createLazyRoute, notFound, Outlet } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import {
	canOptOutOfWordPressBeta,
	canSwitchWordPressVersion,
	canTransferSite,
	canViewHundredYearPlanSettings,
} from '../../sites/features';
import { reauthRequiredLink } from '../../utils/link';
import { hasHostingFeature, hasPlanFeature } from '../../utils/site-features';
import { getSiteTypeFeatureSupports } from '../../utils/site-type-feature-support';
import { AUTH_QUERY_KEY } from '../auth';
import { dashboardRedirect, redirectAsNotAllowed } from './redirect';
import { rootRoute } from './root';
import type { AgencyCapability, User } from '@automattic/api-core';
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

// `/sites/$siteSlug/settings` – settings hub, mirroring the dotcom dashboard's settings tree
export const agencySiteSettingsRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settings' },
	head: () => ( { meta: [ { title: __( 'Settings' ) } ] } ),
	getParentRoute: () => agencySiteRoute,
	path: 'settings',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );

		queryClient.prefetchQuery( siteCurrentPlanQuery( site.ID ) );
		await Promise.all( [
			queryClient.ensureQueryData( siteSettingsQuery( site.ID ) ),
			hasHostingFeature( site, HostingFeatures.PRIMARY_DATA_CENTER ) &&
				queryClient.ensureQueryData( sitePrimaryDataCenterQuery( site.ID ) ),
		] );
	},
} );

const agencySiteSettingsIndexRoute = createRoute( {
	getParentRoute: () => agencySiteSettingsRoute,
	path: '/',
} ).lazy( () =>
	import( '../../sites/settings' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsSiteVisibilityRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsGeneralDotcomSiteVisibility' },
	head: () => ( { meta: [ { title: __( 'Site visibility' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'site-visibility',
	loader: async ( { context, params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );

		await Promise.all( [
			queryClient.ensureQueryData( siteSettingsQuery( site.ID ) ),
			queryClient.ensureQueryData( context.config.queries.domainsQuery() ),
			site.is_coming_soon &&
				hasPlanFeature( site, DotcomFeatures.SITE_PREVIEW_LINKS ) &&
				queryClient.ensureQueryData( sitePreviewLinksQuery( site.ID ) ),
		] );
	},
} ).lazy( () =>
	import( '../../sites/settings-site-visibility' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-site-visibility' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsAIToolsRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsGeneralAITools' },
	head: () => ( { meta: [ { title: __( 'AI tools' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'ai-tools',
	beforeLoad: async ( { cause, params: { siteSlug } } ) => {
		if ( cause === 'preload' ) {
			return;
		}

		if ( ! isEnabled( 'wordpress-ai-tools' ) ) {
			throw redirectAsNotAllowed( { to: agencySiteSettingsRoute.fullPath, params: { siteSlug } } );
		}

		if ( cause === 'enter' ) {
			const twoStep = await fetchTwoStep();
			if ( twoStep.two_step_reauthorization_required ) {
				throw dashboardRedirect( { href: reauthRequiredLink(), reloadDocument: true } );
			}
		}
	},
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		const pluginStatus = await queryClient.ensureQueryData( bigSkyPluginQuery( site.ID ) );

		if ( pluginStatus?.available ) {
			queryClient.prefetchQuery( sitePostByEmailSettingsQuery( site ) );
		}

		await queryClient.ensureQueryData( userSettingsQuery() );
	},
} );

const agencySiteSettingsAIToolsIndexRoute = createRoute( {
	getParentRoute: () => agencySiteSettingsAIToolsRoute,
	path: '/',
} ).lazy( () =>
	import( '../../sites/settings-ai-tools' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-ai-tools' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

function redirectAgencySiteAiToolsSubpageToHub( {
	cause,
	params: { siteSlug },
}: {
	cause: string;
	params: { siteSlug: string };
} ) {
	if ( cause === 'preload' ) {
		return;
	}
	if ( ! isEnabled( 'mcp-settings' ) ) {
		throw dashboardRedirect( {
			to: agencySiteSettingsAIToolsIndexRoute.fullPath,
			params: { siteSlug },
		} );
	}
}

const agencySiteSettingsAIToolsReadRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Read' ) } ] } ),
	getParentRoute: () => agencySiteSettingsAIToolsRoute,
	path: 'read',
	beforeLoad: redirectAgencySiteAiToolsSubpageToHub,
	loader: async ( { params: { siteSlug } } ) => {
		await Promise.all( [
			queryClient.ensureQueryData( userSettingsQuery() ),
			queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) ),
		] );
	},
} ).lazy( () =>
	import( '../../sites/settings-ai-tools/read' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-ai-tools-read' )( {
			component: d.default,
		} )
	)
);

const agencySiteSettingsAIToolsWriteRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Write' ) } ] } ),
	getParentRoute: () => agencySiteSettingsAIToolsRoute,
	path: 'write',
	beforeLoad: redirectAgencySiteAiToolsSubpageToHub,
	loader: async ( { params: { siteSlug } } ) => {
		await Promise.all( [
			queryClient.ensureQueryData( userSettingsQuery() ),
			queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) ),
		] );
	},
} ).lazy( () =>
	import( '../../sites/settings-ai-tools/write' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-ai-tools-write' )( {
			component: d.default,
		} )
	)
);

const agencySiteSettingsAIToolsSetupRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Connect AI agent' ) } ] } ),
	getParentRoute: () => agencySiteSettingsAIToolsRoute,
	path: 'setup',
	beforeLoad: redirectAgencySiteAiToolsSubpageToHub,
	loader: async ( { params: { siteSlug } } ) => {
		await Promise.all( [
			queryClient.ensureQueryData( userSettingsQuery() ),
			queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) ),
		] );
	},
} ).lazy( () =>
	import( '../../sites/settings-ai-tools/setup' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-ai-tools-setup' )( {
			component: d.default,
		} )
	)
);

const agencySiteSettingsRedirectRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsGeneralRedirect' },
	head: () => ( { meta: [ { title: __( 'Site Redirect' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'site-redirect',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		return await Promise.all( [
			queryClient.ensureQueryData( productsQuery() ),
			queryClient.ensureQueryData( siteRedirectQuery( site.ID ) ),
		] );
	},
} ).lazy( () =>
	import( '../../sites/settings-redirect' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-redirect' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsSubscriptionGiftingRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsGeneral' },
	head: () => ( { meta: [ { title: __( 'Accept a gift subscription' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'subscription-gifting',
	beforeLoad: async ( { cause, params: { siteSlug } } ) => {
		if ( cause === 'preload' ) {
			return;
		}

		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( ! hasPlanFeature( site, DotcomFeatures.SUBSCRIPTION_GIFTING ) ) {
			throw redirectAsNotAllowed( { to: agencySiteSettingsRoute.fullPath, params: { siteSlug } } );
		}
	},
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		await queryClient.ensureQueryData( siteSettingsQuery( site.ID ) );
	},
} ).lazy( () =>
	import( '../../sites/settings-subscription-gifting' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-subscription-gifting' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsAgencyRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsGeneral' },
	head: () => ( { meta: [ { title: __( 'Agency settings' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'agency',
	beforeLoad: async ( { cause, params: { siteSlug } } ) => {
		if ( cause === 'preload' ) {
			return;
		}

		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( site.is_wpcom_atomic ) {
			const agencyBlog = await queryClient.ensureQueryData( siteAgencyBlogQuery( site.ID ) );
			if ( ! agencyBlog ) {
				throw redirectAsNotAllowed( {
					to: agencySiteSettingsRoute.fullPath,
					params: { siteSlug },
				} );
			}
		}
	},
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( site.is_wpcom_atomic ) {
			await queryClient.ensureQueryData( siteAgencyBlogQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-agency' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-agency' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsHundredYearPlanRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsGeneral' },
	head: () => ( { meta: [ { title: __( 'Control your legacy' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'hundred-year-plan',
	beforeLoad: async ( { cause, params: { siteSlug } } ) => {
		if ( cause === 'preload' ) {
			return;
		}

		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( ! canViewHundredYearPlanSettings( site ) ) {
			throw redirectAsNotAllowed( { to: agencySiteSettingsRoute.fullPath, params: { siteSlug } } );
		}
	},
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		await queryClient.ensureQueryData( siteSettingsQuery( site.ID ) );
	},
} ).lazy( () =>
	import( '../../sites/settings-hundred-year-plan' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-hundred-year-plan' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsWordPressRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsServer' },
	head: () => ( { meta: [ { title: 'WordPress' } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'wordpress',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( canSwitchWordPressVersion( site ) || canOptOutOfWordPressBeta( site, 'beta' ) ) {
			// Fire-and-forget the external wp.org queries so a slow upstream
			// doesn't hang navigation; the component suspends on them via
			// useSuspenseQuery and falls back to the route's Suspense boundary.
			queryClient.prefetchQuery( wpOrgCoreVersionQuery() );
			queryClient.prefetchQuery( wpOrgCoreVersionQuery( 'beta' ) );
			await queryClient.ensureQueryData( siteWordPressVersionQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-wordpress' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-wordpress' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsPHPRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsServer' },
	head: () => ( { meta: [ { title: 'PHP' } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'php',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.PHP ) ) {
			await queryClient.ensureQueryData( sitePHPVersionQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-php' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-php' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsSftpSshRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsServer' },
	head: () => ( { meta: [ { title: __( 'SFTP/SSH' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'sftp-ssh',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.SFTP ) ) {
			queryClient.prefetchQuery( siteSftpUsersQuery( site.ID ) );
		}
		if ( hasHostingFeature( site, HostingFeatures.SSH ) ) {
			queryClient.prefetchQuery( siteSshAccessStatusQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-sftp-ssh' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-sftp-ssh' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsCrontabRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Cron' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'crontab',
} );

const agencySiteSettingsCrontabIndexRoute = createRoute( {
	getParentRoute: () => agencySiteSettingsCrontabRoute,
	path: '/',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.SSH ) ) {
			queryClient.prefetchQuery( siteCrontabsQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-crontab' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-crontab' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsCrontabAddRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Add Scheduled Job' ) } ] } ),
	getParentRoute: () => agencySiteSettingsCrontabRoute,
	path: 'add',
} ).lazy( () =>
	import( '../../sites/settings-crontab/add-crontab' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-crontab-add' )( {
			component: d.default,
		} )
	)
);

const agencySiteSettingsCrontabEditRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Edit scheduled job' ) } ] } ),
	getParentRoute: () => agencySiteSettingsCrontabRoute,
	path: '$cronId/edit',
	parseParams: ( params ) => ( {
		cronId: Number( params.cronId ),
	} ),
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		await queryClient.ensureQueryData( siteCrontabsQuery( site.ID ) );
	},
} ).lazy( () =>
	import( '../../sites/settings-crontab/edit-crontab' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-crontab-edit' )( {
			component: d.default,
		} )
	)
);

const agencySiteSettingsRepositoriesRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsServer' },
	head: () => ( { meta: [ { title: __( 'Repositories' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'repositories',
} );

const agencySiteSettingsRepositoriesIndexRoute = createRoute( {
	getParentRoute: () => agencySiteSettingsRepositoriesRoute,
	path: '/',
	loader: async ( { params: { siteSlug } } ) => {
		queryClient.prefetchQuery( githubInstallationsQuery() );
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		queryClient.prefetchQuery( codeDeploymentsQuery( site.ID ) );
	},
} ).lazy( () =>
	import( '../../sites/settings-repositories' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-repositories' )( {
			component: d.default,
		} )
	)
);

const agencySiteSettingsRepositoriesConnectRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Connect repository' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRepositoriesRoute,
	path: 'connect',
	loader: () => {
		queryClient.prefetchQuery( githubInstallationsQuery() );
	},
} ).lazy( () =>
	import( '../../sites/settings-repositories/connect-repository' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-repositories-connect' )( {
			component: d.default,
		} )
	)
);

const agencySiteSettingsRepositoriesManageRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Configure repository' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRepositoriesRoute,
	path: 'manage/$deploymentId',
	parseParams: ( params ) => ( {
		deploymentId: Number( params.deploymentId ),
	} ),
	loader: async ( { params: { siteSlug, deploymentId } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		await queryClient.ensureQueryData( codeDeploymentQuery( site.ID, deploymentId ) );
	},
} ).lazy( () =>
	import( '../../sites/settings-repositories/configure-repository' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-repositories-manage' )( {
			component: d.default,
		} )
	)
);

const agencySiteSettingsDatabaseRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsServer' },
	head: () => ( { meta: [ { title: __( 'Database' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'database',
} ).lazy( () =>
	import( '../../sites/settings-database' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-database' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsPrimaryDataCenterRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsServer' },
	head: () => ( { meta: [ { title: __( 'Primary data center' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'primary-data-center',
	beforeLoad: async ( { cause, params: { siteSlug } } ) => {
		if ( cause === 'preload' ) {
			return;
		}

		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.PRIMARY_DATA_CENTER ) ) {
			const primaryDataCenter = await queryClient.ensureQueryData(
				sitePrimaryDataCenterQuery( site.ID )
			);
			if ( primaryDataCenter ) {
				return;
			}
		}

		throw redirectAsNotAllowed( { to: agencySiteSettingsRoute.fullPath, params: { siteSlug } } );
	},
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		await queryClient.ensureQueryData( sitePrimaryDataCenterQuery( site.ID ) );
	},
} ).lazy( () =>
	import( '../../sites/settings-primary-data-center' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-primary-data-center' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsStaticFile404Route = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsServer' },
	head: () => ( { meta: [ { title: __( 'Handling requests for nonexistent assets' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'static-file-404',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.STATIC_FILE_404 ) ) {
			await queryClient.ensureQueryData( siteStaticFile404SettingQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-static-file-404' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-static-file-404' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsCachingRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsServer' },
	head: () => ( { meta: [ { title: __( 'Caching' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'caching',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.CACHING ) ) {
			await queryClient.ensureQueryData( siteEdgeCacheStatusQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-caching' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-caching' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsApmRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsServer' },
	head: () => ( { meta: [ { title: __( 'Application Performance Monitoring' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'apm',
} ).lazy( () =>
	import( '../../sites/settings-apm' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-apm' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsWebApplicationFirewallRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsSecurity' },
	head: () => ( { meta: [ { title: __( 'Web Application Firewall (WAF)' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'web-application-firewall',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.SECURITY_SETTINGS ) ) {
			await Promise.all( [
				queryClient.ensureQueryData( siteJetpackModulesQuery( site.ID ) ),
				queryClient.ensureQueryData( siteJetpackSettingsQuery( site.ID ) ),
			] );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-web-application-firewall' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-web-application-firewall' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsWpcomLoginRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsSecurity' },
	head: () => ( { meta: [ { title: __( 'WordPress.com login' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'wpcom-login',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.SECURITY_SETTINGS ) ) {
			await Promise.all( [
				queryClient.ensureQueryData( siteJetpackModulesQuery( site.ID ) ),
				queryClient.ensureQueryData( siteJetpackSettingsQuery( site.ID ) ),
			] );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-wpcom-login' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-wpcom-login' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsDefensiveModeRoute = createRoute( {
	staticData: { requiresSiteTypeSupport: 'settingsSecurity' },
	head: () => ( { meta: [ { title: __( 'Defensive mode' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'defensive-mode',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.DEFENSIVE_MODE ) ) {
			await queryClient.ensureQueryData( siteDefensiveModeSettingsQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-defensive-mode' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-defensive-mode' )( {
			component: () => <d.default siteSlug={ agencySiteRoute.useParams().siteSlug } />,
		} )
	)
);

const agencySiteSettingsTransferSiteRoute = createRoute( {
	head: () => ( { meta: [ { title: __( 'Transfer site' ) } ] } ),
	getParentRoute: () => agencySiteSettingsRoute,
	path: 'transfer-site',
	beforeLoad: async ( { cause, params: { siteSlug } } ) => {
		if ( cause === 'preload' ) {
			return;
		}

		const user = queryClient.getQueryData< User >( AUTH_QUERY_KEY );
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( ! user || ! canTransferSite( site, user ) ) {
			throw redirectAsNotAllowed( { to: agencySiteSettingsRoute.fullPath, params: { siteSlug } } );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-transfer-site' ).then( ( d ) =>
		createLazyRoute( 'agency-site-settings-transfer-site' )( {
			component: () => (
				<d.default siteSlug={ agencySiteRoute.useParams().siteSlug } context="dashboard_v2" />
			),
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
			agencySiteMonitoringRoute,
			agencySiteLogsRoute.addChildren( [ agencySiteLogsIndexRoute, agencySiteActivityRoute ] ),
			agencySiteSettingsRoute.addChildren( [
				agencySiteSettingsIndexRoute,
				agencySiteSettingsTransferSiteRoute,

				// General
				agencySiteSettingsSiteVisibilityRoute,
				agencySiteSettingsAIToolsRoute.addChildren( [
					agencySiteSettingsAIToolsIndexRoute,
					agencySiteSettingsAIToolsReadRoute,
					agencySiteSettingsAIToolsWriteRoute,
					agencySiteSettingsAIToolsSetupRoute,
				] ),
				agencySiteSettingsSubscriptionGiftingRoute,
				agencySiteSettingsAgencyRoute,
				agencySiteSettingsHundredYearPlanRoute,
				agencySiteSettingsRedirectRoute,

				// Server
				agencySiteSettingsWordPressRoute,
				agencySiteSettingsPHPRoute,
				agencySiteSettingsSftpSshRoute,
				agencySiteSettingsCrontabRoute.addChildren( [
					agencySiteSettingsCrontabIndexRoute,
					agencySiteSettingsCrontabAddRoute,
					agencySiteSettingsCrontabEditRoute,
				] ),
				agencySiteSettingsRepositoriesRoute.addChildren( [
					agencySiteSettingsRepositoriesIndexRoute,
					agencySiteSettingsRepositoriesConnectRoute,
					agencySiteSettingsRepositoriesManageRoute,
				] ),
				agencySiteSettingsDatabaseRoute,
				agencySiteSettingsPrimaryDataCenterRoute,
				agencySiteSettingsStaticFile404Route,
				agencySiteSettingsCachingRoute,
				...( isEnabled( 'performance/apm' ) ? [ agencySiteSettingsApmRoute ] : [] ),

				// Security
				agencySiteSettingsWebApplicationFirewallRoute,
				agencySiteSettingsWpcomLoginRoute,
				agencySiteSettingsDefensiveModeRoute,
			] ),
		] ),
	] ),
];
