import {
	activeAgencyQuery,
	agencyProductsQuery,
	agencyResourcesQuery,
	mcpSettingsQuery,
	queryClient,
	rawUserPreferencesQuery,
	referralsQuery,
	referralCommissionPayoutQuery,
} from '@automattic/api-queries';
import { createRoute, createLazyRoute, Outlet } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { redirectAsNotAllowed } from './redirect';
import { rootRoute } from './root';

// Pathless layout route for the agency-level pages. The client-user guard
// lives on the root route so it also covers the shared /sites tree.
const agencyRoute = createRoute( {
	getParentRoute: () => rootRoute,
	id: 'agency',
	beforeLoad: async ( { cause } ) => {
		if ( cause === 'preload' ) {
			return;
		}

		await queryClient.ensureQueryData( activeAgencyQuery() );
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

// `/earn/referrals/$referralId` – referral (client) detail view; hosts the tab routes
export const earnReferralRoute = createRoute( {
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
