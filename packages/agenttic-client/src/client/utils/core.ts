import type {
	ClientContext,
	ContextDataPart,
	JsonRpcId,
	Message,
	MessageSendParams,
	SendMessageRequest,
	TextPart,
	Tool,
	ToolCallDataPart,
	ToolDataPart,
	ToolResultDataPart,
} from '../types/index';

/**
 * Generate a random 8-character alphanumeric string for IDs
 */
export function generateRandomId(): string {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for ( let i = 0; i < 8; i++ ) {
		// eslint-disable-next-line no-restricted-syntax
		result += chars.charAt( Math.floor( Math.random() * chars.length ) );
	}
	return result;
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
	return generateRandomId();
}

/**
 * Creates a unique request ID for A2A requests
 */
export function createRequestId(): JsonRpcId {
	return `req-${ generateRandomId() }`;
}

/**
 * Creates a unique task ID for A2A tasks
 */
export function createTaskId(): string {
	return `task-${ generateRandomId() }`;
}

/**
 * Create a simple text part for a message
 * @param text
 */
export function createTextPart( text: string ): TextPart {
	return {
		type: 'text',
		text,
	};
}

/**
 * Create a message/send request payload
 * @param params
 * @param method
 */
export function createSendMessageRequest(
	params: MessageSendParams,
	method: string = 'message/send'
): SendMessageRequest {
	return {
		jsonrpc: '2.0',
		id: createRequestId(),
		method,
		params: {
			id: params.id || createTaskId(),
			...params,
		},
	};
}

/**
 * Extract text content from a message
 * @param message
 */
export function extractTextFromMessage( message: Message ): string {
	if ( ! message || ! message.parts || ! Array.isArray( message.parts ) ) {
		return '';
	}

	return message.parts
		.filter( ( part ): part is TextPart => part.type === 'text' )
		.map( ( part ) => part.text )
		.join( ' ' );
}

/**
 * Create a ToolDataPart from a Tool
 * @param tool
 */
export function createToolDataPart( tool: Tool ): ToolDataPart {
	return {
		type: 'data',
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
 * Extract tool calls from a message
 * @param message
 */
export function extractToolCallsFromMessage(
	message: Message
): ToolCallDataPart[] {
	if ( ! message || ! message.parts || ! Array.isArray( message.parts ) ) {
		return [];
	}

	return message.parts.filter(
		( part ): part is ToolCallDataPart =>
			part.type === 'data' &&
			'toolCallId' in part.data &&
			'toolId' in part.data &&
			'arguments' in part.data
	);
}

/**
 * Create a tool result data part
 * @param toolCallId
 * @param toolId
 * @param result
 * @param error
 */
export function createToolResultDataPart(
	toolCallId: string,
	toolId: string,
	result?: unknown,
	error?: string
): ToolResultDataPart {
	return {
		type: 'data',
		data: {
			toolCallId,
			toolId,
			result,
		},
		metadata: error ? { error } : undefined,
	};
}

/**
 * Create a context data part from client context
 * @param clientContext
 */
export function createContextDataPart(
	clientContext: ClientContext
): ContextDataPart {
	return {
		type: 'data',
		data: {
			clientContext,
		},
		metadata: {},
	};
}

/**
 * Create a simple text message with user role
 * @param text
 */
export function createTextMessage( text: string ): Message {
	return {
		role: 'user',
		parts: [ createTextPart( text ) ],
		kind: 'message',
		messageId: generateMessageId(),
	};
}

/**
 * Create a simple text message with agent role
 * @param text
 */
export function createAgentTextMessage( text: string ): Message {
	return {
		role: 'agent',
		parts: [ createTextPart( text ) ],
		kind: 'message',
		messageId: generateMessageId(),
	};
}

/**
 * Process tool execution result to extract result and returnToAgent flag
 * @param executionResult
 */
export function processToolExecutionResult( executionResult: any ): {
	result: any;
	returnToAgent: boolean;
	agentMessage?: string;
} {
	// Check if result is a ToolExecutionResult object
	if (
		executionResult &&
		typeof executionResult === 'object' &&
		'result' in executionResult
	) {
		return {
			result: executionResult.result,
			returnToAgent: executionResult.returnToAgent !== false, // Default to true
			agentMessage: executionResult.agentMessage, // Pass through agentMessage if present
		};
	}

	// Legacy direct result format
	return {
		result: executionResult,
		returnToAgent: true,
	};
}

/**
 * Create a tool result message from tool result data parts
 * @param toolResults
 * @param historyDataParts
 */
export function createToolResultMessage(
	toolResults: ToolResultDataPart[],
	historyDataParts: any[] = []
): Message {
	return {
		role: 'user',
		kind: 'message',
		parts: [ ...historyDataParts, ...toolResults ],
		messageId: generateMessageId(),
	};
}
