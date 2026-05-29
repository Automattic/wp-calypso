import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { getAgentManager } from './agentManager';
import type {
	AuthProvider,
	Message as ClientMessage,
	ContentType,
	ContextProvider,
	ToolProvider,
} from '../client/types/index';
import { useMessageActions } from '../message-actions/useMessageActions';
import { resolveActionsForMessage } from '../message-actions/resolver';
import { logger } from '../client/utils/logger';

// Utility function to sort UI messages by timestamp
const sortUIMessagesByTime = ( messages: UIMessage[] ): UIMessage[] => {
	return [ ...messages ].sort( ( a, b ) => a.timestamp - b.timestamp );
};

/**
 * Create an image component for display in messages
 * @param url      - The image URL
 * @param maxWidth - Maximum width (defaults to 40% so 2 images fit in a row)
 */
const createImageComponent = ( url: string, maxWidth = '40%' ) => ( {
	type: 'component' as const,
	component: () =>
		React.createElement( 'img', {
			src: url,
			alt: 'Uploaded image',
			style: {
				maxWidth,
				height: 'auto',
				borderRadius: '8px',
				marginTop: '8px',
				marginRight: '8px',
				display: 'inline-block',
			},
		} ),
} );

// Re-export types that will be used by consumers
export interface Suggestion {
	id: string;
	label: string;
	prompt?: string;
	action?: () => boolean | Promise< boolean >;
}

// Image data with optional metadata (e.g., WordPress attachment ID)
export interface ImageData {
	url: string;
	metadata?: Record< string, unknown >;
}

// Extra options for submitting a message
export interface SubmitOptions {
	type?: ContentType | 'tool_result'; // `text` for normal visible text (default), `context` for hidden context, `tool_result` for tool result (hidden from UI)
	archived?: boolean;
	imageUrls?: ( string | ImageData )[]; // Array of image URLs or image objects with metadata
	sessionId?: string; // Optional `sessionId` to use for this message (overrides agent's `sessionId`)
	toolCallId?: string; // Required when type is `tool_result`: the tool call ID to respond to
	toolId?: string; // Required when type is `tool_result`: the tool ID
}

// UI Message format (simplified for UI components)
export interface UIMessage {
	id: string;
	role: 'user' | 'agent';
	content: Array< {
		type: 'text' | 'component' | 'context' | 'data';
		text?: string;
		component?: React.ComponentType;
		componentProps?: any;
		data?: Record< string, unknown >;
	} >;
	timestamp: number;
	archived: boolean;
	showIcon: boolean;
	icon?: string;
	actions?: UIMessageAction[];
	reactKey?: string; // Stable key for React rendering (prevents unmount/remount during updates)
}

// Message action type for UI, resolved from condition and passed to the dumb component
export type UIMessageAction =
	| {
			type?: 'button';
			id: string;
			label: string;
			icon?: React.ReactNode;
			onClick: ( message: UIMessage ) => void | Promise< void >;
			disabled?: boolean;
			tooltip?: string;
			pressed?: boolean;
			showLabel?: boolean;
			order?: number;
	  }
	| {
			type: 'component';
			id: string;
			label?: string;
			component: React.ComponentType< any >;
			componentProps?: Record< string, unknown >;
			order?: number;
	  };

// Internal types for message actions with conditional logic
export type MessageActionDefinition =
	| {
			type?: 'button';
			id: string;
			label: string;
			icon?: ReactNode;
			onClick: ( message: UIMessage ) => void | Promise< void >;
			condition?: ( message: UIMessage ) => boolean;
			disabled?: boolean;
			tooltip?: string;
			pressed?: boolean;
			showLabel?: boolean;
			order?: number;
	  }
	| {
			type: 'component';
			id: string;
			label?: string;
			component: React.ComponentType< any >;
			componentProps?: Record< string, unknown >;
			condition?: ( message: UIMessage ) => boolean;
			order?: number;
	  };

