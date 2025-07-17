import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect } from '@wordpress/element';
import { useAgentChatContext } from '../context/AgentChatContext';
import { STORE_NAME } from '../store';

/**
 * Main hook for consuming the agent chat store
 * Provides a clean interface for components to interact with the agent
 * Configuration is now provided via AgentChatProvider context
 */
export const useAgentChat = () => {
	const { agentConfig } = useAgentChatContext();
	const {
		agentConfig: config,
		contextProvider,
		toolProvider,
		authProvider,
	} = agentConfig;

	// Store selectors
	const {
		messages,
		isThinking,
		isSendingMessage,
		isTyping,
		error,
		assistant,
		pendingToolCallbacks,
		currentToolCall,
	} = useSelect( ( select: any ) => {
		const store = select( STORE_NAME );
		return {
			messages: store.getMessages(),
			isThinking: store.getIsThinking(),
			isSendingMessage: store.getIsSendingMessage(),
			isTyping: store.getIsTyping(),
			error: store.getError(),
			assistant: store.getAssistant(),
			pendingToolCallbacks: store.getPendingToolCallbacks(),
			currentToolCall: store.getCurrentToolCall(),
		};
	}, [] );

	// Store actions
	const {
		runAgent,
		addUserMessage,
		assistantSay,
		addMessage,
		deleteMessage,
		clearMessages,
		setThinking,
		setError,
		clearAgents,
		removeAgent,
		resetConversation,
	} = useDispatch( STORE_NAME );

	// Send message function
	const sendMessage = useCallback(
		async ( message: string ) => {
			try {
				await runAgent( message, {
					agentKey: `${ config.agentId }-${ config.sessionId }`,
					sessionId: config.sessionId,
					agentId: config.agentId,
					agentUrl: config.agentUrl,
					contextProvider,
					toolProvider,
					authProvider,
				} );
			} catch ( sendError ) {
				console.error( 'Failed to send message:', sendError );
			}
		},
		[ runAgent, config, contextProvider, toolProvider, authProvider ]
	);

	// Clear conversation
	const clearConversation = useCallback( () => {
		clearMessages();
		setError( null );
	}, [ clearMessages, setError ] );

	// Reset agent conversation
	const resetAgentConversation = useCallback( () => {
		const agentKey = `${ config.agentId }-${ config.sessionId }`;
		resetConversation( agentKey );
		clearMessages();
	}, [ resetConversation, clearMessages, config ] );

	// Cleanup on unmount
	useEffect( () => {
		const agentKey = `${ config.agentId }-${ config.sessionId }`;
		return () => {
			removeAgent( agentKey );
		};
	}, [ removeAgent, config.agentId, config.sessionId ] );

	return {
		// State
		messages,
		isThinking,
		isSendingMessage,
		isTyping,
		error,
		assistant,
		pendingToolCallbacks,
		currentToolCall,
		isLoading: isThinking || isSendingMessage,

		// Actions
		sendMessage,
		addUserMessage,
		assistantSay,
		addMessage,
		deleteMessage,
		clearConversation,
		resetAgentConversation,
		setError,

		// Config
		agentConfig: config,
	};
};
