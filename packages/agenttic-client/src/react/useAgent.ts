import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { createClient } from '../client/index';
import {
	createTextMessage,
	createTextPart,
	extractToolCallsFromMessage,
	generateMessageId,
} from '../client/utils/index';
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
import {
	clearConversation,
	loadConversation,
	storeConversation,
} from './conversationStorage';
import {
	extractNewContentFromMessage,
	createTextMessageWithHistory,
	extractToolResultsFromMessage,
} from './conversationUtils';

/**
 * UI ChatMessage interface for consumer components
 */
export interface ChatMessage {
	role: 'user' | 'agent';
	content: string | any; // Allow string or JSX.Element for flexible content
	timestamp: number;
}



/**
 * Configuration for the useAgent hook
 */
export interface UseAgentConfig extends Omit< ClientConfig, 'dispatcher' > {
	// Browser-specific config options can be added here
	sessionId?: string; // Optional session ID for conversation persistence
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
	resetConversation: () => Promise< void >;
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
	const [ initialHistoryLoaded, setInitialHistoryLoaded ] = useState( false );
	const sessionId = config.sessionId || 'default-session';

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

	// Load conversation history from storage on mount
	useEffect( () => {
		if ( ! initialHistoryLoaded && sessionId ) {
			const loadHistory = async () => {
				try {
					const storedHistory = await loadConversation( sessionId );
					if ( storedHistory.length > 0 ) {
						setState( ( prev ) => ( {
							...prev,
							conversationHistory: storedHistory,
						} ) );
					}
				} catch ( error ) {
					console.warn(
						'Failed to load conversation history:',
						error
					);
				} finally {
					setInitialHistoryLoaded( true );
				}
			};
			loadHistory();
		}
	}, [ sessionId, initialHistoryLoaded ] );

	// Store conversation history whenever it changes
	const persistConversationHistory = useCallback(
		async ( messages: Message[] ) => {
			if ( sessionId ) {
				try {
					await storeConversation( sessionId, messages );
				} catch ( error ) {
					console.warn(
						'Failed to persist conversation history:',
						error
					);
				}
			}
		},
		[ sessionId ]
	);

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
						kind: 'message',
						parts: [ ...toolParts, ...textParts ],
						messageId: generateMessageId(),
					};
				}

				const newConversationHistory = withHistory
					? [
							...state.conversationHistory,
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
					: state.conversationHistory;

				// Check if there's a separate agent message to add
				let finalConversationHistory = newConversationHistory;
				if ( withHistory && (task as any).agentMessage ) {
					const separateAgentMessage = extractNewContentFromMessage(
						(task as any).agentMessage
					);
					finalConversationHistory = [
						...newConversationHistory,
						separateAgentMessage,
					];
				}

				setState( ( prev ) => ( {
					...prev,
					isLoading: false,
					lastResponse: task,
					// Update conversation history only if withHistory is true
					// Store only clean messages without history data parts to avoid duplication
					conversationHistory: finalConversationHistory,
				} ) );

				// Persist the updated conversation history
				if ( withHistory ) {
					await persistConversationHistory( finalConversationHistory );
				}

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
		[ state.conversationHistory, persistConversationHistory ]
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

			// Track conversation history locally to avoid race conditions
			let currentConversationHistory = [ ...state.conversationHistory ];

			// Track current tool call IDs to ensure we only capture matching tool results
			let currentToolCallIds: string[] = [];

			try {
				const message: Message =
					options.message ||
					( withHistory
						? createTextMessageWithHistory(
								messageText,
								currentConversationHistory
						  )
						: createTextMessage( messageText ) );

				// Add user message to local conversation history before streaming (only if withHistory is true)
				// Store only the clean message without history parts
				if ( withHistory ) {
					const userMessage = createTextMessage( messageText );
					currentConversationHistory = [
						...currentConversationHistory,
						userMessage,
					];

					setState( ( prev ) => ( {
						...prev,
						conversationHistory: currentConversationHistory,
					} ) );
					// Persist the user message immediately
					await persistConversationHistory(
						currentConversationHistory
					);
				}

				for await ( const update of clientRef.current.sendMessageStream(
					{
						message,
						withHistory,
						...otherOptions,
					}
				) ) {
					// Save tool interactions when input is required (this saves the agent message with tool calls)
					if (
						update.status?.state === 'input-required' &&
						update.status?.message &&
						withHistory
					) {
						// Capture the tool call IDs for this batch
						const toolCalls = extractToolCallsFromMessage(
							update.status.message
						);
						currentToolCallIds = toolCalls.map(
							( call ) => call.data.toolCallId as string
						);

						const toolMessage = extractNewContentFromMessage(
							update.status.message
						);
						currentConversationHistory = [
							...currentConversationHistory,
							toolMessage,
						];

						// Update state immediately to keep in-memory history in sync
						setState( ( prev ) => ( {
							...prev,
							conversationHistory: currentConversationHistory,
						} ) );

						await persistConversationHistory(
							currentConversationHistory
						);
					}

					// Capture tool results when tools are executed (state becomes 'working' after tool execution)
					if (
						update.status?.state === 'working' &&
						update.status?.message &&
						withHistory &&
						! update.final
					) {
						// Extract ALL tool results first
						const allToolResults = extractToolResultsFromMessage(
							update.status.message
						);

						// Filter to only include results that match current tool call IDs
						const currentToolResults = allToolResults.filter(
							( result ) =>
								currentToolCallIds.includes(
									result.data.toolCallId as string
								)
						);

						if ( currentToolResults.length > 0 ) {
							// Create a message containing just the matching tool results
							const toolResultMessage: Message = {
								role: 'agent',
								kind: 'message',
								parts: currentToolResults,
								messageId: generateMessageId(),
							};

							currentConversationHistory = [
								...currentConversationHistory,
								extractNewContentFromMessage(
									toolResultMessage
								),
							];

							// Update state immediately to keep in-memory history in sync
							setState( ( prev ) => ( {
								...prev,
								conversationHistory: currentConversationHistory,
							} ) );

							await persistConversationHistory(
								currentConversationHistory
							);
						}
					}

					if (
						update.final &&
						update.status?.state !== 'input-required'
					) {
						// Clear tool call tracking for next batch
						currentToolCallIds = [];

						let finalAgentMessage: Message | null = null;
						if ( withHistory && update.status?.message ) {
							finalAgentMessage = extractNewContentFromMessage(
								update.status.message
							);
							currentConversationHistory = [
								...currentConversationHistory,
								finalAgentMessage,
							];
						}

						setState( ( prev ) => ( {
							...prev,
							isLoading: false,
							lastResponse: {
								id: update.id,
								status: update.status,
							},
							conversationHistory: currentConversationHistory,
						} ) );

						// Persist the final conversation history
						if ( withHistory && finalAgentMessage ) {
							await persistConversationHistory(
								currentConversationHistory
							);
						}
					}

					yield update;
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
		[ state.conversationHistory, persistConversationHistory ]
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

	const resetConversation = useCallback( async () => {
		setState( ( prev ) => ( {
			...prev,
			conversationHistory: [],
		} ) );
		// Clear persistent storage as well
		if ( sessionId ) {
			await clearConversation( sessionId );
		}
	}, [ sessionId ] );

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
