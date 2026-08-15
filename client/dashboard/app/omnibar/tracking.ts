import { transformOmnibarNodes } from '@automattic/omnibar';
import { useCallback } from 'react';
import { useAnalytics } from '../analytics';
import type { OmnibarNodes } from '@automattic/omnibar';

export const RESPONSIVE_MENU_NODE_ID = 'responsive-menu';

const LEGACY_MASTERBAR_EVENTS: Record< string, string > = {
	[ RESPONSIVE_MENU_NODE_ID ]: 'calypso_masterbar_menu_clicked',
	'wp-logo': 'calypso_masterbar_my_sites_clicked',
	'wpcom-sites': 'calypso_masterbar_sites_clicked',
	'wpcom-domains': 'calypso_masterbar_domains_clicked',
	about: 'calypso_masterbar_about_wordpress_clicked',
	contribute: 'calypso_masterbar_get_involved_clicked',
	'view-site': 'calypso_masterbar_visit_site_clicked',
	'wpcom-stats': 'calypso_masterbar_stats_clicked',
	'site-plan-badge': 'calypso_masterbar_plan_clicked',
	'new-post': 'calypso_masterbar_new_post_clicked',
	'new-media': 'calypso_masterbar_new_media_clicked',
	'new-page': 'calypso_masterbar_new_page_clicked',
	'new-user': 'calypso_masterbar_new_user_clicked',
	stats: 'calypso_masterbar_stats_sparkline_clicked',
	reader: 'calypso_masterbar_reader_clicked',
	'my-account': 'calypso_masterbar_me_clicked',
	'user-info': 'calypso_masterbar_edit_profile_clicked',
	logout: 'calypso_masterbar_log_out_clicked',
	'my-wpcom-account': 'calypso_masterbar_wpcom_account_clicked',
};

export type RecordOmnibarNodeClick = ( nodeId: string ) => void;

export function useRecordOmnibarNodeClick(): RecordOmnibarNodeClick {
	const { recordTracksEvent } = useAnalytics();

	return useCallback(
		( nodeId: string ) => {
			recordTracksEvent( 'calypso_omnibar_node_click', {
				node_id: nodeId,
			} );

			const legacyEvent = LEGACY_MASTERBAR_EVENTS[ nodeId ];
			if ( legacyEvent ) {
				// Also fire old event to not lose old data.
				recordTracksEvent( legacyEvent );
			}
		},
		[ recordTracksEvent ]
	);
}

export function trackOmnibarNodes(
	nodes: OmnibarNodes,
	recordNodeClick: RecordOmnibarNodeClick
): OmnibarNodes {
	return transformOmnibarNodes( nodes, ( node ) => {
		if ( ! node.id ) {
			return node;
		}

		return {
			...node,
			onClick: ( event: React.MouseEvent ) => {
				recordNodeClick( node.id );
				node.onClick?.( event );
			},
		};
	} );
}
