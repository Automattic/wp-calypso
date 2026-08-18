// Protocol Type Definitions
// Originally based on https://google.github.io/A2A/specification/ but no longer tied to that protocol.

export type JsonRpcId = string | number;

export interface JsonRpcRequest< TParams = unknown > {
	jsonrpc: '2.0';
	id: JsonRpcId;
	method: string;
	params?: TParams;
}

export interface JsonRpcResponse< TResult = unknown > {
	jsonrpc: '2.0';
	id: JsonRpcId | null;
	result?: TResult;
	error?: JsonRpcError;
}

export interface JsonRpcError {
	code: number;
	message: string;
	data?: unknown;
}

export type TaskState =
	| 'submitted'
	| 'working'
	| 'running'
	| 'input-required'
	| 'completed'
	| 'canceled'
	| 'failed';

/**
 * Content type for text parts
 * - 'text': Normal visible text content
 * - 'context': Hidden context information sent to agent but not displayed in UI
 */
export type ContentType = 'text' | 'context';

export interface TextPart {
	type: 'text';
	text: string;
	metadata?: Record< string, unknown >;
}

export interface FilePart {
	type: 'file';
	file: {
		name: string;
		mimeType?: string; // Required for base64 bytes, optional when uri is provided
		bytes?: string; // Base64 encoded
		uri?: string;
	};
	metadata?: Record< string, unknown >;
}

export interface DataPart {
	type: 'data';
	data: Record< string, unknown >;
	metadata?: Record< string, unknown >;
}

export interface ToolDataPart extends DataPart {
	data: {
		toolId: string;
		toolName: string;
		description: string;
		inputSchema: {
			type: 'object';
			properties: Record< string, unknown >;
		};
	};
}

export interface ToolCallDataPart extends DataPart {
	data: {
		toolCallId: string;
		toolId: string;
		/**
		 * Parsed tool call arguments, or `{ _raw: string }` while the
		 * arguments JSON is still streaming and hasn't closed yet.
		 */
		arguments: Record< string, unknown > | { _raw: string };
	};
}

export interface ToolResultDataPart extends DataPart {
	data: {
		toolCallId: string;
		toolId: string;
		result?: unknown;
		/**
		 * Files (typically images) produced by the tool alongside its result.
		 * Snake-cased to match the server-side wire convention; the key is
		 * omitted entirely when the tool produced no files, so results that
		 * don't carry files keep their existing shape.
		 */
		__file_parts?: FilePart[];
	};
}

export interface ContextDataPart extends DataPart {
	data: {
		clientContext: Record< string, unknown >;
	};
}

export interface ConversationHistoryPart extends DataPart {
	data: {
		role: 'user' | 'model';
		text: string;
	};
}

export type ProgressDataPart =
	| ( DataPart & {
			data: {
				summary: string;
				phase?: string;
			};
	  } )
	| {
			type: 'progress';
			data: {
				summary: string;
				phase?: string;
			};
			metadata?: Record< string, unknown >;
	  };

/**
 * WordPress Ability interface
 *
 * This is a copy of the Ability interface from @wordpress/abilities.
 * We maintain our own copy to avoid runtime dependencies. The interface is stable as part of WordPress core.
 *
 * @see https://github.com/WordPress/abilities-api
 */
export interface Ability {
	/**
	 * The unique name/identifier of the ability, with its namespace.
	 * Example: 'my-plugin/my-ability'
	 * @see WP_Ability::get_name()
	 */
	name: string;

	/**
	 * The human-readable label for the ability.
	 * @see WP_Ability::get_label()
	 */
	label: string;

	/**
	 * The detailed description of the ability.
	 * @see WP_Ability::get_description()
	 */
	description: string;

	/**
	 * The category this ability belongs to.
	 * Must be a valid category slug (lowercase alphanumeric with dashes).
	 * Example: 'data-retrieval', 'user-management'
	 * @see WP_Ability::get_category()
	 */
	category: string;

	/**
	 * JSON Schema for the ability's input parameters.
	 * @see WP_Ability::get_input_schema()
	 */
	input_schema?: Record< string, any >;

	/**
	 * JSON Schema for the ability's output format.
	 * @see WP_Ability::get_output_schema()
	 */
	output_schema?: Record< string, any >;

	/**
	 * Callback function for client-side abilities.
	 * If present, the ability will be executed locally in the browser.
	 * If not present, the ability will be executed via REST API on the server.
	 */
	callback?: ( input: any ) => any | Promise< any >;

	/**
	 * Client permission callback for abilities.
	 * Called before executing the ability to check if it's allowed.
	 * If it returns false, the ability execution will be denied.
	 */
	permissionCallback?: ( input?: any ) => boolean | Promise< boolean >;

	/**
	 * Metadata about the ability.
	 * @see WP_Ability::get_meta()
	 */
	meta?: {
		annotations?: {
			instructions?: string;
			readonly?: boolean;
			destructive?: boolean;
			idempotent?: boolean;
		};
		[ key: string ]: any;
	};
}

/**
 * AbilityDataPart - protocol data part for WordPress Abilities.
 * This transmits the full ability structure (minus client-side callbacks) over the wire.
 */
export interface AbilityDataPart extends DataPart {
	data: Omit< Ability, 'callback' | 'permissionCallback' >;
}

export type Part =
	| TextPart
	| FilePart
	| DataPart
	| ToolDataPart
	| ToolCallDataPart
	| ToolResultDataPart
	| ContextDataPart
	| AbilityDataPart
	| ProgressDataPart;

