import React from 'react';
import { AgentChatProvider } from '../context/AgentChatContext';
import { registerStore } from '../store';
import type { AgentChatProps } from '../types';
import { Chat } from './chat/Chat';

// Register store immediately when module is loaded
registerStore();

/**
 * AgentChat - The main consumer-facing component that provides the simple API.
 *
 * Usage:
 * <AgentChat
 *   agentId="big-sky"
 *   agentUrl="https://public-api.wordpress.com/wpcom/v2/ai/agent"
 *   sessionId={`dev-session-${Date.now()}`}
 *   contextProvider={contextProvider}
 *   toolProvider={toolProvider}
 * />
 * @param root0
 * @param root0.agentId
 * @param root0.agentUrl
 * @param root0.sessionId
 * @param root0.contextProvider
 * @param root0.toolProvider
 * @param root0.variant
 * @param root0.triggerIcon
 * @param root0.placeholder
 * @param root0.notice
 * @param root0.onOpen
 * @param root0.onExpand
 * @param root0.emptyView
 * @param root0.authProvider
 * @param root0.onClose
 * @param root0.chatState
 */
export const AgentChat: React.FC< AgentChatProps > = ( {
	agentId,
	agentUrl,
	sessionId,
	contextProvider,
	toolProvider,
	authProvider,
	variant = 'floating',
	triggerIcon,
	placeholder,
	notice,
	onOpen,
	onExpand,
	onClose,
	emptyView,
	chatState,
} ) => {
	return (
		<AgentChatProvider
			agentId={ agentId }
			agentUrl={ agentUrl }
			sessionId={ sessionId }
			contextProvider={ contextProvider }
			toolProvider={ toolProvider }
			authProvider={ authProvider }
		>
			<Chat
				variant={ variant }
				triggerIcon={ triggerIcon }
				placeholder={ placeholder }
				notice={ notice }
				onOpen={ onOpen }
				onExpand={ onExpand }
				onClose={ onClose }
				emptyView={ emptyView }
				chatState={ chatState }
			/>
		</AgentChatProvider>
	);
};

export default AgentChat;
