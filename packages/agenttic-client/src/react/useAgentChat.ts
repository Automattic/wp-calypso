import type React from 'react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAgentManager } from './agentManager';
import {
	type MarkdownComponents,
	type MarkdownExtensions,
} from '../utils/markdownParser';
import { createMessageRenderer } from '../utils/createMessageRenderer';
import type {
	AuthProvider,
	Message as ClientMessage,
	ContextProvider,
	ToolProvider,
} from '../client/types/index';
import { useMessageActions } from '../message-actions/useMessageActions';
import { resolveActionsForMessage } from '../message-actions/resolver';
import type { createFeedbackActions } from '../message-actions/factories';

// Utility function to sort UI messages by timestamp
const sortUIMessagesByTime = ( messages: UIMessage[] ): UIMessage[] => {
	return [ ...messages ].sort( ( a, b ) => a.timestamp - b.timestamp );
};

// Re-export types that will be used by consumers
export interface Suggestion {
	id: string;
	label: string;
	prompt: string;
}

// Re-export markdown types from parser
export type {
	MarkdownComponents,
	MarkdownExtensions,
} from '../utils/markdownParser';

// UI Message format (simplified for UI components)
export interface UIMessage {
	id: string;
	role: 'user' | 'agent';
	content: Array< {
		type: 'text' | 'image_url' | 'component';
		text?: string;
		image_url?: string;
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
	icon: React.ReactNode;
	onClick: ( message: UIMessage ) => void | Promise< void >;
	disabled?: boolean;
	tooltip?: string;
}

// Internal types for message actions with conditional logic
export interface MessageActionDefinition {
	id: string;
	label: string;
	icon: ReactNode;
	onClick: ( message: UIMessage ) => void | Promise< void >;
	// Complex condition function - evaluated in client
	condition?: ( message: UIMessage ) => boolean;
	// Static disabled state
	disabled?: boolean;
	tooltip?: string;
}

export interface MessageActionsRegistration {
	id: string;
	actions:
		| MessageActionDefinition[]
		| ( ( message: UIMessage ) => MessageActionDefinition[] );
}

export interface FeedbackActionsConfig {
	onFeedback: (
		messageId: string,
		feedback: 'up' | 'down'
	) => void | Promise< void >;
	condition?: ( message: UIMessage ) => boolean;
	icons: {
		up: ReactNode;
		down: ReactNode;
	};
}

// Hook interface for managing message actions
export interface UseMessageActionsReturn {
	registerMessageActions: (
		registration: MessageActionsRegistration
	) => void;
	unregisterMessageActions: ( id: string ) => void;
	clearAllMessageActions: () => void;
	createFeedbackActions: typeof createFeedbackActions;
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
			return {
				type: 'text' as const,
				text: part.text,
			};
		}
		if ( part.type === 'file' ) {
			return {
				type: 'image_url' as const,
				image_url:
					part.file.uri ||
					`data:${ part.file.mimeType };base64,${ part.file.bytes }`,
			};
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
		archived: false,
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
	const required = [ 'agentId', 'agentUrl', 'sessionId' ];
	return required.every( ( key ) => {
		const value = config[ key as keyof typeof config ];
		return typeof value === 'string' && value.trim().length > 0;
	} );
};

// Default config helper
const createDefaultAgentConfig = () => ( {
	agentId: 'agenttic-client',
	agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
	sessionId: `session-${ Date.now() }`,
} );

// Hook configuration interface
export interface UseAgentChatConfig {
	agentId: string;
	agentUrl?: string;
	sessionId?: string;
	contextProvider?: ContextProvider;
	toolProvider?: ToolProvider;
	authProvider?: AuthProvider;
}

// Hook return interface
export interface UseAgentChatReturn {
	// AgentUI props
	messages: UIMessage[];
	isProcessing: boolean;
	error: string | null;
	onSubmit: ( message: string ) => Promise< void >;
	suggestions: Suggestion[];
	messageRenderer?: React.ComponentType< { children: string } >;

	// UI management methods
	registerSuggestions: ( suggestions: Suggestion[] ) => void;
	clearSuggestions: () => void;
	registerMarkdownComponents: ( components: MarkdownComponents ) => void;
	registerMarkdownExtensions: ( extensions: MarkdownExtensions ) => void;

