import {
	closeAgentsManagerChat,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
	recordAgentsManagerTracksEvent,
} from '@automattic/agents-manager';
import { adminBarIcon } from './admin-bar-icon';
import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

import './plugin-ai-chat.scss';

const AI_CHAT_NODE_ID = 'agents-manager-ai-chat';

export function useAiChatPlugin( {
	sectionName,
	adminBarNodes,
}: {
	sectionName?: string;
	adminBarNodes: AdminBarNode[];
} ): OmnibarNode | undefined {
	const aiChatNode = adminBarNodes.find( ( node ) => node.id === AI_CHAT_NODE_ID );
	// The backend only sends this node to eligible users, so its presence is the gate.
	if ( ! aiChatNode ) {
		return undefined;
	}

	const handleClick = () => {
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
	};

	return {
		id: aiChatNode.id,
		label: aiChatNode.meta?.menu_title,
		icon: adminBarIcon( aiChatNode.meta?.icon, 'omnibar__ai-chat-icon' ),
		tooltip: aiChatNode.meta?.menu_title,
		className: 'masterbar__item-agents-manager-ai-chat',
		onClick: handleClick,
	};
}
