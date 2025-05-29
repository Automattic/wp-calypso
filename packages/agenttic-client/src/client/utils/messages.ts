import type {
	ClientContext,
	ContextDataPart,
	ContextProvider,
	Message,
	Tool,
	ToolDataPart,
	ToolProvider,
} from '../types/index';
import { logger } from './logger';
import { createContextDataPart, createToolDataPart } from './index';

/**
 * Create a ToolDataPart from a Tool (local implementation to avoid circular dependency)
 * @param tool - The tool to create a data part for
 */
function createToolDataPartLocal( tool: Tool ): ToolDataPart {
	return {
		type: 'data' as const,
		data: {
			toolId: tool.id,
			toolName: tool.name,
			description: tool.description,
			inputSchema: tool.input_schema,
		},
		metadata: {},
	};
}

/**
 * Create a context data part from client context (local implementation to avoid circular dependency)
 * @param clientContext - The client context to create a data part for
 */
function createContextDataPartLocal(
	clientContext: ClientContext
): ContextDataPart {
	return {
		type: 'data' as const,
		data: {
			clientContext,
		},
		metadata: {},
	};
}

/**
 * Enhance a message with available tools from the tool provider
 *
 * @param message      - The message to enhance
 * @param toolProvider - Optional tool provider to get tools from
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
		if ( tools.length === 0 ) {
			return message;
		}

		const toolParts = tools.map( createToolDataPartLocal );
		return {
			...message,
			parts: [ ...message.parts, ...toolParts ],
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

		const contextPart = createContextDataPartLocal( clientContext );
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

	return enhancedMessage;
}
