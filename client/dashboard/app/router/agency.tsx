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
	agencySitesWithPluginsQuery,
	agencyWooPaymentsDataQuery,
	jetpackAgencyLicensesQuery,
	mcpSettingsQuery,
	queryClient,
	rawUserPreferencesQuery,
	referralsQuery,
	referralCommissionPayoutQuery,
	tipaltiPayeeQuery,
} from '@automattic/api-queries';
import { createRoute, createLazyRoute, Outlet } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { redirectAsNotAllowed } from './redirect';
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

// Guards agency pages: blocks client users and enforces the matched routes'
// team-member capabilities. Shared with the agency sites route group, which
// registers separately from the agency pages.
export const agencyRouteGuard = async ( {
	cause,
	matches,
}: {
	cause: string;
	matches: ReadonlyArray< { staticData?: StaticDataRouteOption } >;
} ) => {
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
};

// Pathless layout route that guards every agency route (blocks client users).
const agencyRoute = createRoute( {
	getParentRoute: () => rootRoute,
	id: 'agency',
	beforeLoad: agencyRouteGuard,
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

export const createAgencyRoutes = () => [
	agencyRoute.addChildren( [
		agencyOverviewRoute,
		agencyTiersRoute,
		exclusiveOffersRoute,
		learnRoute,
		mcpRoute.addChildren( [ mcpOverviewRoute, mcpAvailableToolsRoute, mcpConnectRoute ] ),
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
	] ),
];
