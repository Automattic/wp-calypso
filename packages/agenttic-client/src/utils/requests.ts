import type {
	A2AClientConfig,
	AuthProvider,
	JsonRpcResponse,
	Message,
	SendMessageParams,
	Task,
	TaskUpdate,
} from '../types/index';
import { createSendTaskRequest } from './index';
import { enhanceMessage } from './messages';
import { formatObject, logger } from './logger';
import { parseSSEStream } from '../streaming/index';
import { socksDispatcher } from 'fetch-socks';

/**
 * Configuration for making requests
 */
export interface RequestConfig {
	agentUrl: string;
	authProvider?: AuthProvider;
	timeout: number;
	proxy?: string;
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
 * Create fetch options with optional proxy
 *
 * @param headers - Request headers
 * @param body    - Request body
 * @param signal  - Abort signal
 * @param proxy   - Optional proxy configuration
 * @return Fetch options with optional dispatcher
 */
function createFetchOptions(
	headers: Record< string, string >,
	body: string,
	signal: AbortSignal,
	proxy?: string
): RequestInit & { dispatcher?: any } {
	const options: RequestInit & { dispatcher?: any } = {
		method: 'POST',
		headers,
		body,
		signal,
	};

	// Add proxy agent if proxy is configured
	// For SOCKS proxy, we use fetch-socks dispatcher
	if ( proxy ) {
		try {
			// Parse the SOCKS proxy URL (e.g., "socks://127.0.0.1:8080")
			const url = new URL( proxy );
			const dispatcher = socksDispatcher( {
				type: 5, // SOCKS5
				host: url.hostname,
				port: parseInt( url.port, 10 ),
			} );
			options.dispatcher = dispatcher;
		} catch ( error ) {
			// If proxy setup fails, log warning but continue without proxy
			logger( 'Warning: Failed to setup proxy %s: %s', proxy, error );
		}
	}

	return options;
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
	const { agentUrl, authProvider, proxy } = config;
	const { isStreaming = false } = options;

	const effectiveSessionId = sessionId || defaultSessionId;

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
	logRequest( 'POST', agentUrl, headers, request, proxy );

	return {
		request,
		headers,
		enhancedMessage,
		effectiveSessionId,
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
	const { request, headers } = preparedRequest;
	const { agentUrl, timeout, proxy } = config;

	const controller = new AbortController();
	const timeoutId = setTimeout( () => controller.abort(), timeout );

	try {
		const options = createFetchOptions(
			headers,
			JSON.stringify( request ),
			controller.signal,
			proxy
		);

		logger( 'Making request to %s with options: %O', agentUrl, {
			method: options.method,
			headers: options.headers,
			hasDispatcher: !! options.dispatcher,
			proxy,
		} );

		const response = await fetch( agentUrl, options as any );

		clearTimeout( timeoutId );

		if ( ! response.ok ) {
			throw new Error( `HTTP error! status: ${ response.status }` );
		}

		const data = ( await response.json() ) as JsonRpcResponse< Task >;

		// Log the response
		logger(
			'Response from %s: %d %O',
			agentUrl,
			response.status,
			formatObject( data )
		);

		if ( data.error ) {
			throw new Error( `A2A error: ${ data.error.message }` );
		}

		if ( ! data.result ) {
			throw new Error( 'No result in response' );
		}

		return data.result;
	} catch ( error ) {
		clearTimeout( timeoutId );
		logger( 'Request failed with error: %O', error );
		if ( error instanceof Error ) {
			logger( 'Error message: %s', error.message );
			logger( 'Error stack: %s', error.stack );
		}
		throw error;
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
	const { request, headers } = preparedRequest;
	const { agentUrl, proxy } = config;
	const { streamingTimeout = 60000 } = options;

	const controller = new AbortController();
	const timeoutId = setTimeout( () => controller.abort(), streamingTimeout );

	try {
		const fetchOptions = createFetchOptions(
			headers,
			JSON.stringify( request ),
			controller.signal,
			proxy
		);

		const response = await fetch( agentUrl, fetchOptions as any );

		clearTimeout( timeoutId );

		if ( ! response.ok ) {
			throw new Error( `HTTP error! status: ${ response.status }` );
		}

		if ( ! response.body ) {
			throw new Error( 'No response body for streaming' );
		}

		// Parse the SSE stream and yield task updates
		yield* parseSSEStream( response.body as ReadableStream< Uint8Array > );
	} catch ( error ) {
		clearTimeout( timeoutId );
		throw error;
	}
}
