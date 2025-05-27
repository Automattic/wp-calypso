import type {
	A2AClient,
	A2AClientConfig,
	AuthProvider,
	ContextProvider,
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
	createToolResultDataPart,
	extractToolCallsFromMessage,
} from '../utils/index';
import { enhanceMessage } from '../utils/messages';
import {
	executeRequest,
	executeStreamingRequest,
	prepareRequest,
	type RequestConfig,
	type RequestOptions,
} from '../utils/requests';
import { parseSSEStream, streamToTask } from '../streaming/index';
import { formatObject, logger } from '../utils/logger';

/**
 * Default timeout for requests (30 seconds)
 */
const DEFAULT_TIMEOUT = 30000;

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
		contextProvider,
	} = config;

	// Create request configuration
	const requestConfig: RequestConfig = {
		agentUrl,
		authProvider,
		timeout,
		proxy,
	};

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
			// Prepare the request
			const preparedRequest = await prepareRequest(
				params,
				requestConfig,
				{ isStreaming: false },
				toolProvider,
				contextProvider,
				defaultSessionId
			);

			// Execute the request
			const task = await executeRequest( preparedRequest, requestConfig );

			// Check if the agent's response contains tool calls and execute them (non-blocking)
			if ( toolProvider && task.status.message ) {
				const toolCalls = extractToolCallsFromMessage(
					task.status.message
				);

				for ( const toolCall of toolCalls ) {
					const {
						toolCallId,
						toolId,
						arguments: args,
					} = toolCall.data;

					// Execute tool without blocking response
					toolProvider
						.executeTool( toolId as string, args )
						.then( ( result ) => {
							logger( 'Tool %s completed: %O', toolId, result );
						} )
						.catch( ( error ) => {
							logger( 'Tool %s failed: %s', toolId, error );
						} );
				}
			}

			return task;
		},

		async *sendMessageStream(
			params: SendMessageParams
		): AsyncIterable< TaskUpdate > {
			// Prepare the request
			const preparedRequest = await prepareRequest(
				params,
				requestConfig,
				{ isStreaming: true, streamingTimeout: 60000 },
				toolProvider,
				contextProvider,
				defaultSessionId
			);

			// Execute the streaming request
			yield* executeStreamingRequest( preparedRequest, requestConfig, {
				isStreaming: true,
				streamingTimeout: 60000,
			} );
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
