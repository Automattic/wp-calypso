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
	type?: ContentType; // Content type: 'text' for normal visible text (default), 'context' for hidden context content
	archived?: boolean;
	imageUrls?: ( string | ImageData )[]; // Array of image URLs or image objects with metadata
	sessionId?: string; // Optional sessionId to use for this message (overrides agent's sessionId)
}

// UI Message format (simplified for UI components)
export interface UIMessage {
	id: string;
	role: 'user' | 'agent';
	content: Array< {
		type: 'text' | 'component' | 'context';
		text?: string;
		component?: React.ComponentType;
		componentProps?: any;
	} >;
	timestamp: number;
	archived: boolean;
	showIcon: boolean;
	icon?: string;
	actions?: UIMessageAction[];
}

// Message action type for UI, resolved from condition and passed to the dumb component
export interface UIMessageAction {
	id: string;
	label: string;
	icon?: React.ReactNode;
	onClick: ( message: UIMessage ) => void | Promise< void >;
	disabled?: boolean;
	tooltip?: string;
	pressed?: boolean;
	showLabel?: boolean;
}

// Internal types for message actions with conditional logic
export interface MessageActionDefinition {
	id: string;
	label: string;
	icon?: ReactNode;
	onClick: ( message: UIMessage ) => void | Promise< void >;
	// Complex condition function - evaluated in client
	condition?: ( message: UIMessage ) => boolean;
	// Static disabled state
	disabled?: boolean;
	tooltip?: string;
	pressed?: boolean;
	showLabel?: boolean;
}

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
const transformClientMessageToUI = (
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

	const content = clientMessage.parts.map( ( part ) => {
		if ( part.type === 'text' ) {
			// Check metadata for content type (e.g., 'text', 'context')
			const contentType =
				( part.metadata?.contentType as ContentType | undefined ) ||
				'text';
			return {
				type: contentType,
				text: part.text,
			};
		}
		if ( part.type === 'file' ) {
			// Convert file parts to component for rendering
			// Prefer uri; fall back to base64 data URL if mimeType and bytes are available
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
			// Handle data parts that might contain component information
			const data = part.data as any;
			if ( data.component && data.componentProps ) {
				return {
					type: 'component' as const,
					component: data.component,
					componentProps: data.componentProps,
				};
			}
			// For other data parts, convert to text
			return {
				type: 'text' as const,
				text: JSON.stringify( data ),
			};
		}
		// Handle other part types as needed
		return {
			type: 'text' as const,
			text: '[Unsupported content]',
		};
	} );

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
	} );

	// Initialize message actions
	const {
		registerMessageActions,
		unregisterMessageActions,
		clearAllMessageActions,
		registrations,
	} = useMessageActions();

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
		isValidConfig,
	] );

	// Send message function
	const onSubmit = useCallback(
		async ( message: string, options?: SubmitOptions ) => {
			if ( ! isValidConfig ) {
				throw new Error( 'Invalid agent configuration' );
			}

			const agentManager = getAgentManager();
			const agentKey = agentConfig.agentId;

			// Capture timestamp once for consistency
			const messageTimestamp = Date.now();

			// Create user message immediately for UI
			const contentType = options?.type || 'text';
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

			// Add user message to UI and set communication state
			setState( ( prev ) => ( {
				...prev,
				uiMessages: [ ...prev.uiMessages, userMessage ],
				isProcessing: true,
				error: null,
			} ) );

			try {
				// Track streaming message for incremental updates
				let streamingMessageId: string | null = null;
				let finalMessageAdded = false;

				// Pass metadata including archived flag and content type if provided
				const messageOptions: any = {};
				if ( options?.archived || options?.type ) {
					messageOptions.metadata = {
						...( options?.archived && { archived: true } ),
						...( options?.type && { contentType: options.type } ),
					};
				}
				// Pass sessionId if provided (overrides agent's default sessionId)
				if ( options?.sessionId ) {
					messageOptions.sessionId = options.sessionId;
				}

				if ( options?.imageUrls ) {
					messageOptions.imageUrls = options.imageUrls;
				}

				for await ( const update of agentManager.sendMessageStream(
					agentKey,
					message,
					messageOptions
				) ) {
					// Update progress message if present
					if ( update.progressMessage ) {
						setState( ( prev ) => ( {
							...prev,
							progressMessage: update.progressMessage || null,
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
					}

					// Handle final update - replace streaming message with final message
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
								// Replace the streaming message with the final message
								const updatedMessages = prev.uiMessages.map(
									( msg ) =>
										msg.id === currentStreamingId
											? finalMessage
											: msg
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
								};
							} );
						}

						// Clear the streaming message ID after replacement
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

						// Find UI-only messages (component messages not in client history)
						const clientMessageIds = new Set(
							updatedClientHistory.map( ( msg ) => msg.messageId )
						);
						const uiOnlyMessages = filteredMessages.filter(
							( msg ) =>
								! clientMessageIds.has( msg.id ) &&
								msg.content[ 0 ]?.type === 'component'
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
					error: errorMessage,
				} ) );
				throw error;
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

			// Find UI-only messages
			const clientMessageIds = new Set(
				prev.clientMessages.map( ( msg ) => msg.messageId )
			);
			const uiOnlyMessages = prev.uiMessages.filter(
				( msg ) =>
					! clientMessageIds.has( msg.id ) &&
					msg.content[ 0 ]?.type === 'component'
			);

			return {
				...prev,
				uiMessages: sortUIMessagesByTime( [
					...updatedUIMessages,
					...uiOnlyMessages,
				] ),
			};
		} );
	}, [ registrations ] );

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
		[ agentConfig.agentId, isValidConfig ]
	);

	return {
		// AgentUI props
		messages: state.uiMessages,
		isProcessing: state.isProcessing,
		error: state.error,
		onSubmit,
		suggestions: state.suggestions,
		progressMessage: state.progressMessage,

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
