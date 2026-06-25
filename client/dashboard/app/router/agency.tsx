import {
	activeAgencyQuery,
	agencyQuery,
	agencyResourcesQuery,
	mcpSettingsQuery,
	queryClient,
} from '@automattic/api-queries';
import { createRoute, createLazyRoute } from '@tanstack/react-router';
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

		const agency = await queryClient.ensureQueryData( agencyQuery() );
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

export const createAgencyRoutes = () => [
	agencyRoute.addChildren( [
		agencyOverviewRoute,
		agencyTiersRoute,
		exclusiveOffersRoute,
		learnRoute,
		mcpRoute.addChildren( [ mcpOverviewRoute, mcpAvailableToolsRoute, mcpConnectRoute ] ),
	] ),
];
