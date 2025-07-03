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
	processToolExecutionResult,
	createAgentTextMessage,
	generateMessageId,
} from './utils/index';
import { defaultDispatcher } from './utils/dispatcher';

/**
 * Default timeout for requests (2 minutes)
 */
const DEFAULT_TIMEOUT = 120000;

/**
 * Execute a batch of tool calls and return their results
 * @param toolCalls
 * @param toolProvider
 * @param messageId
 */
async function executeToolCallBatch(
	toolCalls: ToolCallDataPart[],
	toolProvider: any,
	messageId?: string
): Promise< {
	results: ToolResultDataPart[];
	shouldReturnToAgent: boolean;
	agentMessages: Message[];
} > {
	const results: ToolResultDataPart[] = [];
	const agentMessages: Message[] = [];
	let shouldReturnToAgent = false;

	for ( const toolCall of toolCalls ) {
		const { toolCallId, toolId, arguments: args } = toolCall.data;

		try {
			const executionResult = await toolProvider.executeTool(
				toolId as string,
				args,
				messageId,
				toolCallId as string 
			);
			const { result, returnToAgent, agentMessage } =
				processToolExecutionResult( executionResult );

			if ( returnToAgent ) {
				shouldReturnToAgent = true;
			}

			if ( agentMessage ) {
				agentMessages.push( createAgentTextMessage( agentMessage ) );
			}

			results.push(
				createToolResultDataPart(
					toolCallId as string,
					toolId as string,
					result
				)
			);
		} catch ( error ) {
			shouldReturnToAgent = true;
			results.push(
				createToolResultDataPart(
					toolCallId as string,
					toolId as string,
					undefined,
					error instanceof Error ? error.message : String( error )
				)
			);
		}
	}

	return { results, shouldReturnToAgent, agentMessages };
}

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
	contextProvider?: any,
	sessionId?: string
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
		sessionId
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
			const sessionId = params.sessionId || defaultSessionId || undefined;

			// Extract conversation history from the incoming message only if withHistory is true
			const initialConversationHistory = withHistory
				? extractConversationHistory( params.message )
				: [];

			// Track new conversation parts since the initial message for tool result context
			const newConversationParts: Message[] = [];

			// Add the initial user message to new conversation parts
			if ( withHistory ) {
				newConversationParts.push( params.message );
			}

			// Prepare the request
			const preparedRequest = await prepareRequest(
				params,
				requestConfig,
				{ isStreaming: false },
				toolProvider,
				contextProvider,
				sessionId
			);

			// Execute the initial request
			let currentTask = await executeRequest(
				preparedRequest,
				requestConfig
			);

			// Track all tool calls and results from the entire execution
			const allToolParts: ( ToolCallDataPart | ToolResultDataPart )[] =
				[];

			// Track agent messages from tool executions
			const agentMessages: Message[] = [];

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
				let shouldReturnToAgent = false;

				for ( const toolCall of toolCalls ) {
					const {
						toolCallId,
						toolId,
						arguments: args,
					} = toolCall.data;

					try {
						const executionResult = await toolProvider.executeTool(
							toolId as string,
							args
						);
						const { result, returnToAgent, agentMessage } = processToolExecutionResult( executionResult );

						// Mark that at least one tool wants to return to agent
						if ( returnToAgent ) {
							shouldReturnToAgent = true;
						}

						// Create agent message if provided
						if ( agentMessage ) {
							agentMessages.push( createAgentTextMessage( agentMessage ) );
						}

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

				// Add current agent message to new conversation parts (only if withHistory is true)
				if ( withHistory ) {
					newConversationParts.push( currentTask.status.message );
				}

				// Only continue with tool results if at least one tool wants to return to agent
				if ( shouldReturnToAgent ) {
					// Continue with tool results
					const toolResultMessage =
						createToolResultMessage( toolResults );

					currentTask = await continueTask(
						currentTask.id,
						toolResultMessage,
						requestConfig,
						toolProvider,
						contextProvider,
						sessionId
					);
				} else {
					// Tools executed but don't want to return to agent
					// Break out of loop to prevent further agent communication
					break;
				}
			}

			// Enhance the final task response to include all tool calls and results
			// This ensures useAgent can capture them in conversation history
			if ( allToolParts.length > 0 ) {
				if ( currentTask.status?.message ) {
					// Create a new message with tool parts only (no agent text)
					const enhancedMessage: Message = {
						...currentTask.status.message,
						parts: allToolParts,
					};

					currentTask = {
						...currentTask,
						status: {
							...currentTask.status,
							message: enhancedMessage,
						},
					};
				}
			}

			// If we have agent messages, create a separate final agent message
			if ( agentMessages.length > 0 ) {
				// Combine all agent message texts
				const combinedAgentText = agentMessages
					.map( msg => extractTextFromMessage( msg ) )
					.join( ' ' );

				// Create a separate agent text message
				const finalAgentMessage = createAgentTextMessage( combinedAgentText );

				return {
					...currentTask,
					// Keep the enhanced message with tool results
					// The agent message will be handled separately by the caller
					text: combinedAgentText,
					agentMessage: finalAgentMessage, // Add this for the caller to handle
				};
			}

			return {
				...currentTask,
				text: extractTextFromMessage(
					currentTask.status?.message || { role: 'agent', kind: 'message', parts: [], messageId: generateMessageId() }
				),
			};
		},

		async *sendMessageStream(
			params: SendMessageParams
		): AsyncIterable< TaskUpdate > {
			const { withHistory = true } = params;
			const sessionId = params.sessionId || defaultSessionId || undefined;

			// Extract conversation history from the incoming message only if withHistory is true
			const initialConversationHistory = withHistory
				? extractConversationHistory( params.message )
				: [];

			// Track new conversation parts since the initial message for tool result context
			const newConversationParts: Message[] = [];

			// Add the initial user message to new conversation parts
			if ( withHistory ) {
				newConversationParts.push( params.message );
			}

			// Prepare the request
			const preparedRequest = await prepareRequest(
				params,
				requestConfig,
				{ isStreaming: true, streamingTimeout: timeout },
				toolProvider,
				contextProvider,
				sessionId
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
						let shouldReturnToAgent = false;

						// Track tool calls and results for message enhancement
						const toolParts: ( ToolCallDataPart | ToolResultDataPart )[] = [];

						// Track agent messages from tool executions
						const agentMessages: Message[] = [];
						for ( const toolCall of toolCalls ) {
							const {
								toolCallId,
								toolId,
								arguments: args,
							} = toolCall.data;
							try {
								const executionResult = await toolProvider.executeTool(
									toolId as string,
									args,
									update.status?.message?.messageId,
									toolCallId as string 
								);
								const { result, returnToAgent, agentMessage } = processToolExecutionResult( executionResult );

								// Mark that at least one tool wants to return to agent
								if ( returnToAgent ) {
									shouldReturnToAgent = true;
								}

								// Create agent message if provided
								if ( agentMessage ) {
									agentMessages.push( createAgentTextMessage( agentMessage ) );
								}

								const toolResult = createToolResultDataPart(
									toolCallId as string,
									toolId as string,
									result
								);

								toolResults.push( toolResult );
								// Add tool result to tracking
								toolParts.push( toolResult );
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
								// Add tool result to tracking
								toolParts.push( toolResult );
							}
						}

						// Add current agent message to new conversation parts (only if withHistory is true)
						if ( withHistory ) {
							newConversationParts.push( update.status.message );
						}

						// Only continue to agent if at least one tool wants to return
						if ( shouldReturnToAgent ) {
							// Create tool result message with only NEW conversation parts since initial message
							// This avoids duplicating the conversation history that was already sent initially
							const historyDataParts = withHistory
								? conversationHistoryToDataParts(
										newConversationParts
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
								contextProvider,
								sessionId
							);

							// Check if the continued task has more tool calls to process
							let continuedToolCalls = continuedTaskUpdate.status
								?.message
								? extractToolCallsFromMessage(
										continuedTaskUpdate.status.message
								  )
								: [];

							// Add the first tool results to conversation history before processing additional calls
							if ( withHistory && toolResults.length > 0 ) {
								newConversationParts.push( {
									role: 'agent' as const,
									kind: 'message',
									parts: toolResults,
									messageId: generateMessageId(),
								} );
							}

							// Process any additional tool calls from the continued task
							let finalTask = continuedTaskUpdate;

							if ( continuedToolCalls.length > 0 ) {
								yield {
									...continuedTaskUpdate,
									final: false,
									text: extractTextFromMessage(
										continuedTaskUpdate.status?.message || {
											role: 'agent',
											kind: 'message',
											parts: [],
											messageId: generateMessageId(),
										}
									),
								};

								// Process additional tool calls
								while ( continuedToolCalls.length > 0 ) {
									// Add the current task message (with additional tool calls) to conversation history FIRST
									if (
										withHistory &&
										finalTask.status?.message
									) {
										newConversationParts.push(
											finalTask.status.message
										);
									}

									// Execute the additional tool calls
									const {
										results: moreResults,
										shouldReturnToAgent: moreShouldReturn,
									} = await executeToolCallBatch(
										continuedToolCalls,
										toolProvider,
										finalTask.status?.message?.messageId
									);

									// Yield an update with the tool results for the UI to capture
									if ( moreResults.length > 0 ) {
										yield {
											id: finalTask.id,
											status: {
												state: 'working',
												message: { role: 'agent', kind: 'message', parts: moreResults, messageId: generateMessageId() }, // Simple message with just the results
											},
											final: false,
											text: '',
										};
									}

									if ( moreShouldReturn ) {
										// Include conversation history with additional tool results
										const moreHistoryDataParts = withHistory
											? conversationHistoryToDataParts(
													newConversationParts
											  )
											: [];

										const moreResultMessage =
											createToolResultMessage(
												moreResults,
												moreHistoryDataParts
											);
										finalTask = await continueTask(
											finalTask.id,
											moreResultMessage,
											requestConfig,
											toolProvider,
											contextProvider,
											sessionId
										);

										// Check for more tool calls in the response
										continuedToolCalls = finalTask.status
											?.message
											? extractToolCallsFromMessage(
													finalTask.status.message
											  )
											: [];

										// Only yield intermediate result if there are more tool calls coming
										if ( continuedToolCalls.length > 0 ) {
											yield {
												id: finalTask.id,
												status: finalTask.status,
												final: false,
												text: extractTextFromMessage(
													finalTask.status
														?.message || {
														role: 'agent',
														kind: 'message',
														parts: [],
														messageId: generateMessageId(),
													}
												),
											};
										}
									} else {
										break;
									}
								}
							}

							// Single final result - regardless of whether we processed additional tool calls or not
							yield {
								...finalTask,
								final: true,
								text: extractTextFromMessage(
									finalTask.status?.message || {
										role: 'agent',
										kind: 'message',
										parts: [],
										messageId: generateMessageId(),
									}
								),
							};
						} else {
							// Tools executed but don't want to return to agent
							// Create message with tool results only (no agent text)
							const enhancedMessage: Message = {
								...update.status.message,
								parts: toolParts,
							};

							const enhancedUpdate = {
								...update,
								status: {
									...update.status,
									message: enhancedMessage,
								},
								final: agentMessages.length === 0, // Only final if no agent messages to follow
								text: extractTextFromMessage( enhancedMessage ),
							};

							// First yield the tool results
							yield enhancedUpdate;

							// If we have agent messages, yield them as a separate message
							if ( agentMessages.length > 0 ) {
								const combinedAgentText = agentMessages
									.map( msg => extractTextFromMessage( msg ) )
									.join( ' ' );


								const finalAgentMessage = createAgentTextMessage( combinedAgentText );

								// Yield agent message as completely separate TaskUpdate
								yield {
									id: enhancedUpdate.id,
									status: {
										state: 'completed',
										message: finalAgentMessage,
									},
									final: true,
									text: combinedAgentText,
								};
							}
						}
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
				contextProvider,
				sessionId
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

				// Execute tool calls
				const { results: toolResults, shouldReturnToAgent } =
					await executeToolCallBatch( toolCalls, toolProvider );

				// Only continue with tool results if at least one tool wants to return to agent
				if ( shouldReturnToAgent ) {
					// Continue with tool results
					const toolResultMessage =
						createToolResultMessage( toolResults );

					currentTask = await continueTask(
						currentTask.id,
						toolResultMessage,
						requestConfig,
						toolProvider,
						contextProvider,
						sessionId
					);
				} else {
					// Tools executed but don't want to return to agent
					// Break out of loop to prevent further agent communication
					break;
				}
			}

			return {
				...currentTask,
				text: extractTextFromMessage(
					currentTask.status?.message || { role: 'agent', kind: 'message', parts: [], messageId: generateMessageId() }
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
