import { useCallback, useRef, useState } from '@wordpress/element';
import { createClient } from '../client/index';
import { createTextPart } from '../client/utils/index';
import type {
	Client,
	ClientConfig,
	DataPart,
	Message,
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
				// Pass through data parts (tool calls, tool results, etc.)
				historyParts.push( part as DataPart );
			}
		}
	}

	return historyParts;
}

/**
 * Create A2A message with conversation history from Message array
 *
 * @param text                  - The user text message to send
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

				setState( ( prev ) => ( {
					...prev,
					isLoading: false,
					lastResponse: task,
					// Update conversation history only if withHistory is true
					conversationHistory: withHistory
						? [
								...prev.conversationHistory,
								message,
								// Add agent response if present
								...( task.status?.message
									? [ task.status.message ]
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
				if ( withHistory ) {
					setState( ( prev ) => ( {
						...prev,
						conversationHistory: [
							...prev.conversationHistory,
							message,
						],
					} ) );
				}

				let finalUpdate: TaskUpdate | null = null;

				for await ( const update of clientRef.current.sendMessageStream(
					{
						message,
						withHistory,
						...otherOptions,
					}
				) ) {
					finalUpdate = update;
					yield update;

					// Update state with final result
					if ( update.final ) {
						setState( ( prev ) => ( {
							...prev,
							isLoading: false,
							lastResponse: {
								id: update.id,
								status: update.status,
							},
							// Add agent response to conversation history (only if withHistory is true)
							conversationHistory:
								withHistory && update.status?.message
									? [
											...prev.conversationHistory,
											update.status.message,
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
