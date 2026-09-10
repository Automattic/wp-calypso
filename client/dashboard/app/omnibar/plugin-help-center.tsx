import {
	closeAgentsManagerChat,
	getAgentsManagerChatRoute,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
} from '@automattic/agents-manager';
import { omnibarSiteIdQuery } from '@automattic/api-queries';
// eslint-disable-next-line no-restricted-imports -- Help Center host events need explicit site attribution.
import { withSiteContext } from '@automattic/calypso-analytics';
import { HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT } from '@automattic/help-center/src/experiments';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import { useAnalytics } from '../analytics';
import { useHelpCenter } from '../help-center';
import { adminBarIcon } from './admin-bar-icon';
import type { AnalyticsClient } from '../analytics';
import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

import './plugin-help-center.scss';

type RecordTracksEvent = AnalyticsClient[ 'recordTracksEvent' ];

const AGENTS_MANAGER_NODE_ID = 'agents-manager';
const SECONDARY_GROUP_NODE_ID = 'agents-manager-menu-panel-links';

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
							icon: adminBarIcon( node.meta?.icon, 'omnibar__help-menu-icon' ),
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

function HelpCenterIcon( { name, sectionName }: { name?: string; sectionName?: string } ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: omnibarSiteId } = useQuery( omnibarSiteIdQuery() );
	// Loaded here rather than in the hook so ExPlat exposure covers everyone who sees
	// the entry point, not only users who open the Help Center.
	const [ isLoadingGetHelpChatForwardAssignment, getHelpChatForwardAssignment ] = useExperiment(
		HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT
	);

	// One impression per section view, so it divides cleanly into the click events
	// this plugin records; site context is whatever has resolved by then. Held until
	// the assignment settles, so impressions and clicks split by the same arm.
	useEffect( () => {
		if ( isLoadingGetHelpChatForwardAssignment ) {
			return;
		}

		recordTracksEvent(
			'calypso_inlinehelp_impression',
			withSiteContext(
				{
					location: 'help-center',
					entry_point: 'omnibar',
					section: sectionName,
					get_help_chat_forward_variation: getHelpChatForwardAssignment?.variationName ?? null,
					is_get_help_chat_forward_assignment_loaded: ! isLoadingGetHelpChatForwardAssignment,
				},
				'omnibar',
				omnibarSiteId
			)
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ sectionName, isLoadingGetHelpChatForwardAssignment ] );

	return adminBarIcon( name, 'omnibar__help-icon' );
}

export function useHelpCenterPlugin( {
	sectionName,
	adminBarNodes,
}: {
	sectionName?: string;
	adminBarNodes: AdminBarNode[];
} ): OmnibarNode {
	const { isShown: isHelpCenterShown, setShowHelpCenter } = useHelpCenter();
	const { recordTracksEvent } = useAnalytics();
	const { data: omnibarSiteId } = useQuery( omnibarSiteIdQuery() );

	const helpNode = adminBarNodes.find( ( node ) => node.id === AGENTS_MANAGER_NODE_ID );

	// The backend only sends these nodes to eligible users, so their presence is the gate.
	if ( helpNode ) {
		const children = buildAgentsManagerMenuNodes(
			adminBarNodes,
			recordTracksEvent,
			omnibarSiteId,
			sectionName
		);

		return {
			id: helpNode.id,
			label: helpNode.meta?.menu_title,
			icon: <HelpCenterIcon name={ helpNode.meta?.icon } sectionName={ sectionName } />,
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
		icon: <HelpCenterIcon name="help" sectionName={ sectionName } />,
		onClick: () => setShowHelpCenter( ! isHelpCenterShown ),
	};
}
