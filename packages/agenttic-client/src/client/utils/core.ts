import type {
	Ability,
	AbilityDataPart,
	ClientContext,
	ContextDataPart,
	FilePart,
	JsonRpcId,
	Message,
	MessageSendParams,
	ProgressDataPart,
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
 * Creates a unique request ID for requests
 */
export function createRequestId(): JsonRpcId {
	return `req-${ generateRandomId() }`;
}

/**
 * Creates a unique task ID for tasks
 */
export function createTaskId(): string {
	return `task-${ generateRandomId() }`;
}

/**
 * Create a simple text part for a message
 *
 * @param text     The text content
 * @param metadata Optional metadata for the text part
 */
export function createTextPart(
	text: string,
	metadata?: Record< string, unknown >
): TextPart {
	return {
		type: 'text',
		text,
		...( metadata && { metadata } ),
	};
}

/**
 * Create a message/send request payload
 * @param params
 * @param method
 * @param tokenStreaming - Whether to enable token streaming
 */
export function createSendMessageRequest(
	params: MessageSendParams,
	method: string = 'message/send',
	tokenStreaming: boolean = false
): SendMessageRequest {
	const request: SendMessageRequest = {
		jsonrpc: '2.0',
		id: createRequestId(),
		method,
		params: {
			id: params.id || createTaskId(),
			...params,
		},
	};

	if ( tokenStreaming && method === 'message/stream' ) {
		request.tokenStreaming = true;
	}

	return request;
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
 * Extracted progress data from a message's progress parts
 */
export interface ExtractedProgress {
	summary: string;
	phase?: string;
}

/**
 * Extract progress message from a message's parts
 * Returns the summary from the first progress part found
 * @param message
 */
export function extractProgressFromMessage(
	message: Message
): string | undefined {
	return extractProgressDataFromMessage( message )?.summary;
}

/**
 * Extract progress data from a message's parts
 * Returns the summary and phase from the first progress part found
 * @param message
 */
export function extractProgressDataFromMessage(
	message: Message
): ExtractedProgress | undefined {
	if ( ! message || ! message.parts || ! Array.isArray( message.parts ) ) {
		return undefined;
	}

	// Find progress parts - they can have type 'progress' or 'data' with a summary property
	const progressPart = message.parts.find( ( part ) => {
		if ( part.type === 'progress' ) {
			return true;
		}
		if ( part.type === 'data' ) {
			return (
				'summary' in part.data && typeof part.data.summary === 'string'
			);
		}
		return false;
	} ) as ProgressDataPart | undefined;

	if ( ! progressPart ) {
		return undefined;
	}

	return {
		summary: progressPart.data.summary,
		phase: progressPart.data.phase,
	};
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
 * Create an AbilityDataPart from an Ability
 * @param ability - The WordPress Ability to convert to a data part
 */
export function createAbilityDataPart( ability: Ability ): AbilityDataPart {
	return {
		type: 'data',
		data: {
			name: ability.name,
			label: ability.label,
			description: ability.description,
			category: ability.category,
			input_schema: ability.input_schema,
			output_schema: ability.output_schema,
			meta: ability.meta,
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
 * @param fileParts  Files (typically images) produced by the tool. Emitted as
 *                   `__file_parts` alongside `result`; omitted when empty so
 *                   file-less results keep their existing payload shape.
 */
export function createToolResultDataPart(
	toolCallId: string,
	toolId: string,
	result?: unknown,
	error?: string,
	fileParts?: FilePart[]
): ToolResultDataPart {
	return {
		type: 'data',
		data: {
			toolCallId,
			toolId,
			result,
			...( fileParts?.length ? { __file_parts: fileParts } : {} ),
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
 *
 * @param text     The text content
 * @param metadata Optional metadata. contentType is stored in TextPart.metadata, all other fields in Message.metadata
 */
export function createTextMessage(
	text: string,
	metadata?: Record< string, unknown >
): Message {
	const { contentType, ...messageMetadata } = metadata || {};
	const partMetadata = contentType ? { contentType } : undefined;

	return {
		role: 'user',
		parts: [ createTextPart( text, partMetadata ) ],
		kind: 'message',
		messageId: generateMessageId(),
		metadata: {
			timestamp: Date.now(),
			...messageMetadata,
		},
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
		metadata: {
			timestamp: Date.now(),
		},
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
	fileParts?: FilePart[];
} {
	// Check if result is a ToolExecutionResult object
	if (
		executionResult &&
		typeof executionResult === 'object' &&
		'result' in executionResult
	) {
		// `__file_parts` is the canonical key (it matches the wire), but accept
		// a camelCased `fileParts` too: an untyped tool returning the wrong
		// spelling would otherwise drop its images behind a success-shaped
		// result, which is the exact silent failure this feature exists to fix.
		const fileParts =
			executionResult.__file_parts ?? executionResult.fileParts;

		return {
			result: executionResult.result,
			returnToAgent: executionResult.returnToAgent !== false, // Default to true
			agentMessage: executionResult.agentMessage, // Pass through agentMessage if present
			fileParts: Array.isArray( fileParts ) ? fileParts : undefined,
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
		metadata: {
			timestamp: Date.now(),
		},
	};
}

/**
 * Create an AbortController for canceling requests
 * Utility function for consumers who want to abort requests
 */
export function createAbortController(): AbortController {
	return new AbortController();
}