export interface MessageActionsRegistration {
	id: string;
	actions:
		| MessageActionDefinition[]
		| ( ( message: UIMessage ) => MessageActionDefinition[] );
}

// Hook interface for managing message actions
export interface UseMessageActionsReturn {
	registerMessageActions: (
		registration: MessageActionsRegistration
	) => void;
	unregisterMessageActions: ( id: string ) => void;
	clearAllMessageActions: () => void;
}

// Transform client message (with parts) to UI message (with content)
// Exported for unit tests; not re-exported from the package entry.
export const transformClientMessageToUI = (
	clientMessage: ClientMessage,
	messageActionsRegistrations: MessageActionsRegistration[] = []
): UIMessage | null => {
	// Filter out tool-related messages that shouldn't appear in UI
	const hasToolContent = clientMessage.parts.some( ( part ) => {
		if ( part.type === 'data' ) {
			const data = part.data as any;
			// Skip messages that contain tool calls or tool results
			return data.toolCallId || data.toolId || data.result;
		}
		return false;
	} );

	if ( hasToolContent ) {
		return null; // Don't show tool-related messages in UI
	}

	const content = clientMessage.parts
		.map( ( part ) => {
			if ( part.type === 'text' ) {
				// Check metadata for content type (e.g., `text`, `context`)
				const contentType =
					( part.metadata?.contentType as ContentType | undefined ) ||
					'text';
				return {
					type: contentType,
					text: part.text,
				};
			}
			if ( part.type === 'file' ) {
				// Convert `file` parts to component for rendering
				// Prefer `uri`; fall back to base64 data URL if `mimeType` and `bytes` are available
				const imageUrl =
					part.file.uri ||
					( part.file.mimeType && part.file.bytes
						? `data:${ part.file.mimeType };base64,${ part.file.bytes }`
						: undefined );
				if ( imageUrl ) {
					return createImageComponent( imageUrl );
				}
			}
			if ( part.type === 'data' ) {
				// Handle `data` parts that might contain `component` information
				const data = part.data as any;
				if ( data.component && data.componentProps ) {
					return {
						type: 'component' as const,
						component: data.component,
						componentProps: data.componentProps,
					};
				}
				// Preserve `data` parts with `forward_to_human_support` flag (and similar flags)
				// so consumers can check for them programmatically
				if (
					data.flags &&
					typeof data.flags === 'object' &&
					'forward_to_human_support' in data.flags
				) {
					return {
						type: 'data' as const,
						data,
					};
				}
				// Preserve `data` parts with `sources` array for article references
				if (
					Array.isArray( data.sources ) &&
					data.sources.length > 0
				) {
					return {
						type: 'data' as const,
						data,
					};
				}
				// Unknown `data` shapes are internal metadata. Drop them so
				// they don't show up as raw JSON. Add a handler above to
				// render a new shape.
				logger( 'Dropping unrecognized data part', data );
				return null;
			}
			// Handle other part types as needed
			return {
				type: 'text' as const,
				text: '[Unsupported content]',
			};
		} )
		.filter(
			( item ): item is NonNullable< typeof item > => item !== null
		);

	// Drop messages with nothing to show. Keeping them would add empty
	// entries to the list and throw off message counts.
	if ( content.length === 0 ) {
		return null;
	}

	// Extract timestamp from message metadata or use current time as fallback
	const timestamp =
		( clientMessage.metadata?.timestamp as number ) ?? Date.now();

	const uiMessage: UIMessage = {
		id: clientMessage.messageId,
		role: clientMessage.role === 'agent' ? 'agent' : 'user',
		content,
		timestamp,
		archived: Boolean( clientMessage.metadata?.archived ),
		showIcon: clientMessage.role === 'agent',
		icon: clientMessage.role === 'agent' ? 'assistant' : undefined,
	};

	// Resolve actions for agent messages
	if (
		clientMessage.role === 'agent' &&
		messageActionsRegistrations.length > 0
	) {
		const resolvedActions = resolveActionsForMessage(
			uiMessage,
			messageActionsRegistrations
		);

		if ( resolvedActions.length > 0 ) {
			uiMessage.actions = resolvedActions;
		}
	}

	return uiMessage;
};