	// Message actions methods
	registerMessageActions: (
		registration: MessageActionsRegistration
	) => void;
	unregisterMessageActions: ( id: string ) => void;
	clearAllMessageActions: () => void;
	createFeedbackActions: typeof createFeedbackActions;

	// Tool integration
	addMessage: ( message: UIMessage ) => void;
}

// Internal state interface
interface AgentChatState {
	clientMessages: ClientMessage[];
	uiMessages: UIMessage[];
	isProcessing: boolean;
	error: string | null;
	suggestions: Suggestion[];
	markdownComponents: MarkdownComponents;
	markdownExtensions: MarkdownExtensions;
}

/**
 * React hook for agent chat functionality
 * Provides all necessary data and methods for AgentUI component
 * @param config
 */
export function useAgentChat( config: UseAgentChatConfig ): UseAgentChatReturn {
	// Create config with defaults
	const defaultConfig = createDefaultAgentConfig();
	const agentConfig = {
		agentId: config.agentId,
		agentUrl: config.agentUrl || defaultConfig.agentUrl,
		sessionId: config.sessionId || defaultConfig.sessionId,
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
		markdownComponents: {},
		markdownExtensions: {},
	} );

	// Initialize message actions
	const {
		registerMessageActions,
		unregisterMessageActions,
		clearAllMessageActions,
		createFeedbackActions,
		registrations,
	} = useMessageActions();

	// Use a ref to always have access to the latest registrations
	const registrationsRef = useRef( registrations );
	useEffect( () => {
		registrationsRef.current = registrations;
	}, [ registrations ] );

	// Initialize agent
	useEffect( () => {
		if ( ! isValidConfig ) {
			return;
		}

		const initializeAgent = async () => {
			if ( agentConfig.sessionId ) {
				const agentManager = getAgentManager();
				const agentKey = `${ agentConfig.agentId }-${ agentConfig.sessionId }`;

				if ( ! agentManager.hasAgent( agentKey ) ) {
					await agentManager.createAgent( agentKey, {
						agentId: agentConfig.agentId,
						agentUrl: agentConfig.agentUrl,
						sessionId: agentConfig.sessionId,
						contextProvider:
							config.contextProvider ||
							createNoOpContextProvider(),
						toolProvider:
							config.toolProvider || createNoOpToolProvider(),
						authProvider: config.authProvider,
					} );

					// Load conversation history and transform for UI
					const clientHistory =
						agentManager.getConversationHistory( agentKey );
					setState( ( prev ) => {
						const uiHistory = clientHistory
							.map( ( msg ) =>
								transformClientMessageToUI(
									msg,
									registrationsRef.current
								)
							)
							.filter(
								( msg ): msg is UIMessage => msg !== null
							);

						return {
							...prev,
							clientMessages: clientHistory,
							uiMessages: uiHistory,
						};
					} );
				}
			}
		};
		initializeAgent();
	}, [
		agentConfig.sessionId,
		agentConfig.agentId,
		agentConfig.agentUrl,
		config.contextProvider,
		config.toolProvider,
		config.authProvider,
		isValidConfig,
	] );

	// Send message function
	const onSubmit = useCallback(
		async ( message: string ) => {
			if ( ! isValidConfig ) {
				throw new Error( 'Invalid agent configuration' );
			}

			const agentManager = getAgentManager();
			const agentKey = `${ agentConfig.agentId }-${ agentConfig.sessionId }`;

			// Capture timestamp once for consistency
			const messageTimestamp = Date.now();

			// Create user message immediately for UI
			const userMessage: UIMessage = {
				id: `user-${ messageTimestamp }`,
				role: 'user',
				content: [ { type: 'text', text: message } ],
				timestamp: messageTimestamp,
				archived: false,
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
				let lastUpdate = null;
				for await ( const update of agentManager.sendMessageStream(
					agentKey,
					message
				) ) {
					lastUpdate = update;
				}

				// Update internal messages and transform for UI
				const updatedClientHistory =
					agentManager.getConversationHistory( agentKey );

				setState( ( prev ) => {
					// Transform client messages to UI format
					const transformedClientMessages = updatedClientHistory
						.map( ( msg ) =>
							transformClientMessageToUI(
								msg,
								registrationsRef.current
							)
						)
						.filter( ( msg ): msg is UIMessage => msg !== null );

					// Find UI-only messages (component messages not in client history)
					const clientMessageIds = new Set(
						updatedClientHistory.map( ( msg ) => msg.messageId )
					);
					const uiOnlyMessages = prev.uiMessages.filter(
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
					};
				} );
			} catch ( error ) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to send message';
				setState( ( prev ) => ( {
					...prev,
					isProcessing: false,
					error: errorMessage,
				} ) );
				throw error;
			}
		},
		[ agentConfig.agentId, agentConfig.sessionId, isValidConfig ]
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

