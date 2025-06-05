import type {
	Client,
	ClientConfig,
	DataPart,
	Message,
	SendMessageParams,
	Task,
	TaskUpdate,
	TextPart,
	ToolCallDataPart,
	ToolResultDataPart,
} from './types/index';
import {
	executeRequest,
	executeStreamingRequest,
	prepareRequest,
	type RequestConfig,
} from './utils/index';
import {
	createTextMessage,
	createToolResultDataPart,
	createToolResultMessage,
	extractTextFromMessage,
	extractToolCallsFromMessage,
} from './utils/index';
import { defaultDispatcher } from './utils/dispatcher';

/**
 * Default timeout for requests (2 minutes)
 */
const DEFAULT_TIMEOUT = 120000;

/**
 * Extract conversation history from a message's data parts
 *
 * @param message - The A2A message to extract conversation history from
 * @return Array of conversation messages reconstructed from data parts
 */
function extractConversationHistory( message: Message ): Message[] {
	const conversationMessages: Message[] = [];
	let currentMessage: Partial< Message > | null = null;

	for ( const part of message.parts ) {
		if ( part.type === 'data' && part.data ) {
			// History message parts
			if ( 'role' in part.data && 'text' in part.data ) {
				if (
					currentMessage &&
					currentMessage.role !== part.data.role
				) {
					// Role changed, finalize current message
					if ( currentMessage.role && currentMessage.parts ) {
						conversationMessages.push( currentMessage as Message );
					}
					currentMessage = {
						role: part.data.role as 'user' | 'agent',
						parts: [],
					};
				} else if ( ! currentMessage ) {
					currentMessage = {
						role: part.data.role as 'user' | 'agent',
						parts: [],
					};
				}

				if ( currentMessage.parts ) {
					currentMessage.parts.push( {
						type: 'text',
						text: part.data.text,
					} as TextPart );
				}
			}
			// Tool call and result parts - add to current message
			else if (
				currentMessage &&
				currentMessage.parts &&
				( 'toolCallId' in part.data || 'toolId' in part.data )
			) {
				currentMessage.parts.push( part );
			}
		}
	}

	// Finalize last message
	if ( currentMessage && currentMessage.role && currentMessage.parts ) {
		conversationMessages.push( currentMessage as Message );
	}

	return conversationMessages;
}

/**
 * Convert conversation history back to data parts
 *
 * @param conversationHistory - Array of conversation messages to convert
 * @return Array of data parts representing the conversation history
 */
function conversationHistoryToDataParts(
	conversationHistory: Message[]
): DataPart[] {
	const historyParts: DataPart[] = [];

	for ( const message of conversationHistory ) {
		for ( const part of message.parts ) {
			if ( part.type === 'text' ) {
				historyParts.push( {
					type: 'data',
					data: {
						role: message.role,
						text: ( part as TextPart ).text,
					},
				} );
			} else if ( part.type === 'data' ) {
				historyParts.push( part as DataPart );
			}
		}
	}

	return historyParts;
}

/**
 * Continue an existing task with additional input
 *
 * @param taskId          - The task ID to continue
 * @param message         - The message to send to continue the task
 * @param requestConfig   - Request configuration
 * @param toolProvider    - Tool provider for message enhancement
 * @param contextProvider - Context provider for message enhancement
 * @return Promise resolving to updated task
 */
