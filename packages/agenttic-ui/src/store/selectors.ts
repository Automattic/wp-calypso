import type { AgentChatState } from './types';
import type { Components } from 'react-markdown';
import {
	mergeMarkdownComponents,
	processMarkdownExtensions,
} from '../markdown-extensions';

export const getMessages = ( state: AgentChatState ) => state.messages;

export const getIsThinking = ( state: AgentChatState ) => state.isThinking;

export const getIsSendingMessage = ( state: AgentChatState ) =>
	state.isSendingMessage;

export const getIsTyping = ( state: AgentChatState ) => state.isTyping;

export const getMessagesToDelete = ( state: AgentChatState ) =>
	state.messagesToDelete;

export const getAssistant = ( state: AgentChatState ) => state.assistant;

export const getPendingToolCallbacks = ( state: AgentChatState ) =>
	state.pendingToolCallbacks;

export const getCurrentToolCall = ( state: AgentChatState ) =>
	state.currentToolCall;

export const getError = ( state: AgentChatState ) => state.error;

export const getLastMessage = ( state: AgentChatState ) => {
	const messages = state.messages;
	return messages.length > 0 ? messages[ messages.length - 1 ] : null;
};

export const getUserMessages = ( state: AgentChatState ) =>
	state.messages.filter( ( message ) => message.role === 'user' );

export const getAssistantMessages = ( state: AgentChatState ) =>
	state.messages.filter( ( message ) => message.role === 'assistant' );

export const getConversationHistory = ( state: AgentChatState ) =>
	state.messages.filter( ( message ) => ! message.archived );

export const getRegisteredSuggestions = ( state: AgentChatState ) =>
	state.suggestions;

export const getInputValue = ( state: AgentChatState ) => state.inputValue;

export const getRegisteredMarkdownComponents = (
	state: AgentChatState
): Components => {
	// Apply same processing logic as current mergeMarkdownComponents
	const extensionComponents = processMarkdownExtensions(
		state.markdownExtensions
	);
	return mergeMarkdownComponents(
		extensionComponents,
		state.markdownComponents
	);
};

export const getRegisteredMarkdownExtensions = ( state: AgentChatState ) =>
	state.markdownExtensions;
