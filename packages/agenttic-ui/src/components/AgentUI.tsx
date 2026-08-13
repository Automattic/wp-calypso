import React from 'react';
import type { AgentUIProps } from '../types';
import { cn } from '../utils/classNames';
import { AgentUIContainer } from './AgentUIContainer';
import { AgentUIHeader } from './composable/AgentUIHeader';
import { AgentUIMessages } from './composable/AgentUIMessages';
import { AgentUIInput } from './composable/AgentUIInput';
import { AgentUISuggestions } from './composable/AgentUISuggestions';
import { AgentUINotice } from './composable/AgentUINotice';
import { AgentUIFooter } from './composable/AgentUIFooter';
import { AgentUIConversationView } from './composable/AgentUIConversationView';
import { AgentUIInputToolbar } from './composable/AgentUIInputToolbar';

/**
 * AgentUI - Pure UI component for chat interface
 *
 * This component ONLY handles UI concerns. It receives all data and callbacks
 * as props, making it completely framework-agnostic and reusable.
 *
 * Usage:
 *
 * ```tsx
 * import { useAgentChat } from '@automattic/agenttic-client';
 * import { AgentUI } from '@automattic/agenttic-ui';
 *
 * function ChatComponent() {
 *   const {
 *     messages,
 *     isProcessing,
 *     error,
 *     onSubmit,
 *     suggestions,
 *     clearSuggestions
 *   } = useAgentChat({
 *     agentId: 'your-agent-id',
 *     contextProvider,
 *     toolProvider
 *   });
 *
 *   return (
 *     <AgentUI
 *       messages={messages}
 *       isProcessing={isProcessing}
 *       error={error}
 *       onSubmit={onSubmit}
 *       suggestions={suggestions}
 *       clearSuggestions={clearSuggestions}
 *       variant="floating"
 *       placeholder="Ask anything..."
 *     />
 *   );
 * }
 * ```
 *
 * @param props                   - UI-only props for chat interface
 * @param props.variant
 * @param props.triggerIcon
 * @param props.triggerTitle
 * @param props.placeholder
 * @param props.notice
 * @param props.onOpen
 * @param props.onExpand
 * @param props.onClose
 * @param props.onStop
 * @param props.emptyView
 * @param props.messages
 * @param props.isProcessing
 * @param props.error
 * @param props.onSubmit
 * @param props.suggestions
 * @param props.clearSuggestions
 * @param props.messageRenderer
 * @param props.floatingChatState
 * @param props.className         - Additional CSS classes to apply to the component
 */
const AgentUINamespace = {
	// Core container with state management
	Container: AgentUIContainer,

	// Individual composable components
	Header: AgentUIHeader,
	Messages: AgentUIMessages,
	Input: AgentUIInput,
	Suggestions: AgentUISuggestions,
	Notice: AgentUINotice,
	InputToolbar: AgentUIInputToolbar,

	// Convenience wrappers
	Footer: AgentUIFooter,
	ConversationView: AgentUIConversationView,
};

// Main convenience wrapper - provides current API with new composable architecture
export const AgentUI: React.FC< AgentUIProps > & typeof AgentUINamespace =
	Object.assign(
		( props: AgentUIProps ) => (
			<AgentUIContainer
				{ ...props }
				className={ cn( 'agenttic', props.className ) }
			>
				<AgentUIConversationView
					showHeader={ props.variant === 'floating' }
				/>
			</AgentUIContainer>
		),
		AgentUINamespace
	);

export default AgentUI;