export interface Message {
	role: 'user' | 'agent';
	parts: Part[];
	metadata?: Record< string, unknown >;
	messageId: string;
	kind: 'message';
}

export interface TaskStatus {
	state: TaskState;
	message?: Message;
	timestamp?: string;
	error?: JsonRpcError;
	final?: boolean;
}

export interface Artifact {
	name: string;
	description?: string;
	index: number;
	parts: Part[];
	metadata?: Record< string, unknown >;
}

export interface Task {
	id: string;
	sessionId?: string;
	status: TaskStatus;
	artifacts?: Artifact[];
}

// Request/Response for message/send method
export interface MessageSendParams {
	id?: string; // Optional - will be generated if not provided
	sessionId?: string;
	message: Message;
	metadata?: Record< string, unknown >;
}

export interface SendMessageRequest
	extends JsonRpcRequest< MessageSendParams > {
	tokenStreaming?: boolean; // Enable token-by-token streaming
}
export type SendMessageResponse = JsonRpcResponse< Task >;

// Events for streaming responses
export interface TaskStatusUpdateEvent {
	id?: string;
	taskId?: string;
	sessionId?: string;
	status: TaskStatus;
	final?: boolean;
}

export interface TaskArtifactUpdateEvent {
	id: string;
	artifact: Artifact;
}

export enum ErrorCodes {
	PARSE_ERROR = -32700,
	INVALID_REQUEST = -32600,
	METHOD_NOT_FOUND = -32601,
	INVALID_PARAMS = -32602,
	INTERNAL_ERROR = -32603,
	SERVER_ERROR = -32000,
}

// Client-specific types
export interface AuthProvider {
	(): Promise< Record< string, string > >;
}

export interface ClientConfig {
	agentId: string;
	agentUrl: string;
	authProvider?: AuthProvider;
	defaultSessionId?: string;
	timeout?: number;
	toolProvider?: ToolProvider;
	contextProvider?: ContextProvider;
	conversationStorageKey?: string;
	enableStreaming?: boolean; // Enable token-by-token streaming (requires server support)
	odieBotId?: string; // Odie bot ID for server-based conversation storage (e.g., 'wpcom-agent-wp_orchestrator'). When set, enables server storage via WordPress.com public API.
	credentials?: RequestCredentials; // Set 'include' to send cookies with cross-origin requests.
}

// Image data with optional metadata (e.g., WordPress attachment ID)
export interface ImageData {
	url: string;
	metadata?: Record< string, unknown >;
}

export interface SendMessageParams {
	message: Message;
	taskId?: string;
	sessionId?: string;
	metadata?: Record< string, unknown >;
	withHistory?: boolean; // Default: true - whether to include conversation history
	abortSignal?: AbortSignal; // Optional: abort signal for canceling inflight requests
	enableStreaming?: boolean; // Override client's default streaming setting for this request
	imageUrls?: ( string | ImageData )[]; // Optional: array of image URLs or image objects with metadata
}

export interface TaskUpdate {
	id: string;
	sessionId?: string; // Session ID from server
	status: TaskStatus;
	final?: boolean;
	artifact?: Artifact;
	text: string; // Extracted text from status.message
	agentMessage?: Message; // Optional separate agent message for when returnToAgent is false
	progressMessage?: string; // Optional progress message extracted from progress parts
	progressPhase?: string; // Optional phase from progress parts (e.g. 'uploading', 'thinking')
	// Wire source: 'delta' (message/delta) or 'status' (TaskStatusUpdateEvent).
	// Non-final text-bearing 'status' updates mark utterance boundaries.
	kind?: 'delta' | 'status';
}

export interface Client {
	sendMessage: ( params: SendMessageParams ) => Promise< TaskUpdate >;
	sendMessageStream: (
		params: SendMessageParams
	) => AsyncIterable< TaskUpdate >;

	// Continue an existing task (useful for human input after input-required state)
	continueTask: (
		taskId: string,
		userInput: string,
		sessionId?: string
	) => Promise< TaskUpdate >;

	getTask: ( taskId: string ) => Promise< Task >;
	cancelTask: ( taskId: string ) => Promise< void >;
}

// Tool system types
export interface Tool {
	id: string;
	name: string;
	description: string;
	input_schema: {
		type: 'object';
		properties: Record< string, unknown >;
		required?: string[];
	};
}

export interface ToolExecutionResult {
	result: any;
	returnToAgent?: boolean; // Default: true - whether to automatically send result back to agent
	agentMessage?: string; // Optional: custom agent message to add to conversation history
	__file_parts?: FilePart[]; // Optional: files (typically images) produced by the tool, sent alongside the result
}

export interface ToolProvider {
	getAvailableTools?: () => Promise< Tool[] >;
	executeTool?: (
		toolId: string,
		args: any,
		messageId?: string,
		toolCallId?: string
	) => Promise< any | ToolExecutionResult >;
	getAbilities?: () => Promise< Ability[] >;
	executeAbility?: ( name: string, args: any ) => Promise< any >;
}

export interface ToolCallResult {
	toolCallId: string;
	toolId: string;
	result: any;
	error?: string;
}

/**
 * Type for the executeAbility function from @wordpress/abilities
 */
export type ExecuteAbilityFunction = (
	name: string,
	input?: any
) => Promise< any >;

// Context system types
export type ClientContext = Record< string, unknown >;

export interface ContextProvider {
	getClientContext: () => ClientContext;
}
