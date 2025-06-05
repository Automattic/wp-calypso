import { useCallback, useRef, useState } from '@wordpress/element';
import { createClient } from '../client/index';
import { createTextPart } from '../client/utils/index';
import type {
	Client,
	ClientConfig,
	DataPart,
	Message,
	Part,
	SendMessageParams,
	Task,
	TaskUpdate,
	TextPart,
} from '../client/types/index';

/**
 * UI ChatMessage interface for consumer components
 */
export interface ChatMessage {
	role: 'user' | 'agent';
	content: string | any; // Allow string or JSX.Element for flexible content
	timestamp: number;
}

/**
 * Create a simple text message for React usage (no conversation history)
 *
 * @param text - The text content for the message
 * @return A Message object with a single text part
 */
function createTextMessage( text: string ): Message {
	return {
		role: 'user',
		parts: [ createTextPart( text ) ],
	};
}

/**
 * Extract only the new content (non-history) parts from a message
 * This helps avoid storing history data parts in conversation history
 *
 * @param message - The message to extract new content from
 * @return A clean message with only new content parts
 */
function extractNewContentFromMessage( message: Message ): Message {
	const newParts = message.parts.filter( ( part ) => {
		// Keep text parts as they represent the actual message content
		if ( part.type === 'text' ) {
			return true;
		}
		if ( part.type === 'data' ) {
			// EXCLUDE conversation history data parts (role + text combinations)
			if ( 'role' in part.data && 'text' in part.data ) {
				return false;
			}

			// INCLUDE tool calls (have toolCallId + toolId + arguments)
			if ( 'toolCallId' in part.data && 'arguments' in part.data ) {
				return true;
			}

			// INCLUDE tool results (have toolCallId + result)
			if ( 'toolCallId' in part.data && 'result' in part.data ) {
				return true;
			}

			// EXCLUDE tool definitions and context data (toolId without toolCallId, clientContext, etc.)
			// These are usually provided by the system and shouldn't be stored in conversation history
			return false;
		}
		return true;
	} );

	return {
		...message,
		parts: newParts,
	};
}

/**
 * Convert conversation messages to data parts for history
 *
 * @param conversationMessages - Array of previous conversation messages
 * @return Array of data parts representing conversation history
 */
function conversationMessagesToDataParts(
	conversationMessages: Message[]
): DataPart[] {
	const historyParts: DataPart[] = [];

	for ( const message of conversationMessages ) {
		for ( const part of message.parts ) {
			if ( part.type === 'text' ) {
				// Convert text parts to history data parts
				historyParts.push( {
					type: 'data',
					data: {
						role: message.role,
						text: ( part as TextPart ).text,
					},
				} );
			} else if ( part.type === 'data' ) {
				// Only pass through tool calls and tool results, NOT conversation history data parts
				// EXCLUDE conversation history data parts (role + text combinations)
				if ( 'role' in part.data && 'text' in part.data ) {
					continue; // Skip conversation history data parts
				}

				// INCLUDE tool calls (have toolCallId + arguments)
				if ( 'toolCallId' in part.data && 'arguments' in part.data ) {
					historyParts.push( part as DataPart );
					continue;
				}

				// INCLUDE tool results (have toolCallId + result)
				if ( 'toolCallId' in part.data && 'result' in part.data ) {
					historyParts.push( part as DataPart );
					continue;
				}

				// Skip all other data parts (tool definitions, context, etc.)
			}
		}
	}

	return historyParts;
}

/**
 * Create A2A message with conversation history from Message array
 *
 * @param text                 - The user text message to send
 * @param conversationMessages - Array of previous conversation messages
 * @return A2A Message with history and current text
 */
function createTextMessageWithHistory(
	text: string,
	conversationMessages: Message[] = []
): Message {
	const historyParts =
		conversationMessagesToDataParts( conversationMessages );

	return {
		role: 'user',
		parts: [
			...historyParts,
			{
				type: 'text',
				text,
			} as TextPart,
		],
	};
}

/**
 * Extract tool calls from a message
 *
 * @param message - The message to check for tool calls
 * @return Array of tool call parts
 */
function extractToolCallsFromMessage( message?: Message ): DataPart[] {
	if ( ! message?.parts ) {
		return [];
	}

	return message.parts.filter(
		( part: any ) =>
			part.type === 'data' &&
			'toolCallId' in part.data &&
			'toolId' in part.data &&
			'arguments' in part.data
	) as DataPart[];
}

/**
 * Configuration for the useAgent hook
 */
export interface UseAgentConfig extends Omit< ClientConfig, 'dispatcher' > {
	// Browser-specific config options can be added here
}

/**
 * State for the agent hook
 */
