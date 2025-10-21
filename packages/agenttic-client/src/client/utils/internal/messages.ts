import type { ContextProvider, Message, ToolProvider } from '../../types/index';
import { logger } from '../logger';
import {
	createAbilityDataPart,
	createContextDataPart,
	createToolDataPart,
} from '../core';

/**
 * Enhance a message with available tools and abilities from the tool provider
 *
 * @param message      - The message to enhance
 * @param toolProvider - Optional tool provider to get tools and abilities from
 * @return Promise resolving to the enhanced message
 */
export async function enhanceMessageWithTools(
	message: Message,
	toolProvider?: ToolProvider
): Promise< Message > {
	if ( ! toolProvider ) {
		return message;
	}

	try {
		const tools = await toolProvider.getAvailableTools();
		const parts = [];

		// Add tool data parts for regular tools
		if ( tools.length > 0 ) {
			const toolParts = tools.map( createToolDataPart );
			parts.push( ...toolParts );
		}

		// Add ability data parts for WordPress Abilities
		if ( toolProvider.abilities && toolProvider.abilities.length > 0 ) {
			const abilityParts = toolProvider.abilities.map(
				createAbilityDataPart
			);
			parts.push( ...abilityParts );
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
 * Enhance a message with client context from the context provider
 *
 * @param message         - The message to enhance
 * @param contextProvider - Optional context provider to get context from
 * @return The enhanced message
 */
export function enhanceMessageWithContext(
	message: Message,
	contextProvider?: ContextProvider
): Message {
	if ( ! contextProvider ) {
		return message;
	}

	try {
		const clientContext = contextProvider.getClientContext();
		if ( ! clientContext || Object.keys( clientContext ).length === 0 ) {
			return message;
		}

		const contextPart = createContextDataPart( clientContext );
		return {
			...message,
			parts: [ ...message.parts, contextPart ],
		};
	} catch ( error ) {
		logger( 'Warning: Failed to get context: %s', error );
		return message;
	}
}

/**
 * Enhance a message with both tools and context
 *
 * @param message         - The message to enhance
 * @param toolProvider    - Optional tool provider to get tools from
 * @param contextProvider - Optional context provider to get context from
 * @return Promise resolving to the enhanced message
 */
export async function enhanceMessage(
	message: Message,
	toolProvider?: ToolProvider,
	contextProvider?: ContextProvider
): Promise< Message > {
	// First enhance with tools (async)
	let enhancedMessage = await enhanceMessageWithTools(
		message,
		toolProvider
	);

	// Then enhance with context (sync)
	enhancedMessage = enhanceMessageWithContext(
		enhancedMessage,
		contextProvider
	);

	// Remove metadata before sending to agent (metadata is currently only client-side only to manage message timestammps)
	const { metadata, ...messageForAgent } = enhancedMessage;

	return messageForAgent;
}
