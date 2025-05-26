import type {
	A2AClient,
	A2AClientConfig,
	AuthProvider,
	SendMessageParams,
	Task,
	TaskUpdate,
	SendTaskRequest,
	JsonRpcResponse,
} from '../types/index';
import { createRequestId, createSendTaskRequest } from '../utils/index';
import { parseSSEStream, streamToTask } from '../streaming/index';
import { SocksProxyAgent } from 'socks-proxy-agent';
import fetch from 'node-fetch';

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
	headers: Record<string, string>,
	body?: any,
	proxy?: string
) {
	// Check if we're in verbose mode by looking for a global verbose flag
	// This is a bit of a hack, but allows us to show debug info from the client
	if (
		process.env.AGENTTIC_VERBOSE === 'true' ||
		(globalThis as any).__AGENTTIC_VERBOSE__
	) {
		console.log('\n🔍 Request Details:');
		console.log(`   Method: ${method}`);
		console.log(`   URL: ${url}`);
		if (proxy) {
			console.log(`   Proxy: ${proxy}`);
		}
		console.log('   Headers:');
		Object.entries(headers).forEach(([key, value]) => {
			// Mask sensitive headers for security
			const maskedValue = key.toLowerCase().includes('authorization')
				? value.substring(0, 10) + '...'
				: value;
			console.log(`     ${key}: ${maskedValue}`);
		});
		if (body) {
			console.log('   Body:');
			console.log(
				'    ',
				JSON.stringify(body, null, 2).split('\n').join('\n     ')
			);
		}
		console.log('');
	}
}

/**
 * Create an A2A client instance
 * @param config
 */
export function createA2AClient(config: A2AClientConfig): A2AClient {
	const {
		agentUrl,
		authProvider,
		defaultSessionId,
		timeout = DEFAULT_TIMEOUT,
		proxy,
	} = config;

	/**
	 * Get headers for requests
	 */
	async function getHeaders(): Promise<Record<string, string>> {
		const baseHeaders: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		if (authProvider) {
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
		headers: Record<string, string>,
		body: string,
		signal: AbortSignal
	): any {
		const options: any = {
			method: 'POST',
			headers,
			body,
			signal,
		};

		// Add proxy agent if proxy is configured
		// For node-fetch, we use the agent property
		if (proxy) {
			const proxyAgent = new SocksProxyAgent(proxy);
			options.agent = proxyAgent;
		}

		return options;
	}

	return {
		async sendMessage(params: SendMessageParams): Promise<Task> {
			const { message, sessionId, taskId, metadata } = params;
			const effectiveSessionId = sessionId || defaultSessionId;

			const request = createSendTaskRequest({
				id: taskId,
				sessionId: effectiveSessionId,
				message,
				metadata,
			});

			const headers = await getHeaders();

			// Log the request details
			logRequest('POST', agentUrl, headers, request, proxy);

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			try {
				const fetchOptions = createFetchOptions(
					headers,
					JSON.stringify(request),
					controller.signal
				);
				const response = await fetch(agentUrl, fetchOptions);

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new Error(
						`Agent request failed: ${response.status} ${response.statusText}`
					);
				}

				const result: any = await response.json();

				if (result.error) {
					throw new Error(`Agent error: ${result.error.message}`);
				}

				return result.result;
			} catch (error) {
				clearTimeout(timeoutId);
				throw error;
			}
		},

		async *sendMessageStream(
			params: SendMessageParams
		): AsyncIterable<TaskUpdate> {
			const { message, sessionId, taskId, metadata } = params;
			const effectiveSessionId = sessionId || defaultSessionId;

			const request = createSendTaskRequest(
				{
					id: taskId,
					sessionId: effectiveSessionId,
					message,
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
			logRequest('POST', agentUrl, streamHeaders, request, proxy);

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			try {
				const fetchOptions = createFetchOptions(
					streamHeaders,
					JSON.stringify(request),
					controller.signal
				);
				const response = await fetch(agentUrl, fetchOptions);

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new Error(
						`Agent streaming request failed: ${response.status} ${response.statusText}`
					);
				}

				if (!response.body) {
					throw new Error('No response body for streaming request');
				}

				// Parse the SSE stream - convert node-fetch ReadableStream to web ReadableStream
				const webStream = response.body as any;
				yield* parseSSEStream(webStream);
			} catch (error) {
				clearTimeout(timeoutId);
				throw error;
			}
		},

		async getTask(taskId: string): Promise<Task> {
			// TODO: Implement task retrieval
			throw new Error('getTask not implemented yet');
		},

		async cancelTask(taskId: string): Promise<void> {
			// TODO: Implement task cancellation
			throw new Error('cancelTask not implemented yet');
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
): Promise<Task> {
	for await (const update of client.sendMessageStream(params)) {
		if (update.final) {
			return {
				id: update.id,
				status: update.status,
			};
		}
	}
	throw new Error('Stream ended without final result');
}
