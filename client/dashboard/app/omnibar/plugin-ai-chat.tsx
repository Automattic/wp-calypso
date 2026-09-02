import {
	closeAgentsManagerChat,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
	recordAgentsManagerTracksEvent,
} from '@automattic/agents-manager';
import { adminBarIcon } from './admin-bar-icon';
import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

import './plugin-ai-chat.scss';

export function createAiChatNodeBuilder( sectionName?: string ) {
	return ( adminBarNode: AdminBarNode ): Partial< OmnibarNode > => ( {
		title: undefined,
		label: adminBarNode.meta?.menu_title,
		icon: adminBarIcon( adminBarNode.meta?.icon, 'omnibar__ai-chat-icon' ),
		tooltip: adminBarNode.meta?.menu_title,
		className: 'masterbar__item-agents-manager-ai-chat',
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
	} );
}
