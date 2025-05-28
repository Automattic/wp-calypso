import type {
	Client,
	ClientConfig,
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
import { createRequestId, createSendTaskRequest } from '../utils/index';
import { enhanceMessage } from '../utils/messages';
import { processTaskToolCalls } from '../utils/tools';
import {
	executeRequest,
	executeStreamingRequest,
	prepareRequest,
	type RequestConfig,
	type RequestOptions,
} from '../utils/requests';
import { parseSSEStream, streamToTask } from '../streaming/index';
import { formatObject, logger } from '../utils/logger';
import { defaultDispatcher } from '../utils/dispatcher';

/**
 * Default timeout for requests (30 seconds)
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * Create an agent client instance
 *
 * @example
 * ```typescript
 * const toolProvider: ToolProvider = {
 *   async getAvailableTools() {
 *     return [{ id: 'calculator', name: 'Calculator', description: 'Perform calculations', input_schema: { type: 'object', properties: {} } }];
 *   },
 *   async executeTool(toolId: string, args: any) {
 *     if (toolId === 'calculator') {
 *       return { result: eval(args.expression) };
 *     }
 *     throw new Error(`Unknown tool: ${toolId}`);
 *   },
 *   onToolCompletion: (toolResult) => {
 *     console.log('Tool completed:', toolResult);
 *     // Send the tool result back to the agent or handle it as needed
 *     // toolResult.data contains: { toolCallId, toolId, result }
 *   }
 * };
 *
 * const client = createClient({
 *   agentUrl: 'https://api.example.com',
 *   toolProvider
 * });
 * ```
 *
 * @param config
 */
export function createClient( config: ClientConfig ): Client {
	const {
		agentUrl,
		authProvider,
		defaultSessionId,
		timeout = DEFAULT_TIMEOUT,
		proxy,
		toolProvider,
		contextProvider,
		dispatcher = defaultDispatcher,
	} = config;

	// Create request configuration
	const requestConfig: RequestConfig = {
		agentUrl,
		authProvider,
		timeout,
		proxy,
		dispatcher,
	};

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

			// Process any tool calls in the response asynchronously
			await processTaskToolCalls( task, toolProvider );

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

			// Execute the streaming request and process tool calls for each update
			for await ( const update of executeStreamingRequest(
				preparedRequest,
				requestConfig,
				{
					isStreaming: true,
					streamingTimeout: 60000,
				}
			) ) {
				// Process any tool calls in the update asynchronously
				if ( update.status?.message ) {
					await processTaskToolCalls(
						{
							id: update.id,
							status: update.status,
						},
						toolProvider
					);
				}

				yield update;
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
	client: Client,
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