// Default providers
const createNoOpContextProvider = (): ContextProvider => ( {
	getClientContext: () => ( {} ),
} );

const createNoOpToolProvider = (): ToolProvider => ( {
	getAvailableTools: async () => [],
	executeTool: async () => ( {
		success: true,
		result: 'No tools available',
	} ),
} );

// Validation helper
const validateAgentConfig = ( config: {
	agentId: string;
	agentUrl: string;
	sessionId: string;
} ): boolean => {
	// Only agentId and agentUrl are required
	// sessionId can be empty string for new chats (server generates UUID on first message)
	const required = [ 'agentId', 'agentUrl' ];
	return required.every( ( key ) => {
		const value = config[ key as keyof typeof config ];
		return typeof value === 'string' && value.trim().length > 0;
	} );
};

// Hook configuration interface
export interface UseAgentChatConfig {
	agentId: string;
	agentUrl: string;
	sessionId: string;
	sessionIdStorageKey?: string;
	contextProvider?: ContextProvider;
	toolProvider?: ToolProvider;
	authProvider?: AuthProvider;
	enableStreaming?: boolean; // Enable token-by-token streaming
	odieBotId?: string; // Odie bot ID for server-based conversation storage (e.g., 'wpcom-agent-wp_orchestrator'). When set, enables server storage.
	credentials?: RequestCredentials; // Set 'include' to send cookies with cross-origin requests.
}

// Hook return interface
export interface UseAgentChatReturn {
	// AgentUI props
	messages: UIMessage[];
	isProcessing: boolean;
	error: string | null;
	onSubmit: ( message: string, options?: SubmitOptions ) => Promise< void >;
	suggestions: Suggestion[];
	progressMessage: string | null;
	progressPhase: string | null;

	// UI management methods
	registerSuggestions: ( suggestions: Suggestion[] ) => void;
	clearSuggestions: () => void;

	// Message actions methods
	registerMessageActions: (
		registration: MessageActionsRegistration
	) => void;
	unregisterMessageActions: ( id: string ) => void;
	clearAllMessageActions: () => void;

	// Tool integration
	addMessage: ( message: UIMessage ) => void;

	// Abort control
	abortCurrentRequest: () => void;

	// Conversation loading
	loadMessages: ( messages: ClientMessage[] ) => Promise< void >;
}

// Internal state interface
interface AgentChatState {
	clientMessages: ClientMessage[];
	uiMessages: UIMessage[];
	isProcessing: boolean;
	error: string | null;
	suggestions: Suggestion[];
	progressMessage: string | null;
	progressPhase: string | null;
}

/**
 * React hook for agent chat functionality
 * Provides all necessary data and methods for AgentUI component
 * @param config
 */
