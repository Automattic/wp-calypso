// A2A Protocol Type Definitions
// Based on https://google.github.io/A2A/specification/

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
	| 'input-required'
	| 'completed'
	| 'canceled'
	| 'failed';

export interface TextPart {
	type: 'text';
	text: string;
	metadata?: Record< string, unknown >;
}

export interface FilePart {
	type: 'file';
	file: {
		name: string;
		mimeType: string;
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
		arguments: Record< string, unknown >;
	};
}

export interface ToolResultDataPart extends DataPart {
	data: {
		toolCallId: string;
		toolId: string;
		result?: unknown;
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

export type Part =
	| TextPart
	| FilePart
	| DataPart
	| ToolDataPart
	| ToolCallDataPart
	| ToolResultDataPart
	| ContextDataPart;

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

export type SendMessageRequest = JsonRpcRequest< MessageSendParams >;
export type SendMessageResponse = JsonRpcResponse< Task >;

// Events for streaming responses
export interface TaskStatusUpdateEvent {
	id: string;
	status: TaskStatus;
	final?: boolean;
}

export interface TaskArtifactUpdateEvent {
	id: string;
	artifact: Artifact;
}

export enum A2AErrorCodes {
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
}

export interface SendMessageParams {
	message: Message;
	taskId?: string;
	sessionId?: string;
	metadata?: Record< string, unknown >;
	withHistory?: boolean; // Default: true - whether to include conversation history
}

export interface TaskUpdate {
	id: string;
	status: TaskStatus;
	final?: boolean;
	artifact?: Artifact;
	text: string; // Extracted text from status.message
	agentMessage?: Message; // Optional separate agent message for when returnToAgent is false
}

export interface Client {
	sendMessage( params: SendMessageParams ): Promise< TaskUpdate >;
	sendMessageStream( params: SendMessageParams ): AsyncIterable< TaskUpdate >;

	// Continue an existing task (useful for human input after input-required state)
	continueTask(
		taskId: string,
		userInput: string,
		sessionId?: string
	): Promise< TaskUpdate >;

	getTask( taskId: string ): Promise< Task >;
	cancelTask( taskId: string ): Promise< void >;
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
}

export interface ToolProvider {
	getAvailableTools(): Promise< Tool[] >;
	executeTool(
		toolId: string,
		args: any,
		messageId?: string,
		toolCallId?: string
	): Promise< any | ToolExecutionResult >;
}

export interface ToolCallResult {
	toolCallId: string;
	toolId: string;
	result: any;
	error?: string;
}

// Context system types
export type ClientContext = Record< string, unknown >;

export interface ContextProvider {
	getClientContext(): ClientContext;
}
