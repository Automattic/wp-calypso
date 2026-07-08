import { __ } from '@wordpress/i18n';
import type { Site } from '@automattic/api-core';
import type { AdminBarNode } from '@automattic/omnibar';

const SITE_NAME_NODE_ID = 'site-name';
const DASHBOARD_NODE_ID = 'dashboard';
const STATS_NODE_ID = 'stats';

const isSiteDashboardNode = ( node: AdminBarNode ) =>
	node.parent === SITE_NAME_NODE_ID &&
	( node.id === DASHBOARD_NODE_ID ||
		node.title === 'Dashboard' ||
		node.meta?.menu_title === 'Dashboard' );

const getStatsAdminUrl = ( dashboardUrl: string ) =>
	`${ dashboardUrl.replace( /\/?$/, '/' ) }admin.php?page=stats`;

export function canSiteUserAccessStats( site?: Site | null ): boolean {
	// Keep this aligned with the Stats page loader while view_stats can be incomplete.
	return !! ( site?.capabilities?.view_stats || site?.capabilities?.manage_options );
}

export function addStatsNodeToSiteMenu(
	adminBarNodes: AdminBarNode[],
	canUserAccessStats: boolean
): AdminBarNode[] {
	if ( ! canUserAccessStats ) {
		return adminBarNodes;
	}

	const dashboardNode = adminBarNodes.find( isSiteDashboardNode );

	if ( ! dashboardNode?.href ) {
		return adminBarNodes;
	}

	const statsAdminUrl = getStatsAdminUrl( dashboardNode.href );
	const hasStatsNode = adminBarNodes.some(
		( node ) =>
			node.parent === SITE_NAME_NODE_ID &&
			( node.id === STATS_NODE_ID || node.href === statsAdminUrl )
	);

	if ( hasStatsNode ) {
		return adminBarNodes;
	}

	const statsNode: AdminBarNode = {
		id: STATS_NODE_ID,
		title: __( 'Stats' ),
		parent: SITE_NAME_NODE_ID,
		href: statsAdminUrl,
		group: dashboardNode.group,
		meta: {
			menu_title: __( 'Stats' ),
		},
	};

	return [ ...adminBarNodes, statsNode ];
}
