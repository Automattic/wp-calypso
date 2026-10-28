import React, { useCallback, useEffect, useRef, useState } from 'react';
import { isA2uiDataPart } from '../client/utils/core';
import { getAgentErrorDetails, type AgentErrorDetails } from '../client/utils/internal/errors';
import { logger } from '../client/utils/logger';
import { resolveActionsForMessage } from '../message-actions/resolver';
import { useMessageActions } from '../message-actions/useMessageActions';
import { getAgentManager, type ToolResultInput, type TurnToolCall } from './agentManager';
import { useRegenerate } from './useRegenerate';
import type {
	AuthProvider,
	Message as ClientMessage,
	ContentType,
	ContextProvider,
	FilePart,
	TaskUpdate,
	ToolProvider,
} from '../client/types/index';
import type { ReactNode } from 'react';

// Utility function to sort UI messages by timestamp
const sortUIMessagesByTime = ( messages: UIMessage[] ): UIMessage[] => {
	return [ ...messages ].sort( ( a, b ) => a.timestamp - b.timestamp );
};

/**
 * Select the UI-only messages to keep when reconciling against client history.
 *
 * UI-only messages are those present in the UI but absent from the agent's
 * client history — typically content injected by tools (e.g. a rendered
 * component). They are kept across a reconcile so they don't disappear when
 * the turn completes. User messages are excluded because the server echoes
 * them back with different IDs, so keeping the local copy would duplicate them.
 * @param uiMessages       - Current UI messages
 * @param clientMessageIds - IDs present in the agent's client history
 * @returns The UI-only messages that should be preserved
 */
