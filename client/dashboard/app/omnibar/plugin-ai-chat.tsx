import {
	AiChatEntryLabel,
	closeAgentsManagerChat,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
	recordAgentsManagerTracksEvent,
} from '@automattic/agents-manager';
import { __ } from '@wordpress/i18n';
import { adminBarIcon } from './admin-bar-icon';
import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

import './plugin-ai-chat.scss';

export function buildAiChatPluginNode( {
	enabled,
	sectionName,
	adminBarNodes,
}: {
	enabled: boolean;
	sectionName?: string;
	adminBarNodes: AdminBarNode[];
} ): OmnibarNode | undefined {
	if ( ! enabled ) {
		return undefined;
	}

	const adminBarNode = adminBarNodes.find( ( node ) => node.id === 'agents-manager-ai-chat' );
	const label = adminBarNode?.meta?.menu_title || __( 'Agent' );

	return {
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
	};
}
