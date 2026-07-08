import { __ } from '@wordpress/i18n';
import type { Site } from '@automattic/api-core';
import type { AdminBarNode } from '@automattic/omnibar';

const SITE_NAME_NODE_ID = 'site-name';
const STATS_NODE_ID = 'stats';
// wpcom-stats / jetpack-stats are the ids WPCOM/Jetpack use for their own site-menu Stats
// node when it's present (e.g. wp_before_admin_bar_render on a real wp-admin toolbar). The
// admin-bar REST endpoint doesn't currently emit either, but guard against future duplication.
const KNOWN_STATS_NODE_IDS = new Set( [ STATS_NODE_ID, 'wpcom-stats', 'jetpack-stats' ] );

export const getStatsAdminUrl = ( siteAdminUrl: string ) =>
	`${ siteAdminUrl.replace( /\/?$/, '/' ) }admin.php?page=stats`;

export function canSiteUserAccessStats( site?: Site | null ): boolean {
	// Keep this aligned with the Stats page loader while view_stats can be incomplete.
	return !! ( site?.capabilities?.view_stats || site?.capabilities?.manage_options );
}

export function addStatsNodeToSiteMenu(
	adminBarNodes: AdminBarNode[],
	canUserAccessStats: boolean,
	siteAdminUrl?: string | null
): AdminBarNode[] {
	if ( ! canUserAccessStats || ! siteAdminUrl ) {
		return adminBarNodes;
	}

	const statsAdminUrl = getStatsAdminUrl( siteAdminUrl );
	const hasStatsNode = adminBarNodes.some(
		( node ) =>
			node.parent === SITE_NAME_NODE_ID &&
			( KNOWN_STATS_NODE_IDS.has( node.id ) || node.href === statsAdminUrl )
	);

	if ( hasStatsNode ) {
		return adminBarNodes;
	}

	const statsNode: AdminBarNode = {
		id: STATS_NODE_ID,
		title: __( 'Stats' ),
		parent: SITE_NAME_NODE_ID,
		href: statsAdminUrl,
		group: false,
		meta: {
			menu_title: __( 'Stats' ),
		},
	};

	return [ ...adminBarNodes, statsNode ];
}
