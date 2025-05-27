import type {
	A2AClient,
	A2AClientConfig,
	AuthProvider,
	JsonRpcResponse,
	Message,
	SendMessageParams,
	SendTaskRequest,
	Task,
	TaskUpdate,
	ToolProvider,
} from '../types/index';
import {
	createRequestId,
	createSendTaskRequest,
	createToolDataPart,
	createToolResultDataPart,
	extractToolCallsFromMessage,
} from '../utils/index';
import { parseSSEStream, streamToTask } from '../streaming/index';
import { formatObject, logger } from '../utils/logger';
import { socksDispatcher } from 'fetch-socks';

/**
 * Default timeout for requests (30 seconds)
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * Log request details if verbose logging is enabled
 * @param method
 * @param url
 * @param headers
 * @param body
 * @param proxy
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
 * Create an A2A client instance
 * @param config
 */
export function createA2AClient( config: A2AClientConfig ): A2AClient {
	const {
		agentUrl,
		authProvider,
		defaultSessionId,
		timeout = DEFAULT_TIMEOUT,
		proxy,
		toolProvider,
	} = config;

	/**
	 * Get headers for requests
	 */
	async function getHeaders(): Promise< Record< string, string > > {
		const baseHeaders: Record< string, string > = {
			'Content-Type': 'application/json',
		};

		if ( authProvider ) {
			const authHeaders = await authProvider();
			return { ...baseHeaders, ...authHeaders };
		}

		return baseHeaders;
	}

	/**
	 * Create fetch options with optional proxy
	 * @param headers
	 * @param body
	 * @param signal
	 */
	function createFetchOptions(
		headers: Record< string, string >,
		body: string,
		signal: AbortSignal
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
	 * Enhance a message with available tools
	 * @param message
	 */
	async function enhanceMessageWithTools(
		message: Message
	): Promise< Message > {
		if ( ! toolProvider ) {
			return message;
		}

		try {
			const tools = await toolProvider.getAvailableTools();
			if ( tools.length === 0 ) {
				return message;
			}

			const toolParts = tools.map( createToolDataPart );
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
	 * Process tool calls in a message and execute them
	 * @param message
	 */
	async function processToolCalls(
		message: Message
	): Promise< Message | null > {
		if ( ! toolProvider ) {
			return null;
		}

		const toolCalls = extractToolCallsFromMessage( message );
		if ( toolCalls.length === 0 ) {
			return null;
		}

		logger( 'Processing %d tool calls', toolCalls.length );

		const resultParts = await Promise.all(
			toolCalls.map( async ( toolCall ) => {
				const { toolCallId, toolId, arguments: args } = toolCall.data;

				try {
					logger( 'Executing tool %s with args: %O', toolId, args );
					const result = await toolProvider.executeTool(
						toolId,
						args
					);
					logger( 'Tool %s result: %O', toolId, result );

					return createToolResultDataPart(
						toolCallId as string,
						toolId as string,
						result
					);
				} catch ( error ) {
					logger( 'Tool %s execution failed: %s', toolId, error );
					return createToolResultDataPart(
						toolCallId as string,
						toolId as string,
						null,
						error instanceof Error ? error.message : String( error )
					);
				}
			} )
		);

		return {
			role: 'user' as const,
			parts: resultParts,
			metadata: { toolResults: true },
		};
	}

	return {
		async sendMessage( params: SendMessageParams ): Promise< Task > {
			const { message, sessionId, taskId, metadata } = params;
			const effectiveSessionId = sessionId || defaultSessionId;

			// Enhance message with tools if available
			const enhancedMessage = await enhanceMessageWithTools( message );

			const request = createSendTaskRequest( {
				id: taskId,
				sessionId: effectiveSessionId,
				message: enhancedMessage,
				metadata,
			} );

			const headers = await getHeaders();

			// Log the request details
			logRequest( 'POST', agentUrl, headers, request, proxy );

			const controller = new AbortController();
			const timeoutId = setTimeout( () => controller.abort(), timeout );

			try {
				const options = createFetchOptions(
					headers,
					JSON.stringify( request ),
					controller.signal
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
					throw new Error(
						`HTTP error! status: ${ response.status }`
					);
				}

				const data =
					( await response.json() ) as JsonRpcResponse< Task >;

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

				const task = data.result;

				// Check if the agent's response contains tool calls
				if ( task.status.message ) {
					const toolResultMessage = await processToolCalls(
						task.status.message
					);

					if ( toolResultMessage ) {
						// Send tool results back to agent and get final response
						logger( 'Sending tool results back to agent' );
						return await this.sendMessage( {
							message: toolResultMessage,
							sessionId: effectiveSessionId,
							taskId: task.id,
							metadata: { ...metadata, toolResults: true },
						} );
					}
				}

				return task;
			} catch ( error ) {
				clearTimeout( timeoutId );
				logger( 'Request failed with error: %O', error );
				if ( error instanceof Error ) {
					logger( 'Error message: %s', error.message );
					logger( 'Error stack: %s', error.stack );
				}
				throw error;
			}
		},

		async *sendMessageStream(
			params: SendMessageParams
		): AsyncIterable< TaskUpdate > {
			const { message, sessionId, taskId, metadata } = params;
			const effectiveSessionId = sessionId || defaultSessionId;

			// Enhance message with tools if available
			const enhancedMessage = await enhanceMessageWithTools( message );

			const request = createSendTaskRequest(
				{
					id: taskId,
					sessionId: effectiveSessionId,
					message: enhancedMessage,
					metadata,
				},
				'tasks/sendSubscribe'
			);

			const headers = await getHeaders();
			// Add streaming headers
			const streamHeaders = {
				...headers,
				Accept: 'text/event-stream',
			};

			// Log the request details
			logRequest( 'POST', agentUrl, streamHeaders, request, proxy );

			const controller = new AbortController();
			const timeoutId = setTimeout( () => controller.abort(), 60000 );

			try {
				const options = createFetchOptions(
					streamHeaders,
					JSON.stringify( request ),
					controller.signal
				);
				const response = await fetch( agentUrl, options as any );

				clearTimeout( timeoutId );

				if ( ! response.ok ) {
					throw new Error(
						`HTTP error! status: ${ response.status }`
					);
				}

				if ( ! response.body ) {
					throw new Error( 'No response body for streaming' );
				}

				// Parse the SSE stream and yield task updates
				yield* parseSSEStream(
					response.body as ReadableStream< Uint8Array >
				);
			} catch ( error ) {
				clearTimeout( timeoutId );
				throw error;
			}
		},

		async getTask( taskId: string ): Promise< Task > {
			// TODO: Implement task retrieval
			throw new Error( 'getTask not implemented yet' );
		},

		async cancelTask( taskId: string ): Promise< void > {
			// TODO: Implement task cancellation
			throw new Error( 'cancelTask not implemented yet' );
		},
	};
}

/**
 * Helper function to send a message and wait for completion
 * @param client
 * @param params
 */
export async function sendMessageAndWait(
	client: A2AClient,
	params: SendMessageParams
): Promise< Task > {
	for await ( const update of client.sendMessageStream( params ) ) {
		if ( update.final ) {
			return {
				id: update.id,
				status: update.status,
			};
		}
	}
	throw new Error( 'Stream ended without final result' );
}