	// Markdown components management
	const registerMarkdownComponents = useCallback(
		( components: MarkdownComponents ) => {
			setState( ( prev ) => {
				const updatedComponents = {
					...prev.markdownComponents,
					...components,
				};

				// Re-transform existing client messages if needed
				const updatedUIMessages = prev.clientMessages
					.map( ( msg ) =>
						transformClientMessageToUI(
							msg,
							registrationsRef.current
						)
					)
					.filter( ( msg ): msg is UIMessage => msg !== null );

				// Find UI-only messages (component messages not in client history)
				const clientMessageIds = new Set(
					prev.clientMessages.map( ( msg ) => msg.messageId )
				);
				const uiOnlyMessages = prev.uiMessages.filter(
					( msg ) =>
						! clientMessageIds.has( msg.id ) &&
						msg.content[ 0 ]?.type === 'component'
				);

				// Merge re-transformed messages with UI-only component messages
				const mergedUIMessages = sortUIMessagesByTime( [
					...updatedUIMessages,
					...uiOnlyMessages,
				] );

				return {
					...prev,
					markdownComponents: updatedComponents,
					uiMessages: mergedUIMessages,
				};
			} );
		},
		[]
	);

	// Markdown extensions management
	const registerMarkdownExtensions = useCallback(
		( extensions: MarkdownExtensions ) => {
			setState( ( prev ) => {
				const updatedExtensions = {
					...prev.markdownExtensions,
					...extensions,
				};

				// Re-transform existing client messages
				const updatedUIMessages = prev.clientMessages
					.map( ( msg ) =>
						transformClientMessageToUI(
							msg,
							registrationsRef.current
						)
					)
					.filter( ( msg ): msg is UIMessage => msg !== null );

				// Find UI-only messages (component messages not in client history)
				const clientMessageIds = new Set(
					prev.clientMessages.map( ( msg ) => msg.messageId )
				);
				const uiOnlyMessages = prev.uiMessages.filter(
					( msg ) =>
						! clientMessageIds.has( msg.id ) &&
						msg.content[ 0 ]?.type === 'component'
				);

				// Merge re-transformed messages with UI-only component messages
				const mergedUIMessages = sortUIMessagesByTime( [
					...updatedUIMessages,
					...uiOnlyMessages,
				] );

				return {
					...prev,
					markdownExtensions: updatedExtensions,
					uiMessages: mergedUIMessages,
				};
			} );
		},
		[]
	);

	// Re-transform messages when registrations change
	useEffect( () => {
		setState( ( prev ) => {
			// Don't update if we have no client messages
			if ( prev.clientMessages.length === 0 ) {
				return prev;
			}

			// Re-transform all messages with current registrations
			const updatedUIMessages = prev.clientMessages
				.map( ( msg ) =>
					transformClientMessageToUI( msg, registrationsRef.current )
				)
				.filter( ( msg ): msg is UIMessage => msg !== null );

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

	// Create a memoized message renderer with current configuration
	const messageRenderer = useMemo(
		() =>
			createMessageRenderer( {
				components: state.markdownComponents,
				extensions: state.markdownExtensions,
			} ),
		[ state.markdownComponents, state.markdownExtensions ]
	);

	return {
		// AgentUI props
		messages: state.uiMessages,
		isProcessing: state.isProcessing,
		error: state.error,
		onSubmit,
		suggestions: state.suggestions,
		messageRenderer,

		// UI management methods
		registerSuggestions,
		clearSuggestions,
		registerMarkdownComponents,
		registerMarkdownExtensions,

		// Message actions methods
		registerMessageActions,
		unregisterMessageActions,
		clearAllMessageActions,
		createFeedbackActions,

		// Tool integration
		addMessage,
	};
}

export default useAgentChat;