async function continueTask(
	taskId: string,
	message: Message,
	requestConfig: RequestConfig,
	toolProvider?: any,
	contextProvider?: any
): Promise< Task > {
	const continueParams = {
		message,
		taskId,
		sessionId: undefined, // Use task's session
	};

	const preparedRequest = await prepareRequest(
		continueParams,
		requestConfig,
		{ isStreaming: false },
		toolProvider,
		contextProvider,
		undefined
	);

	return await executeRequest( preparedRequest, requestConfig );
}

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
 *   }
 *   // Tool results are automatically sent back to agent with conversation history
 * };
 *
 * const client = createClient({
 *   agentId: 'big-sky',
 *   toolProvider
 * });
 *
 * // Send a message - tools are handled automatically
 * const response = await client.sendMessage({ message, sessionId });
 *
 * // Handle human input requests (no tool calls in input-required state)
 * if (response.status.state === 'input-required') {
 *   const userInput = await promptUser(response.status.message);
 *   const finalResponse = await client.continueTask(response.id, userInput, sessionId);
 * }
 * ```
 *
 * @param config
 */
export function createClient( config: ClientConfig ): Client {
	const {
		agentId,
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
		agentId,
		agentUrl,
		authProvider,
		timeout,
		proxy,
		dispatcher,
	};

	return {
		async sendMessage( params: SendMessageParams ): Promise< TaskUpdate > {
			const { withHistory = true } = params;

			// Extract conversation history from the incoming message only if withHistory is true
			const conversationHistory = withHistory
				? extractConversationHistory( params.message )
				: [];

			// Add the initial user message to conversation history if it's not already there
			// This ensures the original user request is preserved for tool result context
			if (
				withHistory &&
				( conversationHistory.length === 0 ||
					conversationHistory[ conversationHistory.length - 1 ] !==
						params.message )
			) {
				conversationHistory.push( params.message );
			}

			// Prepare the request
			const preparedRequest = await prepareRequest(
				params,
				requestConfig,
				{ isStreaming: false },
				toolProvider,
				contextProvider,
				defaultSessionId
			);

			// Execute the initial request
			let currentTask = await executeRequest(
				preparedRequest,
				requestConfig
			);

			// Track all tool calls and results from the entire execution
			const allToolParts: ( ToolCallDataPart | ToolResultDataPart )[] =
				[];

			//Loop while there are tool calls to process, regardless of state
			while ( currentTask.status.message && toolProvider ) {
				const toolCalls = extractToolCallsFromMessage(
					currentTask.status.message
				);
				if ( toolCalls.length === 0 ) {
					break; // No tool calls to process
				}

				// Add tool calls to the tracking array
				allToolParts.push( ...toolCalls );

				// Execute all tool calls
				const toolResults: ToolResultDataPart[] = [];
				for ( const toolCall of toolCalls ) {
					const {
						toolCallId,
						toolId,
						arguments: args,
					} = toolCall.data;

					try {
						const result = await toolProvider.executeTool(
							toolId as string,
							args
						);

						const toolResult = createToolResultDataPart(
							toolCallId as string,
							toolId as string,
							result
						);

						toolResults.push( toolResult );
						allToolParts.push( toolResult );
					} catch ( error ) {
						const toolResult = createToolResultDataPart(
							toolCallId as string,
							toolId as string,
							undefined,
							error instanceof Error
								? error.message
								: String( error )
						);

						toolResults.push( toolResult );
						allToolParts.push( toolResult );
					}
				}

				// Add current agent message to conversation history (only if withHistory is true)
				if ( withHistory ) {
					conversationHistory.push( currentTask.status.message );
				}

				// Create tool result message with conversation history (if enabled)
				const historyDataParts = withHistory
					? conversationHistoryToDataParts( conversationHistory )
					: [];

				const toolResultMessage = createToolResultMessage(
					toolResults,
					historyDataParts
				);

				// Continue the same task with tool results
				currentTask = await continueTask(
					currentTask.id,
					toolResultMessage,
					requestConfig,
					toolProvider,
					contextProvider
				);
			}

			// Enhance the final task response to include all tool calls and results
			// This ensures useAgent can capture them in conversation history
			if ( allToolParts.length > 0 && currentTask.status?.message ) {
				const enhancedMessage: Message = {
					...currentTask.status.message,
					parts: [
						...allToolParts,
						...currentTask.status.message.parts,
					],
				};

				currentTask = {
					...currentTask,
					status: {
						...currentTask.status,
						message: enhancedMessage,
					},
				};
			}

			return {
				...currentTask,
				text: extractTextFromMessage(
					currentTask.status?.message || { role: 'agent', parts: [] }
				),
			};
		},

		async *sendMessageStream(
			params: SendMessageParams
		): AsyncIterable< TaskUpdate > {
			const { withHistory = true } = params;

			// Extract conversation history from the incoming message only if withHistory is true
			const conversationHistory = withHistory
				? extractConversationHistory( params.message )
				: [];

			// Add the initial user message to conversation history if it's not already there
			// This ensures the original user request is preserved for tool result context
			if (
				withHistory &&
				( conversationHistory.length === 0 ||
					conversationHistory[ conversationHistory.length - 1 ] !==
						params.message )
			) {
				conversationHistory.push( params.message );
			}

			// Prepare the request
			const preparedRequest = await prepareRequest(
				params,
				requestConfig,
				{ isStreaming: true, streamingTimeout: timeout },
				toolProvider,
				contextProvider,
				defaultSessionId
			);

			// Execute the streaming request
			for await ( const update of executeStreamingRequest(
				preparedRequest,
				requestConfig,
				{
					isStreaming: true,
					streamingTimeout: timeout,
				}
			) ) {
				yield update;
				if (
					update.status.state === 'input-required' &&
					update.status.message &&
					toolProvider
				) {
					const toolCalls = extractToolCallsFromMessage(
						update.status.message
					);
					if ( toolCalls.length > 0 ) {
						// Execute all tool calls
						const toolResults: ToolResultDataPart[] = [];
						for ( const toolCall of toolCalls ) {
							const {
								toolCallId,
								toolId,
								arguments: args,
							} = toolCall.data;
							try {
								const result = await toolProvider.executeTool(
									toolId as string,
									args
								);

								toolResults.push(
									createToolResultDataPart(
										toolCallId as string,
										toolId as string,
										result
									)
								);
							} catch ( error ) {
								toolResults.push(
									createToolResultDataPart(
										toolCallId as string,
										toolId as string,
										undefined,
										error instanceof Error
											? error.message
											: String( error )
									)
								);
							}
						}

						// Add current agent message to conversation history (only if withHistory is true)
						if ( withHistory ) {
							conversationHistory.push( update.status.message );
						}

						// Create tool result message with conversation history (if enabled)
						const historyDataParts = withHistory
							? conversationHistoryToDataParts(
									conversationHistory
							  )
							: [];

						const toolResultMessage = createToolResultMessage(
							toolResults,
							historyDataParts
						);

						yield {
							id: update.id,
							status: {
								state: 'working',
								message: toolResultMessage,
							},
							final: false,
							text: '',
						};

						// Continue the task with tool results and stream the continuation
						const continuedTaskUpdate = await continueTask(
							update.id,
							toolResultMessage,
							requestConfig,
							toolProvider,
							contextProvider
						);

						// Yield the continued task result
						yield {
							...continuedTaskUpdate,
							final: true,
							text: extractTextFromMessage(
								continuedTaskUpdate.status?.message || {
									role: 'agent',
									parts: [],
								}
							),
						};
					}
				}
			}
		},

		async continueTask(
			taskId: string,
			userInput: string,
			sessionId?: string
		): Promise< TaskUpdate > {
			// Create a simple text message for user input
			const userMessage = createTextMessage( userInput );

			// Continue the task with user input
			const continuedTask = await continueTask(
				taskId,
				userMessage,
				requestConfig,
				toolProvider,
				contextProvider
			);

			// Process any tool calls in the continued response
			let currentTask = continuedTask;
			while (
				currentTask.status.state === 'input-required' &&
				currentTask.status.message &&
				toolProvider
			) {
				const toolCalls = extractToolCallsFromMessage(
					currentTask.status.message
				);
				if ( toolCalls.length === 0 ) {
					break; // No tool calls, likely human input required again
				}

				// Execute tool calls (same logic as sendMessage)
				const toolResults: ToolResultDataPart[] = [];
				for ( const toolCall of toolCalls ) {
					const {
						toolCallId,
						toolId,
						arguments: args,
					} = toolCall.data;
					try {
						const result = await toolProvider.executeTool(
							toolId as string,
							args
						);
						toolResults.push(
							createToolResultDataPart(
								toolCallId as string,
								toolId as string,
								result
							)
						);
					} catch ( error ) {
						toolResults.push(
							createToolResultDataPart(
								toolCallId as string,
								toolId as string,
								undefined,
								error instanceof Error
									? error.message
									: String( error )
							)
						);
					}
				}

				// Continue with tool results
				const toolResultMessage =
					createToolResultMessage( toolResults );

				currentTask = await continueTask(
					currentTask.id,
					toolResultMessage,
					requestConfig,
					toolProvider,
					contextProvider
				);
			}

			return {
				...currentTask,
				text: extractTextFromMessage(
					currentTask.status?.message || { role: 'agent', parts: [] }
				),
			};
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
): Promise< TaskUpdate > {
	for await ( const update of client.sendMessageStream( params ) ) {
		if ( update.final ) {
			return {
				id: update.id,
				status: update.status,
				final: update.final,
				artifact: update.artifact,
				text: update.text,
			};
		}
	}
	throw new Error( 'Stream ended without final result' );
}
