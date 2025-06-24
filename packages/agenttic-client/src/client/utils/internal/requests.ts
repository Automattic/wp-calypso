import type {
	AuthProvider,
	JsonRpcResponse,
	SendMessageParams,
	Task,
	TaskUpdate,
} from '../../types/index';
import { createSendTaskRequest } from '../core';
import { enhanceMessage } from './messages';
import { formatObject, logger } from '../logger';
import { parseSSEStream } from './streaming';
import type { RequestDispatcher } from '../dispatcher';
import { defaultDispatcher } from '../dispatcher';
import {
	createTimeoutHandler,
	handleRequestError,
	validateHttpResponse,
	validateJsonRpcResponse,
	validateStreamingResponse,
} from './errors';

/**
 * Configuration for making requests
 */
export interface RequestConfig {
	agentId: string;
	agentUrl: string;
	authProvider?: AuthProvider;
	timeout: number;
	proxy?: string;
	dispatcher?: RequestDispatcher;
}

/**
 * Construct the full agent URL from base URL and agent ID
 *
 * @param agentUrl - Base agent URL (required)
 * @param agentId  - Agent ID to append to the URL
 * @return Full agent URL
 */
function constructAgentUrl( agentUrl: string, agentId: string ): string {
	return `${ agentUrl }/${ agentId }`;
}

/**
 * Options for request execution
 */
export interface RequestOptions {
	isStreaming?: boolean;
	streamingTimeout?: number;
}

/**
 * Log request details if verbose logging is enabled
 *
 * @param method  - HTTP method
 * @param url     - Request URL
 * @param headers - Request headers
 * @param body    - Request body
 * @param proxy   - Proxy configuration
 */
function logRequest(
	method: string,
	url: string,
	headers: Record< string, string >,
	body?: any,
	proxy?: string
) {
	logger( 'Request: %s %s', method, url );
	if ( proxy ) {
		logger( 'Proxy: %s', proxy );
	}
	logger( 'Headers: %o', headers );
	if ( body ) {
		logger( 'Body: %s', formatObject( body ) );
	}
}

/**
 * Get headers for requests
 *
 * @param authProvider - Optional auth provider
 * @param isStreaming  - Whether this is a streaming request
 * @return Promise resolving to headers object
 */
async function getHeaders(
	authProvider?: AuthProvider,
	isStreaming: boolean = false
): Promise< Record< string, string > > {
	const baseHeaders: Record< string, string > = {
		'Content-Type': 'application/json',
	};

	if ( isStreaming ) {
		baseHeaders.Accept = 'text/event-stream';
	}

	if ( authProvider ) {
		const authHeaders = await authProvider();
		return { ...baseHeaders, ...authHeaders };
	}

	return baseHeaders;
}

/**
 * Create fetch options with optional proxy using the provided dispatcher
 *
 * @param headers    - Request headers
 * @param body       - Request body
 * @param signal     - Abort signal
 * @param proxy      - Optional proxy configuration
 * @param dispatcher - Request dispatcher to use
 * @return Fetch options with optional dispatcher
 */
function createFetchOptions(
	headers: Record< string, string >,
	body: string,
	signal: AbortSignal,
	proxy?: string,
	dispatcher: RequestDispatcher = defaultDispatcher
): RequestInit & { dispatcher?: any } {
	return dispatcher.createFetchOptions( headers, body, signal, proxy );
}

/**
 * Prepare a request for execution
 *
 * @param params           - Send message parameters
 * @param config           - Request configuration
 * @param options          - Request options
 * @param toolProvider     - Optional tool provider
 * @param contextProvider  - Optional context provider
 * @param defaultSessionId - Default session ID
 * @return Promise resolving to prepared request data
 */
export async function prepareRequest(
	params: SendMessageParams,
	config: RequestConfig,
	options: RequestOptions,
	toolProvider?: any,
	contextProvider?: any,
	defaultSessionId?: string
) {
	const { message, sessionId, taskId, metadata } = params;
	const { agentId, agentUrl, authProvider, proxy } = config;
	const { isStreaming = false } = options;

	const effectiveSessionId = sessionId || defaultSessionId;
	const fullAgentUrl = constructAgentUrl( agentUrl, agentId );

	// Enhance message with tools and context
	const enhancedMessage = await enhanceMessage(
		message,
		toolProvider,
		contextProvider
	);

	// Create request payload
	const request = createSendTaskRequest(
		{
			id: taskId,
			sessionId: effectiveSessionId,
			message: enhancedMessage,
			metadata,
		},
		isStreaming ? 'tasks/sendSubscribe' : 'tasks/send'
	);

	// Get headers
	const headers = await getHeaders( authProvider, isStreaming );

	// Log the request details
	logRequest( 'POST', fullAgentUrl, headers, request, proxy );

	return {
		request,
		headers,
		enhancedMessage,
		effectiveSessionId,
		fullAgentUrl,
	};
}

/**
 * Execute a non-streaming request
 *
 * @param preparedRequest - Prepared request data
 * @param config          - Request configuration
 * @return Promise resolving to the response task
 */
export async function executeRequest(
	preparedRequest: Awaited< ReturnType< typeof prepareRequest > >,
	config: RequestConfig
): Promise< Task > {
	const { request, headers, fullAgentUrl } = preparedRequest;
	const { timeout, proxy, dispatcher } = config;

	const { timeoutId, controller } = createTimeoutHandler(
		timeout,
		'request'
	);

	try {
		const options = createFetchOptions(
			headers,
			JSON.stringify( request ),
			controller.signal,
			proxy,
			dispatcher
		);

		logger( 'Making request to %s with options: %O', fullAgentUrl, {
			method: options.method,
			headers: options.headers,
			hasDispatcher: !! options.dispatcher,
			proxy,
		} );

		const response = await fetch( fullAgentUrl, options as any );

		clearTimeout( timeoutId );

		// Validate HTTP response
		validateHttpResponse( response, 'request' );

		const data = ( await response.json() ) as JsonRpcResponse< Task >;

		// Log the response
		logger(
			'Response from %s: %d %O',
			fullAgentUrl,
			response.status,
			formatObject( data )
		);

		// Validate JSON-RPC response and return result
		return validateJsonRpcResponse( data, 'request' );
	} catch ( error ) {
		handleRequestError( error, timeoutId, 'request' );
	}
}

/**
 * Execute a streaming request
 *
 * @param preparedRequest - Prepared request data
 * @param config          - Request configuration
 * @param options         - Request options
 * @return Async iterable of task updates
 */
export async function* executeStreamingRequest(
	preparedRequest: Awaited< ReturnType< typeof prepareRequest > >,
	config: RequestConfig,
	options: RequestOptions
): AsyncIterable< TaskUpdate > {
	const { request, headers, fullAgentUrl } = preparedRequest;
	const { proxy, dispatcher } = config;
	const { streamingTimeout = 60000 } = options;

	const { timeoutId, controller } = createTimeoutHandler(
		streamingTimeout,
		'streaming request'
	);

	try {
		const fetchOptions = createFetchOptions(
			headers,
			JSON.stringify( request ),
			controller.signal,
			proxy,
			dispatcher
		);

		const response = await fetch( fullAgentUrl, fetchOptions as any );

		clearTimeout( timeoutId );

		// Validate streaming response
		validateStreamingResponse( response, 'streaming request' );

		// Parse the SSE stream and yield task updates
		yield* parseSSEStream( response.body as ReadableStream< Uint8Array > );
	} catch ( error ) {
		handleRequestError( error, timeoutId, 'streaming request' );
	}
}
