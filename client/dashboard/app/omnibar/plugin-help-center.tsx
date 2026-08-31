import {
	closeAgentsManagerChat,
	getAgentsManagerChatRoute,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
	useShouldUseUnifiedAgent,
} from '@automattic/agents-manager';
import { omnibarSiteIdQuery } from '@automattic/api-queries';
// eslint-disable-next-line no-restricted-imports -- Help Center host events need explicit site attribution.
import { withSiteContext } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useAnalytics } from '../analytics';
import { useHelpCenter } from '../help-center';
import { adminBarIcon } from './admin-bar-icon';
import type { AnalyticsClient } from '../analytics';
import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

import './plugin-help-center.scss';

type RecordTracksEvent = AnalyticsClient[ 'recordTracksEvent' ];

const AGENTS_MANAGER_NODE_ID = 'agents-manager';
const SECONDARY_GROUP_NODE_ID = 'agents-manager-menu-panel-links';

function HelpIcon() {
	return (
		<span className="omnibar__help-icon">
			<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 16v-2h2v2h-2zm2-3v-1.141A3.991 3.991 0 0016 10a4 4 0 00-8 0h2c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2a1 1 0 00-1 1v2h2z"
				/>
			</svg>
		</span>
	);
}

function handleMenuClick(
	recordTracksEvent: RecordTracksEvent,
	destination: string,
	omnibarSiteId: number | null | undefined,
	sectionName: string | undefined,
	isExternal = false
) {
	// Re-clicking the current route closes the chat; external links never do.
	const isClosing =
		! isExternal && isAgentsManagerChatVisible() && getAgentsManagerChatRoute() === destination;

	recordTracksEvent( 'calypso_dashboard_help_center_menu_panel_click', {
		section: sectionName,
		destination,
		action: isClosing ? 'close' : 'open',
	} );

	if ( isExternal ) {
		window.open( destination, '_blank', 'noopener,noreferrer' );
		return;
	}

	if ( isClosing ) {
		recordTracksEvent(
			'calypso_inlinehelp_close',
			withSiteContext(
				{
					location: 'help-center',
					section: sectionName,
				},
				'omnibar',
				omnibarSiteId
			)
		);
		closeAgentsManagerChat();
		return;
	}

	// `/chat` resumes the active conversation (no path), matching the AI button;
	// other items open the chat at their own route.
	openAgentsManagerChat( destination === '/chat' ? undefined : destination );

	recordTracksEvent(
		'calypso_inlinehelp_show',
		withSiteContext(
			{
				location: 'help-center',
				section: sectionName,
				destination,
			},
			'omnibar',
			omnibarSiteId
		)
	);
}

function buildAgentsManagerMenuNodes(
	adminBarNodes: AdminBarNode[],
	recordTracksEvent: RecordTracksEvent,
	omnibarSiteId: number | null | undefined,
	sectionName: string | undefined
): OmnibarNode[] {
	return adminBarNodes
		.filter( ( node ) => node.group && node.parent === AGENTS_MANAGER_NODE_ID )
		.map(
			( group ): OmnibarNode => ( {
				id: group.id,
				group: true,
				// Not keyed on `ab-sub-secondary`: wp-admin marks both groups with it, Calypso shades one.
				...( group.id === SECONDARY_GROUP_NODE_ID ? { variant: 'secondary' as const } : {} ),
				children: adminBarNodes
					.filter( ( node ) => node.parent === group.id && ( node.meta?.route || node.href ) )
					.map( ( node ): OmnibarNode => {
						const route = node.meta?.route;
						const destination = route ?? localizeUrl( node.href );

						return {
							id: node.id,
							title: node.meta?.menu_title,
							icon: adminBarIcon( 'omnibar__help-menu-icon', node.meta?.icon ),
							onClick: () =>
								handleMenuClick(
									recordTracksEvent,
									destination,
									omnibarSiteId,
									sectionName,
									! route
								),
						};
					} ),
			} )
		);
}

export function useHelpCenterPlugin( {
	sectionName,
	adminBarNodes,
}: {
	sectionName?: string;
	adminBarNodes: AdminBarNode[];
} ): OmnibarNode {
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();
	const { isShown: isHelpCenterShown, setShowHelpCenter } = useHelpCenter();
	const { recordTracksEvent } = useAnalytics();
	const { data: omnibarSiteId } = useQuery( omnibarSiteIdQuery() );

	const helpNode = adminBarNodes.find( ( node ) => node.id === AGENTS_MANAGER_NODE_ID );

	// Building the menu parses an SVG per node, and this runs on every omnibar render.
	const children = useMemo(
		() =>
			buildAgentsManagerMenuNodes( adminBarNodes, recordTracksEvent, omnibarSiteId, sectionName ),
		[ adminBarNodes, recordTracksEvent, omnibarSiteId, sectionName ]
	);
	const icon = useMemo(
		() => adminBarIcon( 'omnibar__help-icon', helpNode?.meta?.icon ),
		[ helpNode?.meta?.icon ]
	);

	if ( shouldUseUnifiedAgent && helpNode ) {
		return {
			id: helpNode.id,
			label: helpNode.meta?.menu_title,
			icon,
			tooltip: helpNode.meta?.menu_title,
			// Disconnected sites get a link instead of a dropdown, opened in a new tab as in wp-admin.
			...( children.length
				? { children }
				: { href: helpNode.href, target: helpNode.meta?.target, rel: helpNode.meta?.rel } ),
		};
	}

	return {
		id: 'help-center',
		label: __( 'Help' ),
		icon: <HelpIcon />,
		onClick: () => setShowHelpCenter( ! isHelpCenterShown ),
	};
}
