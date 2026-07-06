import {
	activeAgencyQuery,
	agencyQuery,
	agencyResourcesQuery,
	agencySiteQuery,
	mcpSettingsQuery,
	queryClient,
	rawUserPreferencesQuery,
} from '@automattic/api-queries';
import { createRoute, createLazyRoute, notFound } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { redirectAsNotAllowed } from './redirect';
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

export const createAgencyRoutes = () => [
	agencyRoute.addChildren( [
		agencyOverviewRoute,
		agencyTiersRoute,
		exclusiveOffersRoute,
		learnRoute,
		mcpRoute.addChildren( [ mcpOverviewRoute, mcpAvailableToolsRoute, mcpConnectRoute ] ),
		agencySitesRoute,
		earnOverviewRoute,
		earnReferralsRoute,
		earnWooPaymentsRoute,
		earnMigrationsRoute,
		earnPayoutSettingsRoute,
		agencySiteRoute.addChildren( [ agencySiteOverviewRoute ] ),
	] ),
];