export function useAgentChat( config: UseAgentChatConfig ): UseAgentChatReturn {
	// Create config with defaults

	const agentConfig = {
		agentId: config.agentId,
		agentUrl: config.agentUrl,
		sessionId: config.sessionId,
		sessionIdStorageKey: config.sessionIdStorageKey,
	};

	// Validate configuration
	const isValidConfig = validateAgentConfig( agentConfig );

	// Internal state
	const [ state, setState ] = useState< AgentChatState >( {
		clientMessages: [],
		uiMessages: [],
		isProcessing: false,
		error: isValidConfig ? null : 'Invalid agent configuration',
		suggestions: [],
		progressMessage: null,
		progressPhase: null,
	} );

	// Initialize message actions
	const {
		registerMessageActions,
		unregisterMessageActions,
		clearAllMessageActions,
		registrations,
	} = useMessageActions();

	// Guard against concurrent sends racing on `conversationHistory`
	const isSendingRef = useRef( false );

	// Use a ref to always have access to the latest registrations
	const registrationsRef = useRef( registrations );
	useEffect( () => {
		registrationsRef.current = registrations;
	}, [ registrations ] );

	// Transform client messages to UI messages
	const transformMessages = useCallback(
		( messages: ClientMessage[] ): UIMessage[] => {
			return messages
				.map( ( msg ) =>
					transformClientMessageToUI( msg, registrationsRef.current )
				)
				.filter( ( msg ): msg is UIMessage => msg !== null );
		},
		[] // registrationsRef is stable, so no deps needed
	);

	// Initialize agent
	useEffect( () => {
		if ( ! isValidConfig ) {
			return;
		}

		const initializeAgent = async () => {
			const agentManager = getAgentManager();
			const agentKey = agentConfig.agentId;

			const hasAgent = agentManager.hasAgent( agentKey );

			// Always ensure agent exists, even for new chats with empty sessionId
			if ( ! hasAgent ) {
				await agentManager.createAgent( agentKey, {
					agentId: agentConfig.agentId,
					agentUrl: agentConfig.agentUrl,
					sessionId: agentConfig.sessionId, // Can be empty for new chats
					sessionIdStorageKey: agentConfig.sessionIdStorageKey,
					contextProvider:
						config.contextProvider || createNoOpContextProvider(),
					toolProvider:
						config.toolProvider || createNoOpToolProvider(),
					authProvider: config.authProvider,
					enableStreaming: config.enableStreaming,
					odieBotId: config.odieBotId,
					credentials: config.credentials,
				} );

				// Only load messages when creating a new agent (initial mount or after removeAgent)
				if ( agentConfig.sessionId ) {
					const clientHistory =
						agentManager.getConversationHistory( agentKey );
					setState( ( prev ) => {
						const uiHistory = transformMessages( clientHistory );

						return {
							...prev,
							clientMessages: clientHistory,
							uiMessages: uiHistory,
						};
					} );
				} else {
					setState( ( prev ) => ( {
						...prev,
						clientMessages: [],
						uiMessages: [],
					} ) );
				}
			} else if ( agentConfig.sessionId ) {
				agentManager.updateSessionId( agentKey, agentConfig.sessionId );

				// However, clear state if there are no messages yet (fresh load)
				const currentHistory =
					agentManager.getConversationHistory( agentKey );
				if ( currentHistory.length === 0 ) {
					setState( ( prev ) => ( {
						...prev,
						clientMessages: [],
						uiMessages: [],
					} ) );
				}
			} else {
				// Agent already exists - new chat, clear everything
				agentManager.updateSessionId( agentKey, '' );
				await agentManager.replaceMessages( agentKey, [] );
				setState( ( prev ) => ( {
					...prev,
					clientMessages: [],
					uiMessages: [],
				} ) );
			}
		};
		initializeAgent();
	}, [
		agentConfig.sessionId,
		agentConfig.agentId,
		agentConfig.agentUrl,
		agentConfig.sessionIdStorageKey,
		config.contextProvider,
		config.toolProvider,
		config.authProvider,
		config.enableStreaming,
		config.odieBotId,
		config.credentials,
		isValidConfig,
		transformMessages,
	] );

	// Send message function
	const onSubmit = useCallback(
		async ( message: string, options?: SubmitOptions ) => {
			if ( ! isValidConfig ) {
				throw new Error( 'Invalid agent configuration' );
			}

			if ( isSendingRef.current ) {
				return;
			}
			isSendingRef.current = true;

			const isToolResult = options?.type === 'tool_result';

			// Validate tool result options early, before any state changes
			if (
				isToolResult &&
				( ! options?.toolCallId || ! options?.toolId )
			) {
				throw new Error(
					'`toolCallId` and `toolId` are required when type is `tool_result`'
				);
			}

			const agentManager = getAgentManager();
			const agentKey = agentConfig.agentId;

			// Capture timestamp once for consistency
			const messageTimestamp = Date.now();

			// Create user message immediately for UI (skipped for tool results)
			if ( ! isToolResult ) {
				const contentType = ( options?.type || 'text' ) as ContentType;
				const userMessage: UIMessage = {
					id: `user-${ messageTimestamp }`,
					role: 'user',
					content: [
						{ type: contentType, text: message },
						// Map image URLs to component content parts
						...( options?.imageUrls?.map( ( imageData ) => {
							const url =
								typeof imageData === 'string'
									? imageData
									: imageData.url;
							return createImageComponent( url );
						} ) ?? [] ),
					],
					timestamp: messageTimestamp,
					archived: options?.archived ?? false,
					showIcon: false,
				};

				setState( ( prev ) => ( {
					...prev,
					uiMessages: [ ...prev.uiMessages, userMessage ],
					isProcessing: true,
					error: null,
				} ) );
			} else {
				setState( ( prev ) => ( {
					...prev,
					isProcessing: true,
					error: null,
				} ) );
			}

			try {
				// Track streaming message for incremental updates
				let streamingMessageId: string | null = null;
				let finalMessageAdded = false;

				// Pass metadata including archived flag and content type if provided
				const messageOptions: any = {};
				const hasContentType = !! options?.type && ! isToolResult;
				if ( options?.archived || hasContentType ) {
					messageOptions.metadata = {
						...( options?.archived && { archived: true } ),
						...( hasContentType && { contentType: options!.type } ),
					};
				}
				// Pass sessionId if provided (overrides agent's default sessionId)
				if ( options?.sessionId ) {
					messageOptions.sessionId = options.sessionId;
				}

				if ( options?.imageUrls ) {
					messageOptions.imageUrls = options.imageUrls;
				}

				// Use `sendToolResult` for tool results (cleans up duplicate results
				// from conversation history and sends a `ToolResultDataPart` message),
				// otherwise use regular `sendMessageStream`.
				const stream = isToolResult
					? agentManager.sendToolResult(
							agentKey,
							options!.toolCallId!,
							options!.toolId!,
							{ success: true, message },
							messageOptions
					  )
					: agentManager.sendMessageStream(
							agentKey,
							message,
							messageOptions
					  );

				for await ( const update of stream ) {
					// Update progress message and phase if present
					if ( update.progressMessage || update.progressPhase ) {
						setState( ( prev ) => ( {
							...prev,
							progressMessage: update.progressMessage || null,
							progressPhase: update.progressPhase || null,
						} ) );
					}

					// Handle incremental text updates during streaming
					if ( ! update.final && update.text ) {
						// Create or update the streaming message
						if ( ! streamingMessageId ) {
							streamingMessageId = `agent-streaming-${ Date.now() }`;
							const streamingMessage: UIMessage = {
								id: streamingMessageId,
								role: 'agent',
								content: [
									{ type: 'text', text: update.text },
								],
								timestamp: Date.now(),
								archived: false,
								showIcon: true,
								icon: 'assistant',
								reactKey: streamingMessageId, // Stable key for React rendering
							};

							setState( ( prev ) => ( {
								...prev,
								uiMessages: [
									...prev.uiMessages,
									streamingMessage,
								],
							} ) );
						} else {
							// Update existing streaming message with accumulated text
							setState( ( prev ) => ( {
								...prev,
								uiMessages: prev.uiMessages.map( ( msg ) =>
									msg.id === streamingMessageId
										? {
												...msg,
												content: [
													{
														type: 'text',
														text: update.text,
													},
												],
										  }
										: msg
								),
							} ) );
						}

						// Close the streaming bubble after a non-final text-bearing
						// status event. Each TaskStatusUpdateEvent carrying text
						// represents a completed model utterance — the agent server
						// guarantees the next deltas will not extend that message —
						// so we rotate to a fresh bubble. This preserves the preamble
						// when the model says something before tool calls and a
						// separate final answer afterward; without rotation the
						// post-preamble deltas would overwrite the preamble bubble.
						if ( update.kind === 'status' ) {
							streamingMessageId = null;
						}
					}

					// Handle final update - update message properties without changing ID
					// Changing the ID causes React to unmount/remount (flicker)
					if (
						update.final &&
						update.status?.message &&
						streamingMessageId
					) {
						finalMessageAdded = true;
						const currentStreamingId = streamingMessageId;
						const finalMessage = transformClientMessageToUI(
							update.status.message,
							registrationsRef.current
						);

						if ( finalMessage ) {
							setState( ( prev ) => {
								// Update to use server ID while keeping stable reactKey
								// This prevents React flicker while maintaining ID consistency
								const updatedMessages = prev.uiMessages.map(
									( msg ) => {
										if ( msg.id === currentStreamingId ) {
											// Use server content if it's longer (final message may have complete text)
											// Otherwise keep streamed content to avoid flicker
											const useServerContent =
												finalMessage.content.length >
													0 &&
												finalMessage.content[ 0 ]
													?.text &&
												msg.content[ 0 ]?.text &&
												finalMessage.content[ 0 ].text
													.length >
													msg.content[ 0 ].text
														.length;

											return {
												...finalMessage,
												reactKey:
													msg.reactKey ||
													currentStreamingId, // Keep stable reactKey
												content: useServerContent
													? finalMessage.content
													: msg.content,
											};
										}
										return msg;
									}
								);

								// Update client messages from conversation history
								const updatedClientHistory =
									agentManager.getConversationHistory(
										agentKey
									);

								return {
									...prev,
									clientMessages: updatedClientHistory,
									uiMessages: updatedMessages,
									isProcessing: false,
									progressMessage: null,
									progressPhase: null,
								};
							} );
						}

						// Clear the streaming message ID after update
						streamingMessageId = null;
					}
				}

				// Only update from conversation history if we didn't already handle the final message
				if ( ! finalMessageAdded ) {
					// Update internal messages and transform for UI
					const updatedClientHistory =
						agentManager.getConversationHistory( agentKey );

					setState( ( prev ) => {
						// Remove any remaining streaming message
						let filteredMessages = prev.uiMessages;
						if ( streamingMessageId ) {
							filteredMessages = prev.uiMessages.filter(
								( msg ) => msg.id !== streamingMessageId
							);
						}

						// Transform client messages to UI format
						const transformedClientMessages = updatedClientHistory
							.map( ( msg ) =>
								transformClientMessageToUI(
									msg,
									registrationsRef.current
								)
							)
							.filter(
								( msg ): msg is UIMessage => msg !== null
							);

						// Find UI-only messages (messages not in client history, e.g. injected by tools)
						// Exclude user messages since they'll come back from server with different IDs
						const clientMessageIds = new Set(
							updatedClientHistory.map( ( msg ) => msg.messageId )
						);
						const uiOnlyMessages = filteredMessages.filter(
							( msg ) =>
								! clientMessageIds.has( msg.id ) &&
								msg.role !== 'user'
						);

						// Merge client-based messages with UI-only component messages and sort by timestamp
						const mergedUIMessages = sortUIMessagesByTime( [
							...transformedClientMessages,
							...uiOnlyMessages,
						] );

						return {
							...prev,
							clientMessages: updatedClientHistory,
							uiMessages: mergedUIMessages,
							isProcessing: false,
							progressMessage: null,
							progressPhase: null,
						};
					} );
				}
			} catch ( error ) {
				// Handle AbortError specially - it's not really an error, just user cancellation
				if ( error instanceof Error && error.name === 'AbortError' ) {
					logger( 'Request was aborted by user' );
					setState( ( prev ) => ( {
						...prev,
						isProcessing: false,
						progressMessage: null,
						progressPhase: null,
						error: null, // Don't show error for user-initiated abort
					} ) );
					return; // Don't re-throw AbortError
				}

				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to send message';
				setState( ( prev ) => ( {
					...prev,
					isProcessing: false,
					progressMessage: null,
					progressPhase: null,
					error: errorMessage,
				} ) );
				throw error;
			} finally {
				isSendingRef.current = false;
			}
		},
		[ agentConfig.agentId, isValidConfig ]
	);

	// Add message function - for tools to directly add UI messages
	const addMessage = useCallback( ( message: UIMessage ) => {
		setState( ( prev ) => ( {
			...prev,
			uiMessages: sortUIMessagesByTime( [ ...prev.uiMessages, message ] ),
		} ) );
	}, [] );

	// Suggestions management
	const registerSuggestions = useCallback( ( suggestions: Suggestion[] ) => {
		setState( ( prev ) => ( {
			...prev,
			suggestions,
		} ) );
	}, [] );

	const clearSuggestions = useCallback( () => {
		setState( ( prev ) => ( {
			...prev,
			suggestions: [],
		} ) );
	}, [] );

	// Re-transform messages when registrations change
	useEffect( () => {
		setState( ( prev ) => {
			// Don't update if we have no client messages
			if ( prev.clientMessages.length === 0 ) {
				return prev;
			}

			// Re-transform all messages with current registrations
			const updatedUIMessages = transformMessages( prev.clientMessages );

			// Find UI-only messages (messages not in client history, e.g. injected by tools)
			// Exclude user messages since they'll come back from server with different IDs
			const clientMessageIds = new Set(
				prev.clientMessages.map( ( msg ) => msg.messageId )
			);
			const uiOnlyMessages = prev.uiMessages.filter(
				( msg ) =>
					! clientMessageIds.has( msg.id ) && msg.role !== 'user'
			);

			return {
				...prev,
				uiMessages: sortUIMessagesByTime( [
					...updatedUIMessages,
					...uiOnlyMessages,
				] ),
			};
		} );
	}, [ registrations, transformMessages ] );

	// Create abort function - delegates to agent manager
	const abortCurrentRequest = useCallback( () => {
		if ( ! isValidConfig ) {
			return;
		}
		const agentManager = getAgentManager();
		const agentKey = agentConfig.agentId;
		agentManager.abortCurrentRequest( agentKey );
	}, [ agentConfig.agentId, isValidConfig ] );

	// Load messages externally (for conversation history switching)
	// This updates both AgentManager and React state
	const loadMessages = useCallback(
		async ( messages: ClientMessage[] ) => {
			if ( ! isValidConfig ) {
				return;
			}

			const agentManager = getAgentManager();
			const agentKey = agentConfig.agentId;

			// Replace agent's conversation history
			await agentManager.replaceMessages( agentKey, messages );

			// Transform to UI messages and update React state
			const uiMessages = transformMessages( messages );

			setState( ( prev ) => ( {
				...prev,
				clientMessages: messages,
				uiMessages,
			} ) );
		},
		[ agentConfig.agentId, isValidConfig, transformMessages ]
	);

	return {
		// AgentUI props
		messages: state.uiMessages,
		isProcessing: state.isProcessing,
		error: state.error,
		onSubmit,
		suggestions: state.suggestions,
		progressMessage: state.progressMessage,
		progressPhase: state.progressPhase,

		// UI management methods
		registerSuggestions,
		clearSuggestions,

		// Message actions methods
		registerMessageActions,
		unregisterMessageActions,
		clearAllMessageActions,

		// Tool integration
		addMessage,

		// Abort control
		abortCurrentRequest,

		// Conversation loading
		loadMessages,
	};
}

export default useAgentChat;
