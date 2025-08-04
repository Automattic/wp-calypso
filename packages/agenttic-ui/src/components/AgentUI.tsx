import React from 'react';
import type { AgentUIProps } from '../types';
import { Chat } from './chat/Chat';
import { cn } from '../utils/classNames';

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
 * @param props.placeholder
 * @param props.notice
 * @param props.onOpen
 * @param props.onExpand
 * @param props.onClose
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
export const AgentUI: React.FC< AgentUIProps > = ( {
	messages,
	isProcessing,
	error,
	onSubmit,
	variant = 'floating',
	triggerIcon,
	placeholder,
	notice,
	emptyView,
	onOpen,
	onExpand,
	onClose,
	floatingChatState,
	suggestions,
	clearSuggestions,
	messageRenderer,
	className,
} ) => {
	return (
		<div className={ cn( 'agenttic-ui', className ) }>
			<Chat
				messages={ messages }
				isProcessing={ isProcessing }
				error={ error }
				onSubmit={ onSubmit }
				variant={ variant }
				triggerIcon={ triggerIcon }
				placeholder={ placeholder }
				notice={ notice }
				emptyView={ emptyView }
				onOpen={ onOpen }
				onExpand={ onExpand }
				onClose={ onClose }
				floatingChatState={ floatingChatState }
				suggestions={ suggestions }
				clearSuggestions={ clearSuggestions }
				messageRenderer={ messageRenderer }
			/>
		</div>
	);
};

export default AgentUI;
