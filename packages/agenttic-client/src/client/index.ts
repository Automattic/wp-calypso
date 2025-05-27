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
		dispatcher,
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
