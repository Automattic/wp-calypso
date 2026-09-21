import {
	AiChatEntryLabel,
	closeAgentsManagerChat,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
	recordAgentsManagerTracksEvent,
} from '@automattic/agents-manager';
import { adminBarIcon } from './admin-bar-icon';
import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

import './plugin-ai-chat.scss';

const FALLBACK_AI_CHAT_NODE: AdminBarNode = {
	id: 'agents-manager-ai-chat',
	title: 'Agent',
	parent: 'top-secondary',
	href: '',
	group: false,
	meta: {
		menu_title: 'Agent',
		icon: 'sparkle',
	},
};

/**
 * Supplies the standard Agent entry when Calypso loads Agents Manager but the site's admin-bar
 * response does not yet provide the Jetpack node.
 */
export function ensureAiChatNode( nodes: AdminBarNode[], enabled: boolean ): AdminBarNode[] {
	if ( ! enabled || nodes.some( ( node ) => node.id === FALLBACK_AI_CHAT_NODE.id ) ) {
		return nodes;
	}

	return [ ...nodes, FALLBACK_AI_CHAT_NODE ];
}

export function createAiChatNodeBuilder( sectionName?: string ) {
	return ( adminBarNode: AdminBarNode ): Partial< OmnibarNode > => ( {
		title: undefined,
		label: adminBarNode.meta?.menu_title,
		icon: adminBarIcon( adminBarNode.meta?.icon, 'omnibar__ai-chat-icon' ),
		tooltip: adminBarNode.meta?.menu_title,
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
	} );
}
