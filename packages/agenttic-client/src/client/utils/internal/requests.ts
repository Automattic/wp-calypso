import type {
	AuthProvider,
	JsonRpcResponse,
	SendMessageParams,
	Task,
	TaskUpdate,
} from '../../types/index';
import { createSendMessageRequest } from '../core';
import { enhanceMessage } from './messages';
import { formatObject, logger } from '../logger';
import { parseSSEStream } from './streaming';
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
	abortSignal?: AbortSignal; // Optional external abort signal
}

/**
 * Log request details if verbose logging is enabled
 *
 * @param method  - HTTP method
 * @param url     - Request URL
 * @param headers - Request headers
 * @param body    - Request body
 */
function logRequest(
	method: string,
	url: string,
	headers: Record< string, string >,
	body?: any
) {
	logger( 'Request: %s %s', method, url );
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
 * Combine two abort signals into one.
 *
 * @param signal1 - First abort signal
 * @param signal2 - Second abort signal (optional)
 * @return Combined abort signal
 */
function combineSignals(
	signal1: AbortSignal,
	signal2?: AbortSignal
): AbortSignal {
	if ( ! signal2 ) {
		return signal1;
	}

	const controller = new AbortController();

	// Abort if either signal aborts
	const handleAbort = ( signal: AbortSignal ) => {
		if ( ! controller.signal.aborted ) {
			controller.abort( signal.reason );
		}
	};

	if ( signal1.aborted ) {
		controller.abort( signal1.reason );
	} else {
		signal1.addEventListener( 'abort', () => handleAbort( signal1 ), {
			once: true,
		} );
	}

	if ( signal2.aborted ) {
		controller.abort( signal2.reason );
	} else {
		signal2.addEventListener( 'abort', () => handleAbort( signal2 ), {
			once: true,
		} );
	}

	return controller.signal;
}

/**
 * Create fetch options for browser requests
 *
 * @param headers - Request headers
 * @param body    - Request body
 * @param signal  - Abort signal
 * @return Basic fetch options
 */
function createFetchOptions(
	headers: Record< string, string >,
	body: string,
	signal: AbortSignal
): RequestInit {
	return {
		method: 'POST',
		headers,
		body,
		signal,
	};
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
	const request = createSendMessageRequest(
		{
			id: taskId,
			sessionId: effectiveSessionId,
			message: enhancedMessage,
			metadata,
		},
		isStreaming ? 'message/stream' : 'message/send'
	);

	// Get headers
	const headers = await getHeaders( authProvider, isStreaming );

	// Log the request details
	logRequest( 'POST', fullAgentUrl, headers, request );

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
 * @param options         - Request options (including external abort signal)
 * @return Promise resolving to the response task
 */
export async function executeRequest(
	preparedRequest: Awaited< ReturnType< typeof prepareRequest > >,
	config: RequestConfig,
	options: RequestOptions = {}
): Promise< Task > {
	const { request, headers, fullAgentUrl } = preparedRequest;
	const { timeout } = config;
	const { abortSignal: externalSignal } = options;

	// Always create timeout protection
	const { timeoutId, controller: timeoutController } = createTimeoutHandler(
		timeout,
		'request'
	);

	// Combine external signal with timeout if provided
	const signal = externalSignal
		? combineSignals( timeoutController.signal, externalSignal )
		: timeoutController.signal;

	try {
		const fetchOptions = createFetchOptions(
			headers,
			JSON.stringify( request ),
			signal
		);

		logger( 'Making request to %s with options: %O', fullAgentUrl, {
			method: fetchOptions.method,
			headers: fetchOptions.headers,
		} );

		const response = await fetch( fullAgentUrl, fetchOptions );

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
 * @param options         - Request options (including external abort signal)
 * @return Async iterable of task updates
 */
export async function* executeStreamingRequest(
	preparedRequest: Awaited< ReturnType< typeof prepareRequest > >,
	config: RequestConfig,
	options: RequestOptions
): AsyncIterable< TaskUpdate > {
	const { request, headers, fullAgentUrl } = preparedRequest;
	const {} = config;
	const { streamingTimeout = 60000, abortSignal: externalSignal } = options;

	const { timeoutId, controller } = createTimeoutHandler(
		streamingTimeout,
		'streaming request'
	);

	// Combine external signal with timeout if provided
	const signal = externalSignal
		? combineSignals( controller.signal, externalSignal )
		: controller.signal;

	try {
		const fetchOptions = createFetchOptions(
			headers,
			JSON.stringify( request ),
			signal
		);

		const response = await fetch( fullAgentUrl, fetchOptions );

		clearTimeout( timeoutId );

		// Validate streaming response
		validateStreamingResponse( response, 'streaming request' );

		// Parse the SSE stream and yield task updates
		yield* parseSSEStream( response.body as ReadableStream< Uint8Array > );
	} catch ( error ) {
		handleRequestError( error, timeoutId, 'streaming request' );
	}
}
