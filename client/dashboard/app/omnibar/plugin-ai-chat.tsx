import {
	closeAgentsManagerChat,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
	recordAgentsManagerTracksEvent,
	useShouldUseUnifiedAgent,
} from '@automattic/agents-manager';
import { useMemo } from 'react';
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
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();
	const aiChatNode = adminBarNodes.find( ( node ) => node.id === AI_CHAT_NODE_ID );
	const icon = useMemo(
		() => adminBarIcon( 'omnibar__ai-chat-icon', aiChatNode?.meta?.icon ),
		[ aiChatNode?.meta?.icon ]
	);

	if ( ! shouldUseUnifiedAgent || ! aiChatNode ) {
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
		icon,
		tooltip: aiChatNode.meta?.menu_title,
		className: 'masterbar__item-agents-manager-ai-chat',
		onClick: handleClick,
	};
}