export const filterUiOnlyMessages = (
	uiMessages: UIMessage[],
	clientMessageIds: Set< string >
): UIMessage[] => {
	return uiMessages.filter( ( msg ) => ! clientMessageIds.has( msg.id ) && msg.role !== 'user' );
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
export interface SuggestionOption {
	id: string;
	label: string;
	value: string; // Appended to the parent suggestion's prompt with boundary whitespace normalized
}

export interface Suggestion {
	id: string;
	label: string;
	prompt?: string;
	action?: () => boolean | Promise< boolean >;
	options?: SuggestionOption[]; // When present, renders as a dropdown picker
}

// Image data with optional metadata (e.g., WordPress attachment ID)
export interface ImageData {
	url: string;
	metadata?: Record< string, unknown >;
}

// Extra options for submitting a message
export interface SubmitOptions {
	type?: ContentType | 'tool_result' | 'tool_results'; // `text` for normal visible text (default), `context` for hidden context, `tool_result` for tool result (hidden from UI), `tool_results` for the results of several calls of one turn (hidden from UI)
	archived?: boolean;
	imageUrls?: ( string | ImageData )[]; // Array of image URLs or image objects with metadata
	sessionId?: string; // Optional `sessionId` to use for this message (overrides agent's `sessionId`)
	toolCallId?: string; // Required when type is `tool_result`: the tool call ID to respond to
	toolId?: string; // Required when type is `tool_result`: the tool ID
	fileParts?: FilePart[]; // Optional when type is `tool_result`: files (typically images) produced by the tool
	toolResults?: ToolResultInput[]; // Required when type is `tool_results`: one result per call being answered
	turnToolCalls?: TurnToolCall[]; // Optional with `tool_results`: the turn's calls, added to history when this page never saw them
	promptSource?: PromptSource; // Where the prompt came from (e.g. an item of a host's checklist); kept on the message and sent with the client context
}

/**
 * Where a prompt came from, as opposed to who sent it: `source` names the host
 * UI (e.g. `site-setup-checklist`), `id` the item within it. Not to be confused
 * with `clientContext.metadata.source`, which names the calling client and is
 * an analytics dimension. Kept as client metadata on the user message, sent to
 * the server in the client context's `metadata`, and surfaced in the UI message
 * as a `data` part either way, so a live message and one restored from the
 * server look the same.
 */
export interface PromptSource {
	source: string;
	id?: string;
}

/** The client metadata a prompt source is kept under (flat, matching the server's stored context). */
function promptSourceMetadata( promptSource: PromptSource | undefined ): Record< string, unknown > {
	if ( ! promptSource ) {
		return {};
	}
	return {
		promptSource: promptSource.source,
		...( promptSource.id && { promptSourceId: promptSource.id } ),
	};
}

/** The `data` part that carries a prompt source in the UI. */
function promptSourceDataPart( promptSource: PromptSource ): {
	type: 'data';
	data: Record< string, unknown >;
} {
	return { type: 'data', data: promptSourceMetadata( promptSource ) };
}

/** The prompt source a client message keeps in its metadata, if any. */
function readPromptSource( metadata: Record< string, unknown > | undefined ): PromptSource | null {
	const source = metadata?.promptSource;
	if ( typeof source !== 'string' || source === '' ) {
		return null;
	}
	const id = metadata?.promptSourceId;
	return { source, ...( typeof id === 'string' && id !== '' && { id } ) };
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

// Mirrors `MessageAction.visibility` in agenttic-ui.
type MessageActionVisibility = 'always' | 'latest-turn';

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
			visibility?: MessageActionVisibility;
	  }
	| {
			type: 'component';
			id: string;
			label?: string;
			component: React.ComponentType< any >;
			componentProps?: Record< string, unknown >;
			order?: number;
			visibility?: MessageActionVisibility;
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
			visibility?: MessageActionVisibility;
	  }
	| {
			type: 'component';
			id: string;
			label?: string;
			component: React.ComponentType< any >;
			componentProps?: Record< string, unknown >;
			condition?: ( message: UIMessage ) => boolean;
			order?: number;
			visibility?: MessageActionVisibility;
	  };

export interface MessageActionsRegistration {
	id: string;
	actions: MessageActionDefinition[] | ( ( message: UIMessage ) => MessageActionDefinition[] );
}

// Hook interface for managing message actions
export interface UseMessageActionsReturn {
	registerMessageActions: ( registration: MessageActionsRegistration ) => void;
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
				const contentType = ( part.metadata?.contentType as ContentType | undefined ) || 'text';
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
				// Keep an interactive UI surface under `a2ui` for the host to render
				if ( isA2uiDataPart( part ) ) {
					return {
						type: 'data' as const,
						data: { a2ui: part },
					};
				}

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
				if ( Array.isArray( data.sources ) && data.sources.length > 0 ) {
					return {
						type: 'data' as const,
						data,
					};
				}
				// Preserve where a client said a prompt came from (restored from the
				// stored context), so hosts can tell how a conversation started.
				if ( typeof data.promptSource === 'string' && data.promptSource !== '' ) {
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
		.filter( ( item ): item is NonNullable< typeof item > => item !== null );

	// A live user message keeps its prompt source as client metadata; a restored
	// one already carries it as a `data` part (see `serverMessageToMessage`).
	const livePromptSource = readPromptSource( clientMessage.metadata );
	if (
		livePromptSource &&
		! content.some( ( part ) => part.type === 'data' && 'promptSource' in ( part.data ?? {} ) )
	) {
		content.push( promptSourceDataPart( livePromptSource ) );
	}

	// Drop messages with nothing to show. Keeping them would add empty
	// entries to the list and throw off message counts.
	if ( content.length === 0 ) {
		return null;
	}

	// Extract timestamp from message metadata or use current time as fallback
	const timestamp = ( clientMessage.metadata?.timestamp as number ) ?? Date.now();

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
	if ( clientMessage.role === 'agent' && messageActionsRegistrations.length > 0 ) {
		const resolvedActions = resolveActionsForMessage( uiMessage, messageActionsRegistrations );

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
	/** Called when the server assigns a new session ID or changes the current one */
	onSessionIdChange?: ( sessionId: string ) => void;
	contextProvider?: ContextProvider;
	toolProvider?: ToolProvider;
	authProvider?: AuthProvider;
	enableStreaming?: boolean; // Enable token-by-token streaming
	// Observe every raw TaskUpdate yielded by the stream before built-in UI handling.
	onTaskUpdate?: ( update: TaskUpdate ) => void | Promise< void >;
	odieBotId?: string; // Odie bot ID for server-based conversation storage (e.g., 'wpcom-agent-wp_orchestrator'). When set, enables server storage.
	credentials?: RequestCredentials; // Set 'include' to send cookies with cross-origin requests.
	trackReplying?: boolean; // Set to get `isReplying` (needs `enableStreaming`). Reply text then also clears the progress text.
	// Called for a failure the chat doesn't show: a request the client's timer cut off
	// (`timedOut`), or a stream that ended without finishing the turn (`StreamIncompleteError`).
	onSilentError?: ( details: AgentErrorDetails ) => void;
}

// Hook return interface
export interface UseAgentChatReturn {
	// AgentUI props
	messages: UIMessage[];
	isProcessing: boolean;
	error: string | null;
	// The status and code behind `error`, so a consumer can tell causes apart without its text.
	errorDetails: AgentErrorDetails | null;
	onSubmit: ( message: string, options?: SubmitOptions ) => Promise< void >;
	suggestions: Suggestion[];
	progressMessage: string | null;
	progressPhase: string | null;
	isReplying?: boolean; // Whether reply text is streaming in. Only with `trackReplying`, during a request.

	// UI management methods
	registerSuggestions: ( suggestions: Suggestion[] ) => void;
	clearSuggestions: () => void;

	// Message actions methods
	registerMessageActions: ( registration: MessageActionsRegistration ) => void;
	unregisterMessageActions: ( id: string ) => void;
	clearAllMessageActions: () => void;
	// Returns the regenerate handler for an eligible assistant message (or the
	// latest eligible one when no message is given), or null when regeneration
	// isn't possible. Consumers build the action spec (label, icon, order, …).
	getRegenerateHandler: ( message?: UIMessage ) => ( () => Promise< void > ) | null;

	// Tool integration
	addMessage: ( message: UIMessage ) => void;

	// Abort control
	abortCurrentRequest: () => void;

	// Conversation loading
	loadMessages: ( messages: ClientMessage[] ) => Promise< void >;
}

// Internal state interface
export interface AgentChatState {
	clientMessages: ClientMessage[];
	uiMessages: UIMessage[];
	isProcessing: boolean;
	error: string | null;
	errorDetails: AgentErrorDetails | null;
	suggestions: Suggestion[];
	progressMessage: string | null;
	progressPhase: string | null;
	isReplying: boolean;
}

export interface InternalSubmitOptions {
	initialClientMessages?: ClientMessage[];
	initialUiMessages?: UIMessage[];
	messageOverride?: ClientMessage;
	preserveUiOnlyMessages?: boolean;
	// History to replace before sending. Applied inside the guarded send so a
	// no-op (concurrent send) never truncates and any failure restores.
	truncateHistoryTo?: ClientMessage[];
	restoreOnError?: {
		clientMessages: ClientMessage[];
		uiMessages: UIMessage[];
	};
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
		errorDetails: null,
		suggestions: [],
		progressMessage: null,
		progressPhase: null,
		isReplying: false,
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

	const stateRef = useRef( state );
	useEffect( () => {
		stateRef.current = state;
	}, [ state ] );

	// Keep the raw task-update observer and `trackReplying` fresh without
	// reinitializing the agent or changing the stable onSubmit callback identity.
	const onTaskUpdateRef = useRef( config.onTaskUpdate );
	useEffect( () => {
		onTaskUpdateRef.current = config.onTaskUpdate;
	}, [ config.onTaskUpdate ] );
	const trackReplyingRef = useRef( config.trackReplying );
	useEffect( () => {
		trackReplyingRef.current = config.trackReplying;
	}, [ config.trackReplying ] );
	const onSilentErrorRef = useRef( config.onSilentError );
	useEffect( () => {
		onSilentErrorRef.current = config.onSilentError;
	}, [ config.onSilentError ] );

	// Use a ref to always have access to the latest registrations
	const registrationsRef = useRef( registrations );
	useEffect( () => {
		registrationsRef.current = registrations;
	}, [ registrations ] );

	// Transform client messages to UI messages
	const transformMessages = useCallback(
		( messages: ClientMessage[] ): UIMessage[] => {
			return messages
				.map( ( msg ) => transformClientMessageToUI( msg, registrationsRef.current ) )
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

			let hasAgent = agentManager.hasAgent( agentKey );
			if (
				hasAgent &&
				agentManager.getAgentSessionId( agentKey ) !== ( agentConfig.sessionId || null )
			) {
				agentManager.abortCurrentRequest( agentKey );
				agentManager.removeAgent( agentKey );
				hasAgent = false;
				setState( ( prev ) => ( { ...prev, clientMessages: [], uiMessages: [] } ) );
			}

			// Always ensure agent exists, even for new chats with empty sessionId
			if ( ! hasAgent ) {
				await agentManager.createAgent( agentKey, {
					agentId: agentConfig.agentId,
					agentUrl: agentConfig.agentUrl,
					sessionId: agentConfig.sessionId, // Can be empty for new chats
					sessionIdStorageKey: agentConfig.sessionIdStorageKey,
					onSessionIdChange: config.onSessionIdChange,
					contextProvider: config.contextProvider || createNoOpContextProvider(),
					toolProvider: config.toolProvider || createNoOpToolProvider(),
					authProvider: config.authProvider,
					enableStreaming: config.enableStreaming,
					odieBotId: config.odieBotId,
					credentials: config.credentials,
				} );

				// Only load messages when creating a new agent (initial mount or after removeAgent)
				if ( agentConfig.sessionId ) {
					const clientHistory = agentManager.getConversationHistory( agentKey );
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
				const currentHistory = agentManager.getConversationHistory( agentKey );
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
		config.onSessionIdChange,
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
	const sendMessage = useCallback(
		async ( message: string, options?: SubmitOptions, internalOptions?: InternalSubmitOptions ) => {
			if ( ! isValidConfig ) {
				throw new Error( 'Invalid agent configuration' );
			}

			const isToolResults = options?.type === 'tool_results';
			const isToolResult = options?.type === 'tool_result' || isToolResults;

			// Validate before claiming the send lock — only the `finally` at
			// the end of the send releases it, so a throw above that point
			// would strand it and silently drop every later send.
			if ( isToolResults && ! options?.toolResults?.length ) {
				throw new Error( '`toolResults` is required when type is `tool_results`' );
			}
			if ( isToolResult && ! isToolResults && ( ! options?.toolCallId || ! options?.toolId ) ) {
				throw new Error( '`toolCallId` and `toolId` are required when type is `tool_result`' );
			}

			if ( isSendingRef.current ) {
				return;
			}
			isSendingRef.current = true;

			// Keep in-flight updates attached to the site and agent that started the request.
			const onTaskUpdate = onTaskUpdateRef.current;
			const agentManager = getAgentManager();
			const agentKey = agentConfig.agentId;
			const preserveUiOnlyMessages = internalOptions?.preserveUiOnlyMessages ?? true;
			// A consumer's reporter must not change the turn. `onTaskUpdate` is guarded the same way.
			const reportSilentError = ( details: AgentErrorDetails ) => {
				try {
					onSilentErrorRef.current?.( details );
				} catch ( reporterError ) {
					logger( 'Error in onSilentError callback: %O', reporterError );
				}
			};

			const restoreMessagesOnError = async (
				error: string | null,
				errorDetails: AgentErrorDetails | null
			): Promise< boolean > => {
				const restoreOnError = internalOptions?.restoreOnError;

				if ( ! restoreOnError ) {
					return false;
				}

				// The restore must never throw: a failure here would mask the
				// original error and leave `isProcessing` stuck. Surface the
				// original error regardless of whether persistence succeeds.
				try {
					await agentManager.replaceMessages( agentKey, restoreOnError.clientMessages );
				} catch ( restoreError ) {
					logger( 'Failed to restore conversation history after a failed send', restoreError );
				}

				setState( ( prev ) => ( {
					...prev,
					clientMessages: restoreOnError.clientMessages,
					uiMessages: restoreOnError.uiMessages,
					isProcessing: false,
					progressMessage: null,
					progressPhase: null,
					error,
					errorDetails,
				} ) );

				return true;
			};

			// Capture timestamp once for consistency
			const messageTimestamp = Date.now();

			// Create user message immediately for UI (skipped for tool results)
			if ( ! isToolResult ) {
				const contentType = ( options?.type || 'text' ) as ContentType;
				const promptSourcePart = options?.promptSource
					? promptSourceDataPart( options.promptSource )
					: null;
				const userMessage = internalOptions?.messageOverride
					? transformClientMessageToUI( internalOptions.messageOverride, [] )
					: ( {
							id: `user-${ messageTimestamp }`,
							role: 'user',
							content: [
								{ type: contentType, text: message },
								// Map image URLs to component content parts
								...( options?.imageUrls?.map( ( imageData ) => {
									const url = typeof imageData === 'string' ? imageData : imageData.url;
									return createImageComponent( url );
								} ) ?? [] ),
								...( promptSourcePart ? [ promptSourcePart ] : [] ),
							],
							timestamp: messageTimestamp,
							archived: options?.archived ?? false,
							showIcon: false,
						} as UIMessage );

				setState( ( prev ) => ( {
					...prev,
					clientMessages: internalOptions?.initialClientMessages ?? prev.clientMessages,
					uiMessages: userMessage
						? [ ...( internalOptions?.initialUiMessages ?? prev.uiMessages ), userMessage ]
						: ( internalOptions?.initialUiMessages ?? prev.uiMessages ),
					isProcessing: true,
					isReplying: false,
					error: null,
					errorDetails: null,
				} ) );
			} else {
				setState( ( prev ) => ( {
					...prev,
					isProcessing: true,
					isReplying: false,
					error: null,
					errorDetails: null,
				} ) );
			}

			try {
				// Truncate history inside the guarded send so a concurrent
				// no-op leaves history intact and any failure is restored.
				if ( internalOptions?.truncateHistoryTo ) {
					await agentManager.replaceMessages( agentKey, internalOptions.truncateHistoryTo );
				}

				// Track streaming message for incremental updates
				let streamingMessageId: string | null = null;
				let finalMessageAdded = false;
				// As in `agentManager`: a final update, or a pause for a tool result or user input.
				let sawTurnTerminus = false;

				// Pass metadata including archived flag and content type if provided
				const messageOptions: any = {};
				const hasContentType = !! options?.type && ! isToolResult;
				if ( options?.archived || hasContentType || options?.promptSource ) {
					messageOptions.metadata = {
						...( options?.archived && { archived: true } ),
						...( hasContentType && { contentType: options!.type } ),
						...promptSourceMetadata( options?.promptSource ),
					};
				}
				// Pass sessionId if provided (overrides agent's default sessionId)
				if ( options?.sessionId ) {
					messageOptions.sessionId = options.sessionId;
				}

				if ( options?.imageUrls ) {
					messageOptions.imageUrls = options.imageUrls;
				}

				if ( internalOptions?.messageOverride ) {
					messageOptions.message = internalOptions.messageOverride;
				}

				// Use `sendToolResults` / `sendToolResult` for tool results (they clean
				// up duplicate results from conversation history and send
				// `ToolResultDataPart`s), otherwise use regular `sendMessageStream`.
				let stream: AsyncIterable< TaskUpdate >;
				if ( isToolResults ) {
					stream = agentManager.sendToolResults(
						agentKey,
						options!.toolResults!,
						options?.turnToolCalls,
						messageOptions
					);
				} else if ( isToolResult ) {
					stream = agentManager.sendToolResult(
						agentKey,
						options!.toolCallId!,
						options!.toolId!,
						{ success: true, message },
						messageOptions,
						options?.fileParts
					);
				} else {
					stream = agentManager.sendMessageStream( agentKey, message, messageOptions );
				}

				for await ( const update of stream ) {
					if ( update.final || update.status?.state === 'input-required' ) {
						sawTurnTerminus = true;
					}

					if ( onTaskUpdate ) {
						try {
							await onTaskUpdate( update );
						} catch ( observerError ) {
							logger( 'Error in onTaskUpdate callback: %O', observerError );
						}
					}

					// Reply text means the agent is talking; any other update means it's working.
					// An empty content delta is a keep-alive and changes nothing.
					const isContentDelta = update.delta?.deltaType === 'content';
					const isKeepAlive = isContentDelta && ! update.delta?.content;
					if ( trackReplyingRef.current && ! isKeepAlive ) {
						setState( ( prev ) =>
							prev.isReplying === isContentDelta
								? prev
								: {
										...prev,
										isReplying: isContentDelta,
										// The progress text is stale once the reply starts.
										...( isContentDelta && { progressMessage: null, progressPhase: null } ),
									}
						);
					}

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
								content: [ { type: 'text', text: update.text } ],
								timestamp: Date.now(),
								archived: false,
								showIcon: true,
								icon: 'assistant',
								reactKey: streamingMessageId, // Stable key for React rendering
							};

							setState( ( prev ) => ( {
								...prev,
								uiMessages: [ ...prev.uiMessages, streamingMessage ],
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
					if ( update.final && update.status?.message && streamingMessageId ) {
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
								const updatedMessages = prev.uiMessages.map( ( msg ) => {
									if ( msg.id === currentStreamingId ) {
										// Use server content if it's longer (final message may have complete text)
										// Otherwise keep streamed content to avoid flicker
										const useServerContent =
											finalMessage.content.length > 0 &&
											finalMessage.content[ 0 ]?.text &&
											msg.content[ 0 ]?.text &&
											finalMessage.content[ 0 ].text.length > msg.content[ 0 ].text.length;

										// The streamed bubble has only text, so add the final message's surfaces
										const surfaceContent = finalMessage.content.filter(
											( content ) => content.type === 'data' && isA2uiDataPart( content.data?.a2ui )
										);

										return {
											...finalMessage,
											reactKey: msg.reactKey || currentStreamingId, // Keep stable reactKey
											content: useServerContent
												? finalMessage.content
												: [ ...msg.content, ...surfaceContent ],
										};
									}
									return msg;
								} );

								// Update client messages from conversation history
								const updatedClientHistory = agentManager.getConversationHistory( agentKey );
								const clientMessageIds = new Set(
									updatedClientHistory.map( ( msg ) => msg.messageId )
								);
								const nextUIMessages = preserveUiOnlyMessages
									? updatedMessages
									: updatedMessages.filter( ( msg ) => clientMessageIds.has( msg.id ) );

								return {
									...prev,
									clientMessages: updatedClientHistory,
									uiMessages: nextUIMessages,
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

				// An SSE reader that hits EOF mid-turn reads as a clean finish. The
				// turn settles as before; the failure is only reported.
				if ( ! sawTurnTerminus ) {
					reportSilentError( { name: 'StreamIncompleteError' } );
				}

				// Only update from conversation history if we didn't already handle the final message
				if ( ! finalMessageAdded ) {
					// Update internal messages and transform for UI
					const updatedClientHistory = agentManager.getConversationHistory( agentKey );

					setState( ( prev ) => {
						// Remove any remaining streaming message
						let filteredMessages = prev.uiMessages;
						if ( streamingMessageId ) {
							filteredMessages = prev.uiMessages.filter( ( msg ) => msg.id !== streamingMessageId );
						}

						// Transform client messages to UI format
						const transformedClientMessages = updatedClientHistory
							.map( ( msg ) => transformClientMessageToUI( msg, registrationsRef.current ) )
							.filter( ( msg ): msg is UIMessage => msg !== null );

						// Find UI-only messages (messages not in client history, e.g. injected by tools)
						// Exclude user messages since they'll come back from server with different IDs
						const clientMessageIds = new Set(
							updatedClientHistory.map( ( msg ) => msg.messageId )
						);
						const uiOnlyMessages = preserveUiOnlyMessages
							? filterUiOnlyMessages( filteredMessages, clientMessageIds )
							: [];

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
					const errorDetails = getAgentErrorDetails( error );
					if ( errorDetails.timedOut ) {
						reportSilentError( errorDetails );
						logger( 'Request was cut off by the client timer' );
					} else {
						logger( 'Request was aborted by user' );
					}
					const restored = await restoreMessagesOnError( null, null );
					if ( ! restored ) {
						setState( ( prev ) => ( {
							...prev,
							isProcessing: false,
							progressMessage: null,
							progressPhase: null,
							error: null, // Don't show error for user-initiated abort
							errorDetails: null,
						} ) );
					}
					return; // Don't re-throw AbortError
				}

				const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
				const errorDetails = getAgentErrorDetails( error );
				const restored = await restoreMessagesOnError( errorMessage, errorDetails );
				if ( ! restored ) {
					setState( ( prev ) => ( {
						...prev,
						isProcessing: false,
						progressMessage: null,
						progressPhase: null,
						error: errorMessage,
						errorDetails,
					} ) );
				}
				throw error;
			} finally {
				isSendingRef.current = false;
			}
		},
		[ agentConfig.agentId, isValidConfig ]
	);

	const onSubmit = useCallback(
		( message: string, options?: SubmitOptions ) => sendMessage( message, options ),
		[ sendMessage ]
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

	// Re-transform messages when registrations change so newly registered
	// actions are resolved onto existing messages.
	useEffect( () => {
		setState( ( prev ) => {
			// A send owns the optimistic user message until it reconciles, so
			// rebuilding here mid-flight would drop it. Let the send settle.
			if ( isSendingRef.current ) {
				return prev;
			}

			// Don't update if we have no client messages
			if ( prev.clientMessages.length === 0 ) {
				return prev;
			}

			// Re-transform all messages with current registrations
			const updatedUIMessages = transformMessages( prev.clientMessages );

			// Find UI-only messages (messages not in client history, e.g. injected by tools)
			// Exclude user messages since they'll come back from server with different IDs
			const clientMessageIds = new Set( prev.clientMessages.map( ( msg ) => msg.messageId ) );
			const uiOnlyMessages = prev.uiMessages.filter(
				( msg ) => ! clientMessageIds.has( msg.id ) && msg.role !== 'user'
			);

			return {
				...prev,
				uiMessages: sortUIMessagesByTime( [ ...updatedUIMessages, ...uiOnlyMessages ] ),
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

	const { getRegenerateHandler } = useRegenerate( {
		agentId: agentConfig.agentId,
		isValidConfig,
		isSendingRef,
		stateRef,
		transformMessages,
		sendMessage,
	} );

	return {
		// AgentUI props
		messages: state.uiMessages,
		isProcessing: state.isProcessing,
		error: state.error,
		errorDetails: state.errorDetails,
		onSubmit,
		suggestions: state.suggestions,
		progressMessage: state.progressMessage,
		progressPhase: state.progressPhase,
		isReplying: config.trackReplying && state.isProcessing ? state.isReplying : undefined,

		// UI management methods
		registerSuggestions,
		clearSuggestions,

		// Message actions methods
		registerMessageActions,
		unregisterMessageActions,
		clearAllMessageActions,
		getRegenerateHandler,

		// Tool integration
		addMessage,

		// Abort control
		abortCurrentRequest,

		// Conversation loading
		loadMessages,
	};
}

export default useAgentChat;