export interface AgentState {
	isConnected: boolean;
	isLoading: boolean;
	error: string | null;
	lastResponse: Task | null;
	conversationHistory: Message[];
}

/**
 * Return type for the useAgent hook
 */
export interface UseAgentReturn {
	// State
	state: AgentState;

	// Actions
	sendMessage: (
		message: string,
		options?: Partial< SendMessageParams >
	) => Promise< Task >;
	sendMessageStream: (
		message: string,
		options?: Partial< SendMessageParams >
	) => AsyncIterable< TaskUpdate >;

	// Utilities
	clearError: () => void;
	reset: () => void;
	resetConversation: () => void;
	getTextMessage: ( message: Message ) => ChatMessage;
}

/**
 * React hook for managing agent client connections and message sending
 *
 * @param config - Configuration for the agent client
 * @return Object containing state and actions for agent interaction
 */
export function useAgent( config: UseAgentConfig ): UseAgentReturn {
	// Initialize client once on mount
	const clientRef = useRef< Client | null >( null );
	const [ initError, setInitError ] = useState< string | null >( null );

	// Initialize client only once
	if ( ! clientRef.current && ! initError ) {
		try {
			clientRef.current = createClient( {
				...config,
			} );
		} catch ( error ) {
			setInitError(
				error instanceof Error
					? error.message
					: 'Failed to initialize client'
			);
		}
	}

	const [ state, setState ] = useState< AgentState >( {
		isConnected: !! clientRef.current,
		isLoading: false,
		error: initError,
		lastResponse: null,
		conversationHistory: [],
	} );

	const sendMessage = useCallback(
		async (
			messageText: string,
			options: Partial< SendMessageParams > = {}
		): Promise< Task > => {
			if ( ! clientRef.current ) {
				throw new Error( 'Client not initialized' );
			}

			const { withHistory = true, ...otherOptions } = options;

			setState( ( prev ) => ( {
				...prev,
				isLoading: true,
				error: null,
			} ) );

			try {
				const message: Message =
					options.message ||
					( withHistory
						? createTextMessageWithHistory(
								messageText,
								state.conversationHistory
						  )
						: createTextMessage( messageText ) );

				const task = await clientRef.current.sendMessage( {
					message,
					withHistory,
					...otherOptions,
				} );

				// Create a complete agent message with tool calls and results if present
				let completeAgentMessage: Message | null = null;
				if ( withHistory && task.status?.message ) {
					// Extract all tool-related parts from the final message
					const toolParts = task.status.message.parts.filter(
						( part ) =>
							part.type === 'data' &&
							'toolCallId' in part.data &&
							( 'arguments' in part.data ||
								'result' in part.data )
					);

					// Extract text parts from final message
					const textParts = task.status.message.parts.filter(
						( part ) => part.type === 'text'
					);

					// Create complete message with tool parts + text parts in proper order
					completeAgentMessage = {
						role: 'agent',
						parts: [ ...toolParts, ...textParts ],
					};
				}

				setState( ( prev ) => ( {
					...prev,
					isLoading: false,
					lastResponse: task,
					// Update conversation history only if withHistory is true
					// Store only clean messages without history data parts to avoid duplication
					conversationHistory: withHistory
						? [
								...prev.conversationHistory,
								// Store only the new content from the user message (without history parts)
								createTextMessage( messageText ),
								// Add complete agent response with tool calls/results if present
								...( completeAgentMessage
									? [
											extractNewContentFromMessage(
												completeAgentMessage
											),
									  ]
									: [] ),
						  ]
						: prev.conversationHistory,
				} ) );

				return task;
			} catch ( error ) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to send message';
				setState( ( prev ) => ( {
					...prev,
					isLoading: false,
					error: errorMessage,
				} ) );
				throw error;
			}
		},
		[ state.conversationHistory ]
	);

	const sendMessageStream = useCallback(
		async function* (
			messageText: string,
			options: Partial< SendMessageParams > = {}
		): AsyncIterable< TaskUpdate > {
			if ( ! clientRef.current ) {
				throw new Error( 'Client not initialized' );
			}

			const { withHistory = true, ...otherOptions } = options;

			setState( ( prev ) => ( {
				...prev,
				isLoading: true,
				error: null,
			} ) );

			try {
				const message: Message =
					options.message ||
					( withHistory
						? createTextMessageWithHistory(
								messageText,
								state.conversationHistory
						  )
						: createTextMessage( messageText ) );

				// Add user message to conversation history before streaming (only if withHistory is true)
				// Store only the clean message without history parts
				if ( withHistory ) {
					setState( ( prev ) => ( {
						...prev,
						conversationHistory: [
							...prev.conversationHistory,
							createTextMessage( messageText ),
						],
					} ) );
				}

				let finalUpdate: TaskUpdate | null = null;
				const accumulatedParts: Part[] = [];

				for await ( const update of clientRef.current.sendMessageStream(
					{
						message,
						withHistory,
						...otherOptions,
					}
				) ) {
					finalUpdate = update;
					yield update;

					// Accumulate tool-related parts from all updates
					if ( update.status?.message?.parts ) {
						for ( const part of update.status.message.parts ) {
							// Collect tool calls and tool results from streaming updates
							if (
								part.type === 'data' &&
								( ( 'toolCallId' in part.data &&
									'arguments' in part.data ) ||
									( 'toolCallId' in part.data &&
										'result' in part.data ) )
							) {
								// Avoid duplicates by checking if we already have this part
								const isDuplicate = accumulatedParts.some(
									( existingPart ) =>
										existingPart.type === 'data' &&
										'toolCallId' in existingPart.data &&
										'toolCallId' in part.data &&
										existingPart.data.toolCallId ===
											part.data.toolCallId &&
										// Same type (both calls or both results)
										( ( 'arguments' in existingPart.data &&
											'arguments' in part.data ) ||
											( 'result' in existingPart.data &&
												'result' in part.data ) )
								);

								if ( ! isDuplicate ) {
									accumulatedParts.push( part );
								}
							}
						}
					}

					// Note: Tool results are not captured here as separate messages
					// They will be included in the final agent message along with tool calls

					// Update state with final result
					if ( update.final ) {
						// Create a complete agent message with all tool parts + final content
						let completeAgentMessage: Message | null = null;
						if ( withHistory && update.status?.message ) {
							// Extract text parts from final message
							const finalTextParts =
								update.status.message.parts.filter(
									( part ) => part.type === 'text'
								);

							// Extract any additional tool parts from final message (in case they weren't captured during streaming)
							const finalToolParts =
								update.status.message.parts.filter(
									( part ) =>
										part.type === 'data' &&
										'toolCallId' in part.data &&
										( 'arguments' in part.data ||
											'result' in part.data )
								);

							// Combine accumulated parts + final tool parts (deduplicate) + text parts
							const allToolParts = [
								...accumulatedParts,
								...finalToolParts.filter(
									( finalPart ) =>
										! accumulatedParts.some(
											( accPart ) =>
												accPart.type === 'data' &&
												finalPart.type === 'data' &&
												'toolCallId' in accPart.data &&
												'toolCallId' in
													finalPart.data &&
												accPart.data.toolCallId ===
													finalPart.data.toolCallId &&
												( ( 'arguments' in
													accPart.data &&
													'arguments' in
														finalPart.data ) ||
													( 'result' in
														accPart.data &&
														'result' in
															finalPart.data ) )
										)
								),
							];

							completeAgentMessage = {
								role: 'agent',
								parts: [ ...allToolParts, ...finalTextParts ],
							};
						}

						setState( ( prev ) => ( {
							...prev,
							isLoading: false,
							lastResponse: {
								id: update.id,
								status: update.status,
							},
							// Add complete agent response to conversation history (only if withHistory is true)
							conversationHistory: completeAgentMessage
								? [
										...prev.conversationHistory,
										extractNewContentFromMessage(
											completeAgentMessage
										),
								  ]
								: prev.conversationHistory,
						} ) );
					}
				}
			} catch ( error ) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to send streaming message';
				setState( ( prev ) => ( {
					...prev,
					isLoading: false,
					error: errorMessage,
				} ) );
				throw error;
			}
		},
		[ state.conversationHistory ]
	);

	const clearError = useCallback( () => {
		setState( ( prev ) => ( { ...prev, error: null } ) );
	}, [] );

	const reset = useCallback( () => {
		setState( {
			isConnected: !! clientRef.current,
			isLoading: false,
			error: null,
			lastResponse: null,
			conversationHistory: [],
		} );
	}, [] );

	const resetConversation = useCallback( () => {
		setState( ( prev ) => ( {
			...prev,
			conversationHistory: [],
		} ) );
	}, [] );

	const getTextMessage = useCallback( ( message: Message ): ChatMessage => {
		const textParts = message.parts
			.filter( ( part: any ): part is TextPart => part.type === 'text' )
			.map( ( part: TextPart ) => part.text )
			.join( '\n' );

		return {
			role: message.role === 'user' ? 'user' : 'agent',
			content: textParts || '(No text response)',
			timestamp: Date.now(),
		};
	}, [] );

	return {
		state,
		sendMessage,
		sendMessageStream,
		clearError,
		reset,
		resetConversation,
		getTextMessage,
	};
}
