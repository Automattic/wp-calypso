import {
	AiChatEntryLabel,
	closeAgentsManagerChat,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
	recordAgentsManagerTracksEvent,
} from '@automattic/agents-manager';
import { omnibarAgentsManagerEnabledQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { adminBarIcon } from '../admin-bar-icon';
import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

import './style.scss';

export function useAiChatNode( {
	sectionName,
	adminBarNodes,
}: {
	sectionName?: string;
	adminBarNodes: AdminBarNode[];
} ): {
	node?: OmnibarNode;
} {
	const { data: enabled = false } = useQuery( omnibarAgentsManagerEnabledQuery() );

	if ( ! enabled ) {
		return {};
	}

	const adminBarNode = adminBarNodes.find( ( node ) => node.id === 'agents-manager-ai-chat' );
	const label = adminBarNode?.meta?.menu_title || __( 'Agent' );

	return {
		node: {
			id: 'agents-manager-ai-chat',
			title: undefined,
			label,
			icon: adminBarIcon( adminBarNode?.meta?.icon ?? 'sparkle', 'omnibar__ai-chat-icon' ),
			tooltip: label,
			className: 'masterbar__item-agents-manager-ai-chat',
			render: ( { icon, label } ) => (
				<>
					{ icon }
					<AiChatEntryLabel>{ label }</AiChatEntryLabel>
				</>
			),
			onClick: () => {
				const isChatVisible = isAgentsManagerChatVisible();

				recordAgentsManagerTracksEvent( 'calypso_agents_manager_ai_chat_clicked', {
					surface: 'masterbar',
					section: sectionName || 'unknown',
					action: isChatVisible ? 'close' : 'open',
				} );

				if ( isChatVisible ) {
					closeAgentsManagerChat();
				} else {
					openAgentsManagerChat();
				}
			},
		},
	};
}
