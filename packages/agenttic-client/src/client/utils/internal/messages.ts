import { createAbilityDataPart, createContextDataPart, createToolDataPart } from '../core';
import { logger } from '../logger';
import type { ClientContext, ContextProvider, Message, ToolProvider } from '../../types/index';

/**
 * Enhance a message with available tools and abilities from the tool provider
 * @param message      - The message to enhance
 * @param toolProvider - Optional tool provider to get tools and abilities from
 * @returns Promise resolving to the enhanced message
 */
export async function enhanceMessageWithTools(
	message: Message,
	toolProvider?: ToolProvider
): Promise< Message > {
	if ( ! toolProvider ) {
		return message;
	}

	try {
		const parts = [];

		// Add tool data parts for regular tools
		if ( toolProvider.getAvailableTools ) {
			const tools = await toolProvider.getAvailableTools();
			if ( tools.length > 0 ) {
				const toolParts = tools.map( createToolDataPart );
				parts.push( ...toolParts );
			}
		}

		// Add ability data parts for WordPress Abilities
		if ( toolProvider.getAbilities ) {
			const abilities = await toolProvider.getAbilities();
			if ( abilities.length > 0 ) {
				const abilityParts = abilities.map( createAbilityDataPart );
				parts.push( ...abilityParts );
			}
		}

		if ( parts.length === 0 ) {
			return message;
		}

		return {
			...message,
			parts: [ ...message.parts, ...parts ],
		};
	} catch ( error ) {
		logger( 'Warning: Failed to get tools: %s', error );
		return message;
	}
}

/**
 * Enhance a message with client context, preserving context-message visibility in server storage.
 * @param message         - The message to enhance
 * @param contextProvider - Optional context provider to get context from
 * @returns The enhanced message
 */
export function enhanceMessageWithContext(
	message: Message,
	contextProvider?: ContextProvider
): Message {
	const contextOnly = message.parts.some(
		( part ) => part.type === 'text' && part.metadata?.contentType === 'context'
	);
	const promptSource = message.metadata?.promptSource;
	const hasPromptSource = typeof promptSource === 'string' && promptSource !== '';
	if ( ! contextProvider && ! contextOnly && ! hasPromptSource ) {
		return message;
	}

	let clientContext: ClientContext = {};
	try {
		clientContext = contextProvider?.getClientContext() ?? {};
	} catch ( error ) {
		logger( 'Warning: Failed to get context: %s', error );
	}
	if ( contextOnly ) {
		clientContext = {
			...clientContext,
			flags: {
				...( typeof clientContext.flags === 'object' && clientContext.flags !== null
					? clientContext.flags
					: {} ),
				context_only: true,
			},
		};
	}
	// The prompt source lives in the message's client metadata (see
	// `SubmitOptions.promptSource`); the server reads it from the context.
	if ( hasPromptSource ) {
		const promptSourceId = message.metadata?.promptSourceId;
		clientContext = {
			...clientContext,
			metadata: {
				...( typeof clientContext.metadata === 'object' && clientContext.metadata !== null
					? clientContext.metadata
					: {} ),
				promptSource,
				...( typeof promptSourceId === 'string' && promptSourceId !== '' && { promptSourceId } ),
			},
		};
	}
	if ( Object.keys( clientContext ).length === 0 ) {
		return message;
	}
	return {
		...message,
		parts: [ ...message.parts, createContextDataPart( clientContext ) ],
	};
}

/**
 * Enhance a message with both tools and context
 * @param message         - The message to enhance
 * @param toolProvider    - Optional tool provider to get tools from
 * @param contextProvider - Optional context provider to get context from
 * @returns Promise resolving to the enhanced message
 */
export async function enhanceMessage(
	message: Message,
	toolProvider?: ToolProvider,
	contextProvider?: ContextProvider
): Promise< Message > {
	// First enhance with tools (async)
	let enhancedMessage = await enhanceMessageWithTools( message, toolProvider );

	// Then enhance with context (sync)
	enhancedMessage = enhanceMessageWithContext( enhancedMessage, contextProvider );

	// The message's own metadata stays on the client, which uses it for timestamps; the agent gets
	// only what the context provider gives it.
	const { metadata, ...messageForAgent } = enhancedMessage;
	let agentMetadata: Record< string, unknown > | undefined;
	try {
		agentMetadata = contextProvider?.getMessageMetadata?.();
	} catch ( error ) {
		logger( 'Warning: Failed to get message metadata: %s', error );
	}

	return agentMetadata && Object.keys( agentMetadata ).length > 0
		? { ...messageForAgent, metadata: agentMetadata }
		: messageForAgent;
}
