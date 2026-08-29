import {
	getAgentManager,
	useAgentChat,
	type TaskUpdate,
	type UIMessage,
} from '@automattic/agenttic-client';
import {
	type Suggestion,
	type MarkdownComponents,
	type MarkdownExtensions,
} from '@automattic/agenttic-ui';
import { select as selectDataStore, useSelect } from '@wordpress/data';
import {
	useState,
	useCallback,
	useMemo,
	useEffect,
	useLayoutEffect,
	useRef,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { LOCAL_TOOL_RUNNING_MESSAGE } from '../../constants';
import { useAgentsManagerContext } from '../../contexts';
import { useRegisterCustomActions } from '../../hooks/custom-actions';
import useAbilitiesRegistration from '../../hooks/use-abilities-registration';
import useAgentTraceIds from '../../hooks/use-agent-trace-ids';
import { useBroadcastConversationActivity } from '../../hooks/use-broadcast-conversation-activity';
import { useBroadcastTurnActivity } from '../../hooks/use-broadcast-turn-activity';
import useCheckpointAction, {
	getCheckpointIdForMessage,
	invalidateCheckpointAction,
	isCheckpointActionInvalidated,
	setCheckpointActionReverted,
} from '../../hooks/use-checkpoint-action';
import useConversation from '../../hooks/use-conversation';
import useCopyAction from '../../hooks/use-copy-action';
import { usePageOrSiteEditorSurface } from '../../hooks/use-empty-view-suggestions';
import useFeedbackAction from '../../hooks/use-feedback-action';
import { useImageUpload } from '../../hooks/use-image-upload';
import { useNavigationContinuation } from '../../hooks/use-navigation-continuation';
import useRegenerateAction from '../../hooks/use-regenerate-action';
import useSourcesAction from '../../hooks/use-sources-action';
import {
	blockCurrentRequest,
	buildCanvasKey,
	getCanvasMove,
	isCanvasWritingAgent,
	startNewUserRequest,
} from '../../utils/canvas-binding';
import convertToolMessagesToComponents, {
	type AgentsManagerUIMessage,
	isContextOnlyMessage,
} from '../../utils/convert-tool-messages-to-components';
import {
	consumeNextMessageExternalContextEntries,
	removeExternalContextCard,
	removeExternalContextEntry,
	type ExternalContextCard,
	type ExternalContextCardAction,
} from '../../utils/external-context';
import { generateUUID } from '../../utils/generate-uuid';
import { isReaderChatAgent } from '../../utils/is-reader-chat-agent';
import { mergeEmptyViewSuggestions } from '../../utils/merge-empty-view-suggestions';
import { getOrchestratorErrorMessage } from '../../utils/orchestrator-error-message';
import { setProviderCheckpoints } from '../../utils/provider-checkpoints';
import { getReaderChatErrorMessage } from '../../utils/reader-chat-error-message';
import { isShowComponentTool } from '../../utils/show-component-tools';
import { isBlockEditToolId } from '../../utils/tool-message-utils';
import { recordAgentsManagerTracksEvent, recordBigSkyTracksEvent } from '../../utils/tracks';
import AgentChat from '../agent-chat';
import { type Options as ChatHeaderOptions } from '../chat-header';
import type { BigSkyMessage } from '../../types';
import type {
	AbilitiesSetupHook,
	GetChatComponent,
	UseSuggestionsHook,
	SiteBuildUtils,
	TransformMessages,
	UseCheckpointHook,
	ProviderCapabilities,
} from '../../utils/load-external-providers';

const streamedCheckpointMessagesBySession = new Map< string, Map< string, UIMessage > >();
let activeStreamedCheckpointSession:
	| {
			scopeIdentity: string;
			sessionId: string;
			sessionIdentity: string;
			liveFinalMessageIds: Set< string >;
	  }
	| undefined;

function getStreamedCheckpointMessages( sessionIdentity: string ): Map< string, UIMessage > {
	const existing = streamedCheckpointMessagesBySession.get( sessionIdentity );
	if ( existing ) {
		return existing;
	}

	const messages = new Map< string, UIMessage >();
	streamedCheckpointMessagesBySession.set( sessionIdentity, messages );
	return messages;
}

function getLiveStreamedCheckpointMessageIds( sessionIdentity: string ): Set< string > {
	return activeStreamedCheckpointSession?.sessionIdentity === sessionIdentity
		? activeStreamedCheckpointSession.liveFinalMessageIds
		: new Set< string >();
}

function activateLiveStreamedCheckpointSession(
	scopeIdentity: string,
	sessionId: string,
	sessionIdentity: string,
	liveFinalMessageIds: Set< string >
): Set< string > {
	const previousSession = activeStreamedCheckpointSession;
	if ( previousSession?.sessionIdentity === sessionIdentity ) {
		return previousSession.liveFinalMessageIds;
	}

	const isSessionBootstrap =
		previousSession?.scopeIdentity === scopeIdentity &&
		previousSession.sessionId === '' &&
		sessionId !== '';
	const nextLiveFinalMessageIds =
		previousSession && isSessionBootstrap
			? previousSession.liveFinalMessageIds
			: liveFinalMessageIds;
	activeStreamedCheckpointSession = {
		scopeIdentity,
		sessionId,
		sessionIdentity,
		liveFinalMessageIds: nextLiveFinalMessageIds,
	};
	return nextLiveFinalMessageIds;
}

function getLatestAgentMessageId( messages: UIMessage[] ): string | null {
	for ( let index = messages.length - 1; index >= 0; index-- ) {
		if ( messages[ index ].role === 'agent' ) {
			return messages[ index ].id;
		}
	}

	return null;
}

function getLatestUserMessageIndex( messages: UIMessage[] ): number {
	for ( let index = messages.length - 1; index >= 0; index-- ) {
		if ( messages[ index ].role === 'user' && ! isContextOnlyMessage( messages[ index ] ) ) {
			return index;
		}
	}

	return -1;
}

/**
 * Pipe-delimited list of suggestion ids (e.g. `|id1|id2|`), matching Big Sky's
 * `suggestions` / `available_suggestions` tracks-prop format.
 */
function formatSuggestionIds( suggestions: Suggestion[] ): string {
	return '|' + suggestions.map( ( s ) => s.id ).join( '|' ) + '|';
}

/**
 * Get `option_id` by matching Agenttic's selected prompt to the original options.
 * The current tracked dropdowns have an empty parent prompt, so Agenttic copies the
 * selected option's configured value unchanged. For example, selecting Formal
 * returns that option's value, which maps directly to the stable id `formal`.
 * Provider tests enforce the empty parent prompt requirement.
 */
function getSelectedOptionId(
	selectedSuggestion: Suggestion,
	originalSuggestion: Suggestion | undefined
): string | undefined {
	return originalSuggestion?.options?.find(
		( option ) => option.value === selectedSuggestion.prompt
	)?.id;
}

function getToolMessageData( message: Pick< UIMessage, 'content' > ):
	| {
			toolId?: string;
			toolCallId?: string;
			componentType?: string;
			summary?: string;
	  }
	| undefined {
	const firstText = message.content?.[ 0 ]?.text;
	if ( ! firstText ) {
		return undefined;
	}

	try {
		const parsed = JSON.parse( firstText );
		return {
			toolId: parsed?.tool_id,
			toolCallId: parsed?.tool_call_id,
			componentType: parsed?.data?.type,
			summary: parsed?.data?.summary,
		};
	} catch ( _error ) {
		return undefined;
	}
}

function getBlockEditAgentMessageText( update: TaskUpdate ): string | undefined {
	const candidateTexts = update.text ? [ update.text ] : [];

	for ( const message of [ update.status.message, update.agentMessage ] ) {
		for ( const part of message?.parts ?? [] ) {
			if ( part.type !== 'data' || typeof part.data !== 'object' || part.data === null ) {
				continue;
			}

			if ( ! ( 'result' in part.data ) ) {
				continue;
			}

			const result = part.data.result;
			if ( typeof result !== 'object' || result === null ) {
				continue;
			}

			const agentMessage = ( result as { agentMessage?: unknown } ).agentMessage;
			if ( typeof agentMessage === 'string' ) {
				candidateTexts.push( agentMessage );
			}
		}
	}

	for ( const candidateText of candidateTexts ) {
		const candidateMessage = { content: [ { type: 'text' as const, text: candidateText } ] };
		if ( isBlockEditToolId( getToolMessageData( candidateMessage )?.toolId ) ) {
			return candidateText;
		}
	}

	return undefined;
}

function isShowComponentMessage( message: Pick< UIMessage, 'content' > ): boolean {
	const toolData = getToolMessageData( message );
	return isShowComponentTool( toolData?.toolId );
}

function getShowComponentIdentity( message: Pick< UIMessage, 'content' > ): string | undefined {
	const toolData = getToolMessageData( message );
	if ( ! toolData || ! isShowComponentTool( toolData.toolId ) ) {
		return undefined;
	}

	return [ toolData.toolCallId, toolData.componentType, toolData.summary ]
		.filter( Boolean )
		.join( '|' );
}

function convertBigSkyMessageToUIMessage( message: BigSkyMessage ): UIMessage {
	const uiMessage = {
		// Keep Big Sky message properties without explicit mapping to keep linter happy.
		// Big Sky messages sometimes have a `context` field used by the site build to
		// show the progress indicator.
		...message,
		id: message.id,
		role: message.role === 'assistant' ? 'agent' : 'user',
		content: message.content,
		timestamp: message.created_at ? message.created_at * 1000 : Date.now(),
		archived: message.archived ?? false,
		showIcon: message.showIcon ?? true,
	} as UIMessage;

	return uiMessage;
}

interface Props {
	/** Suggestions displayed when the chat is empty. */
	emptyViewSuggestions: Suggestion[];
	/** Indicates if the chat is docked in the sidebar. */
	isDocked: boolean;
	/** Indicates if the chat is expanded (floating mode). */
	isOpen: boolean;
	/** Indicates if suggestions are visible in the current layout. */
	suggestionsVisible: boolean;
	/** Called when the chat is closed. */
	onClose: () => void;
	/** Called when the chat is expanded (floating mode). */
	onExpand: () => void;
	/** Chat header menu options. */
	chatHeaderOptions: ChatHeaderOptions;
	/** Custom components for rendering markdown. */
	markdownComponents: MarkdownComponents;
	/** Custom markdown extensions. */
	markdownExtensions: MarkdownExtensions;
	/** Indicates if the floating chat is in compact mode. */
	isCompactMode: boolean;
	/** The external providers' abilities-setup hook (e.g. Big Sky, jetpack-ai-sidebar). Invoked after custom actions registration. */
	useProviderAbilitiesSetup?: AbilitiesSetupHook;
	/** Hook for providing dynamic suggestions based on context (e.g., selected block). */
	useSuggestions?: UseSuggestionsHook;
	/** Get a chat component by type for rendering in agent messages. */
	getChatComponent?: GetChatComponent;
	/** Utilities for site building flow (e.g., progress tracking, site preview). */
	siteBuildUtils?: SiteBuildUtils;
	/** Rewrite the transcript before it is displayed. See `TransformMessages`. */
	transformMessages?: TransformMessages;
	/** Hook for saving and restoring editor state so that AI actions can be undone. */
	useCheckpoint?: UseCheckpointHook;
	/** Optional capability flags declared by one or more loaded providers. */
	capabilities?: ProviderCapabilities;
	/** Renders the chat with a disabled input. Driven by `setChatEnabled( false )`. */
	isChatInputDisabled?: boolean;
	/** Called when the has-messages state changes. */
	onHasMessagesChange: ( hasMessages: boolean ) => void;
}

export default function OrchestratorChat( {
	emptyViewSuggestions,
	isDocked,
	isOpen,
	suggestionsVisible,
	onClose,
	onExpand,
	chatHeaderOptions,
	markdownComponents,
	markdownExtensions,
	isCompactMode,
	useProviderAbilitiesSetup,
	useSuggestions,
	getChatComponent,
	siteBuildUtils,
	transformMessages,
	useCheckpoint,
	capabilities,
	isChatInputDisabled,
	onHasMessagesChange,
}: Props ) {
	const { agentConfig, getTabSessionId, siteKey, currentUser } = useAgentsManagerContext();

	const [ inputValue, setInputValue ] = useState( '' );
	const [ isThinking, setIsThinking ] = useState( false );
	const [ thinkingMessage, setThinkingMessage ] = useState< string | null >( null );
	const [ isBuildingSite, setIsBuildingSite ] = useState( false );
	const [ deletedMessageIds, setDeletedMessageIds ] = useState< Set< string > >( new Set() );
	const [ sourceDriftInvalidatedCheckpointIds, setSourceDriftInvalidatedCheckpointIds ] = useState<
		Set< string >
	>( new Set() );
	const pendingCheckpointActionIdsRef = useRef( new Set< string >() );
	const completedInlineUndoCheckpointIdRef = useRef< string | undefined >( undefined );
	const [ checkpointActionRevision, setCheckpointActionRevision ] = useState( 0 );
	const [ retainedShowComponentMessages, setRetainedShowComponentMessages ] = useState<
		Map< string, UIMessage >
	>( new Map() );
	const [ isRegenerating, setIsRegenerating ] = useState( false );
	const [ hasUserSentMessage, setHasUserSentMessage ] = useState( false );
	const currentPostId = useSelect( ( select ) => {
		const editor = select( 'core/editor' ) as { getCurrentPostId?: () => number | string };
		return editor?.getCurrentPostId?.();
	}, [] );
	// The canvas the editor has open, as the value the abort effect watches. A
	// separate select from `currentPostId` above: that one feeds message rendering
	// and stays a bare id, while this needs the post type too — a page and a
	// template can share an id, and a move between them must not read as a stay.
	const canvasKey = useSelect( ( select ) => {
		const editor = select( 'core/editor' ) as {
			getCurrentPostId?: () => number | string | undefined;
			getCurrentPostType?: () => string | undefined;
		};
		return buildCanvasKey( editor?.getCurrentPostType?.(), editor?.getCurrentPostId?.() );
	}, [] );
	const selectedBlockType = useSelect( ( select ) => {
		try {
			const blockEditor = select( 'core/block-editor' ) as {
				getSelectedBlock?: () => { name?: unknown } | null;
			};
			const blockName = blockEditor?.getSelectedBlock?.()?.name;
			return typeof blockName === 'string' && blockName ? blockName : undefined;
		} catch {
			return undefined;
		}
	}, [] );
	const hasEditorRedo = useSelect( ( select ) => {
		try {
			const editor = select( 'core/editor' ) as { hasEditorRedo?: () => boolean };
			return editor?.hasEditorRedo?.() ?? false;
		} catch {
			return false;
		}
	}, [] );
	const previousHasEditorRedoRef = useRef( hasEditorRedo );
	const { isPageOrSiteEditorSurface: groupWritingSuggestions } = usePageOrSiteEditorSurface();
	const checkpointAgentId = agentConfig?.agentId ?? '';
	const checkpointSessionId = agentConfig?.sessionId ?? getTabSessionId() ?? '';
	const checkpointScopeIdentity = JSON.stringify( [
		siteKey,
		currentUser?.ID ?? null,
		checkpointAgentId,
	] );
	const checkpointSessionIdentity = JSON.stringify( [
		siteKey,
		currentUser?.ID ?? null,
		checkpointAgentId,
		checkpointSessionId,
	] );
	const liveFinalMessageIds = getLiveStreamedCheckpointMessageIds( checkpointSessionIdentity );
	const streamedCheckpointMessagesRef = useRef( {
		scopeIdentity: checkpointScopeIdentity,
		sessionId: checkpointSessionId,
		sessionIdentity: checkpointSessionIdentity,
		streamGeneration: Symbol(),
		pendingByTaskId: new Map< string, UIMessage >(),
		byFinalMessageId: getStreamedCheckpointMessages( checkpointSessionIdentity ),
		liveFinalMessageIds,
		regeneratingMessageId: undefined as string | undefined,
	} );
	if ( streamedCheckpointMessagesRef.current.sessionIdentity !== checkpointSessionIdentity ) {
		const previousStreamedMessages = streamedCheckpointMessagesRef.current;
		const byFinalMessageId = getStreamedCheckpointMessages( checkpointSessionIdentity );
		const isSessionBootstrap =
			previousStreamedMessages.scopeIdentity === checkpointScopeIdentity &&
			previousStreamedMessages.sessionId === '' &&
			checkpointSessionId !== '';

		if ( isSessionBootstrap ) {
			previousStreamedMessages.byFinalMessageId.forEach( ( message, messageId ) => {
				if ( ! byFinalMessageId.has( messageId ) ) {
					byFinalMessageId.set( messageId, message );
				}
			} );
			if (
				streamedCheckpointMessagesBySession.get( previousStreamedMessages.sessionIdentity ) ===
				previousStreamedMessages.byFinalMessageId
			) {
				streamedCheckpointMessagesBySession.delete( previousStreamedMessages.sessionIdentity );
			}
		}

		streamedCheckpointMessagesRef.current = {
			scopeIdentity: checkpointScopeIdentity,
			sessionId: checkpointSessionId,
			sessionIdentity: checkpointSessionIdentity,
			streamGeneration: isSessionBootstrap ? previousStreamedMessages.streamGeneration : Symbol(),
			pendingByTaskId: isSessionBootstrap ? previousStreamedMessages.pendingByTaskId : new Map(),
			byFinalMessageId,
			liveFinalMessageIds: isSessionBootstrap
				? previousStreamedMessages.liveFinalMessageIds
				: liveFinalMessageIds,
			regeneratingMessageId: isSessionBootstrap
				? previousStreamedMessages.regeneratingMessageId
				: undefined,
		};
	}
	useLayoutEffect( () => {
		streamedCheckpointMessagesRef.current.liveFinalMessageIds =
			activateLiveStreamedCheckpointSession(
				checkpointScopeIdentity,
				checkpointSessionId,
				checkpointSessionIdentity,
				streamedCheckpointMessagesRef.current.liveFinalMessageIds
			);
	}, [ checkpointScopeIdentity, checkpointSessionId, checkpointSessionIdentity ] );
	const checkpointStreamGeneration = streamedCheckpointMessagesRef.current.streamGeneration;
	const agentChatConfig = useMemo( () => {
		if ( ! agentConfig ) {
			return null;
		}

		const { onTaskUpdate } = agentConfig;
		return {
			...agentConfig,
			onTaskUpdate: async ( update: TaskUpdate ) => {
				const streamedMessages = streamedCheckpointMessagesRef.current;
				const isCurrentStreamGeneration =
					streamedMessages.streamGeneration === checkpointStreamGeneration;
				const blockEditAgentMessageText = getBlockEditAgentMessageText( update );
				if ( isCurrentStreamGeneration && blockEditAgentMessageText ) {
					const message: UIMessage = {
						id: update.status.message?.messageId ?? update.agentMessage?.messageId ?? update.id,
						role: 'agent',
						content: [ { type: 'text', text: blockEditAgentMessageText } ],
						timestamp: Date.now(),
						archived: false,
						showIcon: true,
					};
					streamedMessages.pendingByTaskId.set( update.id, message );
				}

				const isTerminal =
					update.final === true ||
					[ 'completed', 'canceled', 'failed' ].includes( update.status.state );
				if ( isTerminal && isCurrentStreamGeneration ) {
					const finalMessageId = update.status.message?.messageId ?? update.agentMessage?.messageId;
					const completedSuccessfully =
						update.status.state === 'completed' ||
						( update.final === true && ! [ 'canceled', 'failed' ].includes( update.status.state ) );
					const checkpointMessage = streamedMessages.pendingByTaskId.get( update.id );
					const regeneratingMessageId = streamedMessages.regeneratingMessageId;
					if ( completedSuccessfully && regeneratingMessageId ) {
						streamedMessages.byFinalMessageId.delete( regeneratingMessageId );
						streamedMessages.liveFinalMessageIds.delete( regeneratingMessageId );
					}
					if ( finalMessageId && completedSuccessfully && checkpointMessage ) {
						streamedMessages.byFinalMessageId.set( finalMessageId, checkpointMessage );
						streamedMessages.liveFinalMessageIds.add( finalMessageId );
					} else if ( completedSuccessfully && regeneratingMessageId ) {
						if ( finalMessageId ) {
							streamedMessages.byFinalMessageId.delete( finalMessageId );
							streamedMessages.liveFinalMessageIds.delete( finalMessageId );
						}
					}
					streamedMessages.pendingByTaskId.delete( update.id );
					streamedMessages.regeneratingMessageId = undefined;
				}

				await onTaskUpdate?.( update );
			},
		};
	}, [ agentConfig, checkpointStreamGeneration ] );

	const {
		addMessage,
		messages,
		suggestions,
		isProcessing,
		error,
		loadMessages,
		onSubmit,
		abortCurrentRequest,
		clearSuggestions,
		registerSuggestions,
		registerMessageActions,
		getRegenerateHandler,
		progressMessage,
	} = useAgentChat( agentChatConfig! );
	const messagesRef = useRef( messages );
	const getTraceIdForMessage = useAgentTraceIds( agentConfig );
	const previousMessagesRef = useRef( messages );
	const showComponentOrderRef = useRef< Map< string, number > >( new Map() );
	const nextShowComponentOrderRef = useRef( 0 );
	const wasProcessingRef = useRef( isProcessing );
	messagesRef.current = messages;

	// Stop a request the moment the canvas it was made for goes away. The guard in
	// `load-external-providers` would refuse the eventual write anyway, but only
	// once the model got there — the user would sit and watch a request run against
	// a page they have already left.
	//
	// Driven by the editor store rather than a host event: AM runs in the same
	// realm as the editor, so `useSelect` is the whole signal. It lands a tick
	// later than a synchronous listener would, which is why `blockCurrentRequest()`
	// below is not optional — the guard is what actually stops the write.
	useEffect( () => {
		// Keyed off the live move rather than `getBlockingMove()`: a request already
		// blocked would otherwise abort again on every later canvas change.
		if ( ! isCanvasWritingAgent( agentConfig?.agentId ) || ! isProcessing || ! getCanvasMove() ) {
			return;
		}

		// Blocked as well as aborted: an abort that loses the race to an in-flight
		// tool call must not let that call land on the new page.
		blockCurrentRequest();
		abortCurrentRequest();

		recordAgentsManagerTracksEvent( 'calypso_agents_manager_editor_canvas_move_request_aborted', {
			agent_id: agentConfig?.agentId,
		} );

		// Say why, or the reply just stops mid-sentence and reads as a failure.
		// UI-only: the message carries an id the agent's client history does not
		// have, so `filterUiOnlyMessages` keeps it on screen and it is never sent
		// back to the server as conversation history.
		addMessage( {
			id: `canvas-move-abort-${ generateUUID() }`,
			role: 'agent',
			content: [
				{
					type: 'text',
					text: __(
						'You navigated away from that page, so I stopped the request before it changed the wrong one. Open the page you want and ask again.',
						__i18n_text_domain__
					),
				},
			],
			timestamp: Date.now(),
			archived: false,
			showIcon: true,
		} );
	}, [ agentConfig?.agentId, canvasKey, isProcessing, abortCurrentRequest, addMessage ] );

	// Drop all retained placeholders, keeping the map reference stable when
	// already empty so no re-render is triggered.
	const clearRetainedShowComponentMessages = useCallback( () => {
		setRetainedShowComponentMessages( ( previousRetainedMessages ) =>
			previousRetainedMessages.size > 0 ? new Map() : previousRetainedMessages
		);
	}, [] );

	// A regeneration is finished once its streaming turn settles — either the new
	// response arrives or an error restores the previous one. Re-enable component
	// retention then so transient drops on later turns are covered again.
	useEffect( () => {
		const wasProcessing = wasProcessingRef.current;
		wasProcessingRef.current = isProcessing;
		if ( isRegenerating && wasProcessing && ! isProcessing ) {
			setIsRegenerating( false );
		}
	}, [ isProcessing, isRegenerating ] );

	// While a regeneration runs, the component being regenerated is deliberately
	// dropped from the live messages (Agenttic sends `preserveUiOnlyMessages:
	// false`), so retention must not resurrect the old picker as a stale copy.
	const handleRegenerate = useCallback(
		( message?: UIMessage ) => {
			const handler = getRegenerateHandler?.( message );
			if ( ! handler ) {
				return handler;
			}

			return async () => {
				setIsRegenerating( true );
				streamedCheckpointMessagesRef.current.pendingByTaskId.clear();
				streamedCheckpointMessagesRef.current.regeneratingMessageId = message?.id;
				// Drop any retained placeholders up front; the turn is being
				// rewound, so a leftover picker would otherwise reappear once
				// regeneration settles if the new response omits the component.
				clearRetainedShowComponentMessages();
				// A regeneration is a fresh dispatch that rebinds via
				// `getClientContext()` on its own outbound message, so it starts a
				// new request for the binding too — carrying a previous request's
				// block into it would refuse writes the new canvas is bound to.
				startNewUserRequest();
				try {
					await handler();
				} finally {
					streamedCheckpointMessagesRef.current.regeneratingMessageId = undefined;
				}
			};
		},
		[ clearRetainedShowComponentMessages, getRegenerateHandler ]
	);

	const getShowComponentOrder = useCallback( ( message: UIMessage ): number | undefined => {
		const identity = getShowComponentIdentity( message );
		if ( ! identity ) {
			return undefined;
		}

		const existingOrder = showComponentOrderRef.current.get( identity );
		if ( existingOrder !== undefined ) {
			return existingOrder;
		}

		const nextOrder = nextShowComponentOrderRef.current++;
		showComponentOrderRef.current.set( identity, nextOrder );
		return nextOrder;
	}, [] );

	useEffect( () => {
		const previousMessages = previousMessagesRef.current;

		// A full history replacement (server hydration, clearing the chat) swaps
		// every message id at once. Nothing in it was transiently dropped, and
		// the same picker can carry a different identity in loaded history than
		// it did live — retaining across the swap would show it as a duplicate.
		const previousMessageIds = new Set( previousMessages.map( ( message ) => message.id ) );
		const isHistoryReplaced =
			previousMessages.length > 0 &&
			! messages.some( ( message ) => previousMessageIds.has( message.id ) );

		// While regenerating, the dropped component is being replaced, not lost —
		// don't retain it either. Keep the ref current so the next run compares
		// against the latest messages.
		if ( isRegenerating || isHistoryReplaced ) {
			if ( isHistoryReplaced ) {
				clearRetainedShowComponentMessages();
			}
			previousMessagesRef.current = messages;
			return;
		}

		messages.filter( isShowComponentMessage ).forEach( getShowComponentOrder );

		const currentShowComponentIdentities = new Set(
			messages.filter( isShowComponentMessage ).map( getShowComponentIdentity ).filter( Boolean )
		);
		const retainedCandidates = previousMessages.filter( ( previousMessage ) => {
			const identity = getShowComponentIdentity( previousMessage );
			return !! identity && ! currentShowComponentIdentities.has( identity );
		} );

		if ( retainedCandidates.length > 0 ) {
			setRetainedShowComponentMessages( ( previousRetainedMessages ) => {
				const nextRetainedMessages = new Map( previousRetainedMessages );
				let changed = false;

				for ( const message of retainedCandidates ) {
					const identity = getShowComponentIdentity( message );
					// One placeholder per identity, so a component that drops and
					// returns refreshes in place instead of stacking another copy.
					const retainedId = `retained-${ identity }`;
					if ( ! nextRetainedMessages.has( retainedId ) ) {
						nextRetainedMessages.set( retainedId, { ...message, id: retainedId } );
						changed = true;
					}
				}

				return changed ? nextRetainedMessages : previousRetainedMessages;
			} );
		}

		previousMessagesRef.current = messages;
	}, [ clearRetainedShowComponentMessages, getShowComponentOrder, messages, isRegenerating ] );

	// Reader-chat sessions are short (usually < 50 messages) — don't waste
	// time paginating 10 pages deep. One page covers typical use.
	const isReaderChat = isReaderChatAgent( agentConfig?.agentId );
	const shouldLoadConversation =
		! isReaderChat || ( ! hasUserSentMessage && messages.length === 0 && ! isProcessing );
	const chatError = isReaderChat
		? getReaderChatErrorMessage( error )
		: getOrchestratorErrorMessage( error );

	// Resume the conversation after a `wp-admin-navigate` full page reload;
	// while such a resume is pending, hydration below must not replace the
	// client-held history (see the hook's docblock).
	const { hadParkedNavigation, flushPendingNavigation } = useNavigationContinuation( {
		isProcessing,
		sendToolResult: async ( params ) => {
			await onSubmit( params.message, {
				type: 'tool_result',
				toolCallId: params.toolCallId,
				toolId: params.toolId,
				sessionId: params.sessionId,
			} );
		},
	} );

	const { isLoading: isLoadingConversation, isAwaitingReply } = useConversation( {
		maxPages: isReaderChat ? 1 : 10,
		enabled: shouldLoadConversation,
		// Poll for a reply to a question sent before this page loaded, unless the
		// merchant has taken over the conversation in this tab.
		refetchWhileAwaitingReply: ! hasUserSentMessage && ! isProcessing,
		onSuccess: ( loadedMessages, serverSessionId ) => {
			if ( isReaderChat && ( hasUserSentMessage || messages.length > 0 || isProcessing ) ) {
				return;
			}

			// The agent may have been discarded (e.g. a site switch) while this
			// fetch was in flight — its result belongs to the previous scope.
			const agentManager = getAgentManager();
			if ( ! agentManager.hasAgent( agentConfig!.agentId ) ) {
				return;
			}

			loadedMessages.forEach( ( message ) => {
				const checkpointMessage = streamedCheckpointMessagesRef.current.byFinalMessageId.get(
					message.messageId
				) ?? {
					id: message.messageId,
					role: message.role,
					content: message.parts
						.filter( ( part ) => part.type === 'text' )
						.map( ( part ) => ( { type: 'text', text: part.text } ) ),
				};
				const checkpointId = getCheckpointIdForMessage( checkpointMessage );
				const isCurrentLiveMessage = streamedCheckpointMessagesRef.current.liveFinalMessageIds.has(
					message.messageId
				);
				if ( checkpointId && ! isCurrentLiveMessage ) {
					invalidateCheckpointAction( checkpointId );
				}
			} );

			// With a resume pending, the tab's own store holds the conversation
			// the parked call lives in — hydrate only if its restore came up
			// empty (e.g. a quota-failed persist). Read the manager, not React
			// state: `messages` stays empty until the async agent init lands.
			if (
				! hadParkedNavigation ||
				agentManager.getConversationHistory( agentConfig!.agentId ).length === 0
			) {
				loadMessages( loadedMessages );
			}

			// Make sure future messages go to the right session
			agentManager.updateSessionId( agentConfig!.agentId, serverSessionId );

			// Persist the server's canonical ID as this tab's session through the
			// config's callback, so it writes under the site the config was
			// created for.
			if ( agentConfig!.sessionId !== serverSessionId ) {
				agentConfig!.onSessionIdChange?.( serverSessionId );
			}
		},
	} );

	// Use dynamic suggestions from the external provider (e.g., Big Sky block-based suggestions)
	const maxDynamicSuggestions = isDocked ? undefined : 3;
	const dynamicSuggestions = useSuggestions?.( maxDynamicSuggestions );
	const dynamicSuggestionsList = dynamicSuggestions?.suggestions ?? [];
	const replaceEmptyViewSuggestions = dynamicSuggestions?.replaceEmptyViewSuggestions === true;
	const dynamicSuggestionsKey = JSON.stringify(
		dynamicSuggestionsList.map( ( s ) => [ s.id, s.label, s.prompt ] )
	);
	const contextualSuggestionIds = useMemo(
		() =>
			replaceEmptyViewSuggestions
				? new Set( dynamicSuggestionsList.map( ( suggestion ) => suggestion.id ) )
				: new Set< string >(),
		// Track suggestion content rather than an unstable provider array.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ dynamicSuggestionsKey, replaceEmptyViewSuggestions ]
	);

	// Register dynamic suggestions whenever they change
	useEffect( () => {
		if ( dynamicSuggestionsList.length > 0 ) {
			registerSuggestions?.( dynamicSuggestionsList );
		} else {
			// Clear suggestions when there are none
			clearSuggestions?.();
		}
		// Track suggestion content, not array identity. Some merged providers
		// return a fresh empty array on each render.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ dynamicSuggestionsKey, registerSuggestions, clearSuggestions ] );

	// Register an "Undo" action on agent messages with checkpoints.
	const checkpoint = useCheckpoint?.();
	const checkpointRef = useRef( checkpoint );
	checkpointRef.current = checkpoint;
	const handleCheckpointActionPendingChange = useCallback(
		( checkpointId: string, isPending: boolean, completedAction?: 'undo' | 'redo' ) => {
			if ( isPending ) {
				completedInlineUndoCheckpointIdRef.current = undefined;
				pendingCheckpointActionIdsRef.current.add( checkpointId );
				return;
			}

			if ( pendingCheckpointActionIdsRef.current.delete( checkpointId ) ) {
				let hasEditorRedoNow = false;
				try {
					const editor = selectDataStore( 'core/editor' ) as {
						hasEditorRedo?: () => boolean;
					};
					hasEditorRedoNow = editor?.hasEditorRedo?.() ?? false;
				} catch {
					// The editor store is optional outside Gutenberg.
				}
				// The provider can settle after history renders but before the history effect processes it.
				completedInlineUndoCheckpointIdRef.current =
					completedAction === 'undo' && ! previousHasEditorRedoRef.current && hasEditorRedoNow
						? checkpointId
						: undefined;
				setCheckpointActionRevision( ( revision ) => revision + 1 );
			}
		},
		[]
	);
	const handleCheckpointActionInvalidated = useCallback( () => {
		setCheckpointActionRevision( ( revision ) => revision + 1 );
	}, [] );
	const checkpointIdsByTurn = useMemo( () => {
		// Session promotion changes the ref-backed messages without changing the raw message list.
		void checkpointSessionIdentity;
		const latestUserMessageIndex = getLatestUserMessageIndex( messages );
		const current = new Set< string >();
		const userMessageIdByCheckpointId = new Map< string, string | undefined >();
		let userMessageId: string | undefined;

		messages.forEach( ( message, index ) => {
			if ( message.role === 'user' && ! isContextOnlyMessage( message ) ) {
				userMessageId = message.id;
			}
			const checkpointMessage =
				streamedCheckpointMessagesRef.current.byFinalMessageId.get( message.id ) ?? message;
			const checkpointId = getCheckpointIdForMessage( checkpointMessage );
			if ( checkpointId ) {
				userMessageIdByCheckpointId.set( checkpointId, userMessageId );
			}
			if ( checkpointId && index > latestUserMessageIndex ) {
				current.add( checkpointId );
			}
		} );

		return {
			current,
			userMessageIdByCheckpointId,
			userMessageId: messages[ latestUserMessageIndex ]?.id,
		};
	}, [ checkpointSessionIdentity, messages ] );
	const nativeUndoInvalidatedTurnRef = useRef(
		hasEditorRedo ? checkpointIdsByTurn.userMessageId : undefined
	);
	const [ nativeUndoRevertedTurn, setNativeUndoRevertedTurn ] = useState< string | undefined >();
	const pendingNativeUndoTurnRef = useRef< string | undefined >( undefined );
	const pendingNativeRedoTurnRef = useRef< string | undefined >( undefined );
	const supportsCheckpointSwap =
		typeof checkpoint?.canSwapCheckpoint === 'function' &&
		typeof checkpoint.swapCheckpoint === 'function';
	const isWatchingNativeHistory =
		!! checkpointIdsByTurn.userMessageId &&
		( nativeUndoRevertedTurn === checkpointIdsByTurn.userMessageId ||
			pendingNativeUndoTurnRef.current === checkpointIdsByTurn.userMessageId );
	const hasPendingCheckpointSwap =
		supportsCheckpointSwap &&
		( isWatchingNativeHistory ||
			[ ...checkpointIdsByTurn.current ].some(
				( checkpointId ) =>
					! sourceDriftInvalidatedCheckpointIds.has( checkpointId ) &&
					! isCheckpointActionInvalidated( checkpointId )
			) );
	const checkpointEditorBlocks = useSelect(
		( select ) => {
			if ( ! hasPendingCheckpointSwap ) {
				return undefined;
			}

			try {
				const blockEditor = select( 'core/block-editor' ) as { getBlocks?: () => unknown[] };
				return blockEditor?.getBlocks?.();
			} catch {
				return undefined;
			}
		},
		[ checkpointIdsByTurn, checkpointSessionIdentity, hasPendingCheckpointSwap, useCheckpoint ]
	);
	useEffect( () => {
		void checkpointActionRevision;
		void checkpointEditorBlocks;
		void checkpointSessionIdentity;
		void useCheckpoint;
		const currentCheckpoint = checkpointRef.current;
		const nextInvalidatedCheckpointIds = new Set(
			[ ...sourceDriftInvalidatedCheckpointIds ].filter( ( checkpointId ) =>
				checkpointIdsByTurn.current.has( checkpointId )
			)
		);
		let didChange = nextInvalidatedCheckpointIds.size !== sourceDriftInvalidatedCheckpointIds.size;
		const shouldDeferSourceDriftInvalidation =
			hasEditorRedo &&
			!! checkpointIdsByTurn.userMessageId &&
			( previousHasEditorRedoRef.current === false ||
				pendingNativeUndoTurnRef.current === checkpointIdsByTurn.userMessageId ||
				nativeUndoInvalidatedTurnRef.current === checkpointIdsByTurn.userMessageId );
		if ( supportsCheckpointSwap && currentCheckpoint ) {
			for ( const checkpointId of checkpointIdsByTurn.current ) {
				if (
					! shouldDeferSourceDriftInvalidation &&
					! nextInvalidatedCheckpointIds.has( checkpointId ) &&
					! pendingCheckpointActionIdsRef.current.has( checkpointId ) &&
					currentCheckpoint.canSwapCheckpoint?.( checkpointId ) === false
				) {
					nextInvalidatedCheckpointIds.add( checkpointId );
					invalidateCheckpointAction( checkpointId );
					didChange = true;
				}
			}
		}
		if ( didChange ) {
			setSourceDriftInvalidatedCheckpointIds( nextInvalidatedCheckpointIds );
		}
	}, [
		checkpointActionRevision,
		checkpointEditorBlocks,
		checkpointIdsByTurn,
		checkpointSessionIdentity,
		hasEditorRedo,
		sourceDriftInvalidatedCheckpointIds,
		supportsCheckpointSwap,
		useCheckpoint,
	] );
	const getCheckpointActionsForMessage = useCheckpointAction(
		registerMessageActions,
		checkpoint,
		( checkpointId ) => {
			if ( sourceDriftInvalidatedCheckpointIds.has( checkpointId ) ) {
				return 'hidden';
			}
			const checkpointUserMessageId =
				checkpointIdsByTurn.userMessageIdByCheckpointId.get( checkpointId );
			if (
				checkpointUserMessageId &&
				( pendingNativeUndoTurnRef.current === checkpointUserMessageId ||
					nativeUndoInvalidatedTurnRef.current === checkpointUserMessageId )
			) {
				return 'hidden';
			}
			if ( ! checkpointIdsByTurn.current.has( checkpointId ) ) {
				return 'disabled';
			}
			if ( hasEditorRedo && checkpointRef.current?.canSwapCheckpoint?.( checkpointId ) !== true ) {
				return 'hidden';
			}

			return 'enabled';
		},
		handleCheckpointActionPendingChange,
		handleCheckpointActionInvalidated
	);
	const previousCheckpointEditorBlocksRef = useRef( checkpointEditorBlocks );

	useEffect( () => {
		// Native history can notify before block content; a later or combined block change confirms Undo.
		const didCheckpointEditorBlocksChange =
			previousCheckpointEditorBlocksRef.current !== undefined &&
			checkpointEditorBlocks !== undefined &&
			previousCheckpointEditorBlocksRef.current !== checkpointEditorBlocks;
		previousCheckpointEditorBlocksRef.current = checkpointEditorBlocks;
		const currentCheckpointIds = [ ...checkpointIdsByTurn.current ];
		const latestCheckpointId = currentCheckpointIds[ currentCheckpointIds.length - 1 ];
		const latestCheckpointCanSwap = latestCheckpointId
			? checkpointRef.current?.canSwapCheckpoint?.( latestCheckpointId )
			: undefined;
		const hasPendingCheckpointAction = currentCheckpointIds.some( ( checkpointId ) =>
			pendingCheckpointActionIdsRef.current.has( checkpointId )
		);
		let didInvalidateCheckpointAction = false;
		const didEditorRedoBecomeAvailable =
			previousHasEditorRedoRef.current === false && hasEditorRedo;
		const didEditorRedoBecomeUnavailable =
			previousHasEditorRedoRef.current === true && ! hasEditorRedo;
		const didInlineUndoCreateEditorRedo =
			didEditorRedoBecomeAvailable &&
			completedInlineUndoCheckpointIdRef.current !== undefined &&
			checkpointIdsByTurn.current.has( completedInlineUndoCheckpointIdRef.current );
		const wasPendingNativeUndo =
			!! checkpointIdsByTurn.userMessageId &&
			pendingNativeUndoTurnRef.current === checkpointIdsByTurn.userMessageId;
		let shouldConfirmNativeUndo = false;
		let didCheckpointActionAvailabilityChange = false;
		const supersededPendingNativeUndoTurn =
			pendingNativeUndoTurnRef.current &&
			pendingNativeUndoTurnRef.current !== checkpointIdsByTurn.userMessageId
				? pendingNativeUndoTurnRef.current
				: undefined;
		if ( supersededPendingNativeUndoTurn ) {
			pendingNativeUndoTurnRef.current = undefined;
			nativeUndoInvalidatedTurnRef.current = supersededPendingNativeUndoTurn;
			didCheckpointActionAvailabilityChange = true;
			for ( const [
				checkpointId,
				userMessageId,
			] of checkpointIdsByTurn.userMessageIdByCheckpointId ) {
				if (
					userMessageId === supersededPendingNativeUndoTurn &&
					! isCheckpointActionInvalidated( checkpointId )
				) {
					invalidateCheckpointAction( checkpointId );
					didInvalidateCheckpointAction = true;
				}
			}
		}
		if ( hasPendingCheckpointAction ) {
			if ( pendingNativeUndoTurnRef.current !== undefined ) {
				didCheckpointActionAvailabilityChange = true;
			}
			pendingNativeUndoTurnRef.current = undefined;
			pendingNativeRedoTurnRef.current = undefined;
		}
		if ( didEditorRedoBecomeAvailable ) {
			completedInlineUndoCheckpointIdRef.current = undefined;
			pendingNativeRedoTurnRef.current = undefined;
			if ( pendingNativeUndoTurnRef.current !== undefined ) {
				didCheckpointActionAvailabilityChange = true;
			}
			pendingNativeUndoTurnRef.current = undefined;
			if (
				! didInlineUndoCreateEditorRedo &&
				! hasPendingCheckpointAction &&
				latestCheckpointId &&
				checkpointIdsByTurn.userMessageId
			) {
				if ( didCheckpointEditorBlocksChange && latestCheckpointCanSwap === false ) {
					shouldConfirmNativeUndo = true;
				} else if ( latestCheckpointCanSwap !== undefined ) {
					pendingNativeUndoTurnRef.current = checkpointIdsByTurn.userMessageId;
					didCheckpointActionAvailabilityChange = true;
				} else {
					nativeUndoInvalidatedTurnRef.current = checkpointIdsByTurn.userMessageId;
				}
			} else if (
				! didInlineUndoCreateEditorRedo &&
				! hasPendingCheckpointAction &&
				latestCheckpointCanSwap === undefined
			) {
				nativeUndoInvalidatedTurnRef.current = checkpointIdsByTurn.userMessageId;
			}
		}
		if (
			hasEditorRedo &&
			! hasPendingCheckpointAction &&
			didCheckpointEditorBlocksChange &&
			latestCheckpointId &&
			checkpointIdsByTurn.userMessageId &&
			wasPendingNativeUndo
		) {
			pendingNativeUndoTurnRef.current = undefined;
			didCheckpointActionAvailabilityChange = true;
			if ( latestCheckpointCanSwap === false ) {
				shouldConfirmNativeUndo = true;
			}
		}
		if ( shouldConfirmNativeUndo && latestCheckpointId && checkpointIdsByTurn.userMessageId ) {
			nativeUndoInvalidatedTurnRef.current = checkpointIdsByTurn.userMessageId;
			if (
				! sourceDriftInvalidatedCheckpointIds.has( latestCheckpointId ) &&
				! isCheckpointActionInvalidated( latestCheckpointId )
			) {
				if ( setCheckpointActionReverted( latestCheckpointId, true ) ) {
					setCheckpointActionRevision( ( revision ) => revision + 1 );
				}
				setNativeUndoRevertedTurn( checkpointIdsByTurn.userMessageId );
			}
		}
		if (
			didEditorRedoBecomeUnavailable &&
			checkpointIdsByTurn.userMessageId &&
			nativeUndoRevertedTurn === checkpointIdsByTurn.userMessageId
		) {
			// Exact checkpoint content confirms Updated, even when the user recreates it manually.
			pendingNativeRedoTurnRef.current = checkpointIdsByTurn.userMessageId;
		}
		if ( didEditorRedoBecomeUnavailable ) {
			if ( pendingNativeUndoTurnRef.current !== undefined ) {
				didCheckpointActionAvailabilityChange = true;
			}
			pendingNativeUndoTurnRef.current = undefined;
		}
		previousHasEditorRedoRef.current = hasEditorRedo;

		if (
			! hasEditorRedo &&
			latestCheckpointId &&
			checkpointIdsByTurn.userMessageId &&
			pendingNativeRedoTurnRef.current === checkpointIdsByTurn.userMessageId &&
			checkpointRef.current?.canSwapCheckpoint?.( latestCheckpointId ) === true
		) {
			if ( setCheckpointActionReverted( latestCheckpointId, false ) ) {
				setCheckpointActionRevision( ( revision ) => revision + 1 );
			}
			setNativeUndoRevertedTurn( undefined );
			pendingNativeRedoTurnRef.current = undefined;
		}

		for ( const checkpointId of currentCheckpointIds ) {
			if (
				checkpointIdsByTurn.userMessageId &&
				nativeUndoInvalidatedTurnRef.current === checkpointIdsByTurn.userMessageId &&
				! isCheckpointActionInvalidated( checkpointId )
			) {
				invalidateCheckpointAction( checkpointId );
				didInvalidateCheckpointAction = true;
			}
		}
		if ( didInvalidateCheckpointAction || didCheckpointActionAvailabilityChange ) {
			setCheckpointActionRevision( ( revision ) => revision + 1 );
		}
	}, [
		checkpointEditorBlocks,
		checkpointIdsByTurn,
		hasEditorRedo,
		nativeUndoRevertedTurn,
		sourceDriftInvalidatedCheckpointIds,
	] );

	// TODO (ability-migration): Remove once the last checkpoint-writing Big Sky
	// ability migrates. Keeps the provider checkpoint store reachable for the
	// `restore-checkpoint` delegation while Big Sky still writes checkpoints.
	useEffect( () => {
		setProviderCheckpoints( checkpoint );
		return () => setProviderCheckpoints( undefined );
	}, [ checkpoint ] );

	// Register thumbs-up/down feedback actions on agent messages.
	const { showFeedbackInput, submitFeedbackText, resetFeedback, getFeedbackActionsForMessage } =
		useFeedbackAction( {
			registerMessageActions,
			messages,
			getTraceIdForMessage,
		} );

	// Add Agenttic's built-in regenerate action on agent messages for providers
	// that opt in. Computed during render alongside copy/feedback so the icon
	// appears in the same paint rather than a commit later.
	const getRegenerateActionsForMessage = useRegenerateAction( {
		enabled: capabilities?.supportsRegenerateAction === true,
		getRegenerateHandler: handleRegenerate,
	} );

	// Add a "Copy" action on plain-text agent messages.
	const getCopyActionsForMessage = useCopyAction();

	// Register a "Sources" action on agent messages with sources data.
	useSourcesAction( registerMessageActions, ! isReaderChat );

	const imageUploadResult = useImageUpload();
	// Reader chat is a public blog frontend — visitors can't upload media.
	const imageUpload = isReaderChat ? undefined : imageUploadResult;
	const pendingImages = imageUpload?.pendingImages || [];
	const uploadImagesToWordPress = imageUpload?.uploadImagesToWordPress;
	const isUploadingImages = imageUpload?.isUploadingImages ?? false;
	const [ uploadError, setUploadError ] = useState< string | null >( null );

	const setChatInput = useCallback( ( value: string ) => {
		if ( typeof value !== 'string' ) {
			return;
		}

		setInputValue( value );

		const textarea = document.querySelector< HTMLTextAreaElement >(
			'.agenttic [data-slot="chat-input"] [data-slot="textarea"]'
		);
		if ( textarea ) {
			textarea.focus();
			textarea.setSelectionRange( value.length, value.length );
		}
	}, [] );

	// Whether the last `onSubmitWithImages` call actually dispatched — dropped,
	// aborted, and failed sends deliberately leave the composer intact.
	const submitDispatchedRef = useRef( false );
	// Synchronous lock for the upload phase: same-tick re-entry (double-click,
	// programmatic submit) lands before the `isUploadingImages` state does.
	const isUploadingRef = useRef( false );

	const onSubmitWithImages = useCallback(
		async ( message: string ) => {
			submitDispatchedRef.current = false;

			// The composer is committed while a batch uploads — drop re-entrant
			// sends (suggestion clicks, programmatic submits) instead of
			// interleaving a second message.
			if ( isUploadingRef.current || isUploadingImages ) {
				return;
			}

			setHasUserSentMessage( true );
			setUploadError( null );

			recordBigSkyTracksEvent( 'jetpack_big_sky_chat_input_send_message', {
				message_length: message?.length || 0,
				has_images: pendingImages.length > 0,
			} );

			let imageData;
			if ( pendingImages.length > 0 && uploadImagesToWordPress ) {
				isUploadingRef.current = true;

				try {
					// Agenttic clears the (controlled) input on submit. When the message
					// came from the composer, keep it visible while images upload: wait a
					// microtask so the restore lands after that clear, and re-place the
					// caret at the end (the clear leaves it at 0). Suggestion-driven and
					// programmatic submits leave any draft alone. Agenttic dispatches the
					// trimmed draft, hence the trim-compare.
					if ( inputValue.trim() === message ) {
						await Promise.resolve();
						setChatInput( message );
					}

					const mediaObjects = await uploadImagesToWordPress();

					recordBigSkyTracksEvent( 'jetpack_big_sky_file_upload_success', {
						count: mediaObjects.length,
					} );

					imageData = mediaObjects.map( ( media ) => ( {
						url: media.url,
						metadata: {
							id: media.id, // WordPress attachment ID
							title: media.title,
							fileName: media.fileName,
							fileType: media.fileType,
							fileSize: media.fileSize,
							dimensions: media.dimensions,
							uploadDate: media.uploadDate,
							alt: media.alt,
							caption: media.caption,
						},
					} ) );
				} catch ( caughtError ) {
					// Stop during upload: the previews are restored and a
					// composer-typed message stays in the input — the composer is
					// back to its pre-send state.
					if ( caughtError instanceof Error && caughtError.name === 'AbortError' ) {
						recordBigSkyTracksEvent( 'jetpack_big_sky_file_upload_cancel', {
							count: pendingImages.length,
						} );
						return;
					}

					recordBigSkyTracksEvent( 'jetpack_big_sky_file_upload_error', {
						count: pendingImages.length,
					} );
					setUploadError(
						__( 'Failed to upload images. Please try again.', __i18n_text_domain__ )
					);
					return;
				} finally {
					isUploadingRef.current = false;
				}

				// The message dispatches now — clear the input only when it still
				// holds this message (a suggestion-driven send may have left an
				// unrelated draft in it).
				setInputValue( ( currentValue ) => ( currentValue === message ? '' : currentValue ) );
			}

			// A new user message is a new intent, so it starts unbound and unblocked:
			// the previous turn's canvas must not judge this one (the effect above
			// would abort it on sight if the user has navigated since), and any block
			// that turn left behind must not refuse this one's writes.
			//
			// This sits on the dispatch path rather than in `submitChatMessage` — the
			// composer calls this callback directly, and the sends above that bail out
			// early must not disturb a binding that still belongs to a running request.
			startNewUserRequest();

			submitDispatchedRef.current = true;
			try {
				// Answer a still-parked `wp-admin-navigate` call before this
				// message goes out, so it meets an already-truthful conversation.
				// A fast no-op otherwise, and it never throws.
				await flushPendingNavigation();

				// Images dispatch via agenttic's `imageUrls` option — the resulting
				// `FilePart`s persist in conversation history with their metadata.
				await ( imageData ? onSubmit( message, { imageUrls: imageData } ) : onSubmit( message ) );
			} catch {
				// A rejected dispatch already surfaces via agenttic's error state;
				// put the message back (unless a newer draft replaced it) for a retry.
				submitDispatchedRef.current = false;
				setInputValue( ( currentValue ) => ( currentValue === '' ? message : currentValue ) );
				return;
			}

			consumeNextMessageExternalContextEntries();
		},
		[
			flushPendingNavigation,
			inputValue,
			isUploadingImages,
			onSubmit,
			pendingImages.length,
			setChatInput,
			uploadImagesToWordPress,
		]
	);

	const handleAbort = useCallback( () => {
		// `abortUpload` reports whether it stopped an in-flight batch, so a stop
		// that lands just after the upload settles still aborts the agent request.
		if ( imageUpload?.abortUpload?.() ) {
			return;
		}
		abortCurrentRequest();
	}, [ abortCurrentRequest, imageUpload ] );

	const submitChatMessage = useCallback(
		async ( message?: string ) => {
			const submittedMessage = typeof message === 'string' ? message : inputValue;

			if ( ! submittedMessage.trim() ) {
				return;
			}

			await onSubmitWithImages( submittedMessage );
			// Clear only a dispatched message — an aborted or failed send keeps
			// the composer intact, and the user may have typed a new draft.
			if ( submitDispatchedRef.current ) {
				setInputValue( ( currentValue ) =>
					currentValue === submittedMessage ? '' : currentValue
				);
			}
		},
		[ inputValue, onSubmitWithImages ]
	);

	useRegisterCustomActions( { setChatInput, submitChatMessage } );

	const handleContextCardAction = useCallback(
		( card: ExternalContextCard, action: ExternalContextCardAction ) => {
			if ( ! action.prompt ) {
				return;
			}

			// Remove the card immediately so the user gets instant collapse feedback.
			// For 'submit' actions the linked context entry stays until the request
			// is sent — `consumeNextMessageExternalContextEntries` runs after the
			// awaited submit and clears it then.
			removeExternalContextCard( card.id );

			if ( action.type === 'submit' ) {
				void submitChatMessage( action.prompt );
				return;
			}

			setChatInput( action.prompt );
		},
		[ setChatInput, submitChatMessage ]
	);

	const dismissContextCard = useCallback( ( card: ExternalContextCard ) => {
		removeExternalContextCard( card.id );
		card.contextEntryIds?.forEach( ( entryId ) => {
			removeExternalContextEntry( entryId );
		} );
	}, [] );

	// Listen for inline suggestion clicks dispatched by external providers or the Agenttic bridge below.
	useEffect( () => {
		const handleInlineSuggestionClick = ( event: Event ) => {
			const { value, autoSubmit } = ( event as CustomEvent ).detail;
			// Auto-submit suggestions are already sent and the input cleared by the
			// AgentUI; repopulating it here would leave the prompt stuck in the composer.
			if ( value && ! autoSubmit ) {
				const inputValue = value.endsWith( ' ' ) ? value : `${ value } `;
				setInputValue( inputValue );

				// Focus the textarea and set cursor position to end
				const textarea = document.querySelector< HTMLTextAreaElement >(
					'.agenttic .Textarea-module_textarea'
				);
				if ( textarea ) {
					textarea.focus();
					textarea.setSelectionRange( inputValue.length, inputValue.length );
				}
			}
		};

		window.addEventListener( 'big-sky-inline-suggestion-click', handleInlineSuggestionClick );
		return () => {
			window.removeEventListener( 'big-sky-inline-suggestion-click', handleInlineSuggestionClick );
		};
	}, [] );

	const renderedSuggestionsRef = useRef< Suggestion[] >( [] );

	const handleSuggestionClick = useCallback(
		( suggestion: Suggestion | string, availableSuggestions?: Suggestion[] ) => {
			const value =
				typeof suggestion === 'string' ? suggestion : suggestion.prompt ?? suggestion.label;

			const autoSubmit = typeof suggestion !== 'string' && !! suggestion.autoSubmit;
			const suggestionId = typeof suggestion !== 'string' ? suggestion.id : undefined;
			// A click routed through Agenttic's own container reports the footer list,
			// which is empty while the chips live in the empty view.
			const knownSuggestions = availableSuggestions?.length
				? availableSuggestions
				: renderedSuggestionsRef.current;
			const originalSuggestion =
				typeof suggestion !== 'string'
					? knownSuggestions.find( ( available ) => available.id === suggestion.id )
					: undefined;
			const optionId =
				typeof suggestion !== 'string'
					? getSelectedOptionId( suggestion, originalSuggestion )
					: undefined;
			const blockType =
				typeof suggestion !== 'string' && contextualSuggestionIds.has( suggestion.id )
					? selectedBlockType
					: undefined;

			if ( typeof suggestion !== 'string' ) {
				recordBigSkyTracksEvent( 'jetpack_big_sky_chat_suggestion_click', {
					suggestion_text: suggestion.prompt || '',
					suggestion_id: suggestion.id || '',
					available_suggestions: formatSuggestionIds( knownSuggestions ),
					...( optionId ? { option_id: optionId } : {} ),
					...( blockType ? { block_type: blockType } : {} ),
				} );
			}

			// Always dispatch so click listeners (e.g. the Jetpack sidebar hiding the
			// clicked chip) still fire. `autoSubmit` tells the input listener to skip
			// repopulating the composer, which the AgentUI already submitted and cleared.
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: {
						value,
						autoSubmit,
						...( suggestionId ? { suggestionId } : {} ),
					},
				} )
			);
		},
		[ contextualSuggestionIds, selectedBlockType ]
	);

	// Invoke abilities setup hook to register hook-based abilities that utilize React context.
	// Provides chat action handlers to the external providers' ability setups
	// (Big Sky, jetpack-ai-sidebar) — permanent provider infrastructure. The hook
	// is stable as `OrchestratorChat` only renders after providers have loaded.
	// TODO (ability-migration): After Big Sky's abilities migrate, prune this object to
	// the fields other providers consume (jetpack-ai-sidebar reads only
	// `clearSuggestions` and `isProcessing`) and drop the `BigSkyMessage`
	// conversion.
	useProviderAbilitiesSetup?.( {
		addMessage: ( message: BigSkyMessage ) => {
			// Transform Big Sky message format to `UIMessage` format and add to chat.
			addMessage( convertBigSkyMessageToUIMessage( message ) );
		},
		clearMessages: () => loadMessages( [] ),
		clearSuggestions,
		getAgentManager,
		isProcessing,
		setIsThinking,
		deleteMarkedMessages: ( msgs ) => {
			const deleteDecisions = msgs.map( ( msg ) => {
				const messageFromRequest = msg as Pick< UIMessage, 'id' > &
					Partial< Pick< UIMessage, 'content' > >;
				const fullMessage = messageFromRequest.content
					? ( messageFromRequest as UIMessage )
					: messagesRef.current.find( ( message ) => message.id === msg.id );
				const isShowComponent = !! fullMessage && isShowComponentMessage( fullMessage );

				return {
					id: msg.id,
					foundMessage: !! fullMessage,
					isShowComponent,
					tool: fullMessage ? getToolMessageData( fullMessage ) : undefined,
					shouldDelete: fullMessage ? ! isShowComponent : false,
				};
			} );

			const deletableMessages = msgs.filter(
				( msg ) => deleteDecisions.find( ( decision ) => decision.id === msg.id )?.shouldDelete
			);
			if ( deletableMessages.length === 0 ) {
				return;
			}

			setDeletedMessageIds(
				( prevIds ) => new Set( [ ...prevIds, ...deletableMessages.map( ( msg ) => msg.id ) ] )
			);
		},
		// This ensures the same session ID is used between Big Sky and Calypso agents,
		// so that messages will be stored in the same conversation.
		getSessionId: getTabSessionId,
		setIsBuildingSite,
		setThinkingMessage,
	} );

	useAbilitiesRegistration();

	const displayedMessages = useMemo< AgentsManagerUIMessage[] >( () => {
		// The stable checkpoint getter reads these values through refs.
		void checkpointActionRevision;
		void checkpointSessionIdentity;
		void hasEditorRedo;
		void sourceDriftInvalidatedCheckpointIds;
		let currentMessages: AgentsManagerUIMessage[] = messages;

		// Let the provider rewrite the transcript first, while the messages are
		// still the raw ones. Applied on every render over the whole list, so a
		// message restored from conversation history is presented the same way as
		// one that was just sent.
		if ( transformMessages ) {
			currentMessages = transformMessages( currentMessages );
		}

		currentMessages = currentMessages.filter(
			( message ) =>
				! deletedMessageIds.has( message.id ) &&
				! message.content?.some( ( content ) => content?.text === LOCAL_TOOL_RUNNING_MESSAGE )
		);

		currentMessages.filter( isShowComponentMessage ).forEach( getShowComponentOrder );

		const currentShowComponentIdentities = new Set(
			currentMessages
				.filter( isShowComponentMessage )
				.map( getShowComponentIdentity )
				.filter( Boolean )
		);
		const retainedMessagesToDisplay = [ ...retainedShowComponentMessages.values() ].filter(
			( message ) => {
				const identity = getShowComponentIdentity( message );
				return !! identity && ! currentShowComponentIdentities.has( identity );
			}
		);
		if ( retainedMessagesToDisplay.length > 0 ) {
			retainedMessagesToDisplay.forEach( getShowComponentOrder );
			currentMessages = [ ...currentMessages, ...retainedMessagesToDisplay ].sort(
				( messageA, messageB ) => {
					const orderA = getShowComponentOrder( messageA );
					const orderB = getShowComponentOrder( messageB );

					if ( orderA !== undefined && orderB !== undefined && orderA !== orderB ) {
						return orderA - orderB;
					}

					return ( messageA.timestamp ?? 0 ) - ( messageB.timestamp ?? 0 );
				}
			);
		}

		const checkpointActionsByMessageId = new Map(
			currentMessages.map( ( message ) => [
				message.id,
				getCheckpointActionsForMessage(
					streamedCheckpointMessagesRef.current.byFinalMessageId.get( message.id ) ?? message
				),
			] )
		);
		const latestUserMessageIndex = getLatestUserMessageIndex( currentMessages );
		const supersededCheckpointMessageIds = new Set(
			currentMessages
				.filter(
					( message, messageIndex ) =>
						messageIndex < latestUserMessageIndex &&
						( getCheckpointIdForMessage(
							streamedCheckpointMessagesRef.current.byFinalMessageId.get( message.id ) ?? message
						) !== null ||
							( checkpointActionsByMessageId.get( message.id )?.length ?? 0 ) > 0 ||
							message.actions?.some( ( action ) => action.id === 'checkpoint' ) )
				)
				.map( ( message ) => message.id )
		);

		// Group site-build messages only when needed
		const hasBuildMessages = siteBuildUtils?.hasSiteBuildMessages( currentMessages );

		// Show progress card during styling phase (after structure, dock is visible)
		if ( siteBuildUtils?.groupSiteBuildMessages && ( isBuildingSite || hasBuildMessages ) ) {
			// Show spinner during post-layout workflow (colors, fonts, images)
			currentMessages = siteBuildUtils.groupSiteBuildMessages(
				currentMessages,
				isBuildingSite ? thinkingMessage : null
			);
		}

		currentMessages = convertToolMessagesToComponents( {
			messages: currentMessages,
			getChatComponent,
			currentPostId,
		} );

		const latestAgentMessageId = getLatestAgentMessageId( currentMessages );

		currentMessages = currentMessages.map( ( message ) => {
			const checkpointActions = checkpointActionsByMessageId.get( message.id ) ?? [];
			const hasDisabledCheckpointAction = checkpointActions.some(
				( action ) =>
					action.type === 'component' &&
					action.id === 'checkpoint' &&
					action.componentProps?.disabled === true
			);
			const shouldDisableCheckpointMessage =
				hasDisabledCheckpointAction || supersededCheckpointMessageIds.has( message.id );
			const traceId = getTraceIdForMessage( message.id );
			const messageWithTraceId =
				traceId || shouldDisableCheckpointMessage
					? {
							...message,
							...( traceId && { traceId } ),
							...( shouldDisableCheckpointMessage && { disabled: true } ),
					  }
					: message;

			const directActions = [
				...checkpointActions,
				...getFeedbackActionsForMessage( message ),
				...getCopyActionsForMessage( message ),
				...getRegenerateActionsForMessage( message, {
					isLatestAgentMessage: message.id === latestAgentMessageId,
					isStreaming: isProcessing,
				} ),
			];
			const hasRegisteredCheckpointAction = message.actions?.some(
				( action ) => action.id === 'checkpoint'
			);
			if ( directActions.length === 0 && ! hasRegisteredCheckpointAction ) {
				return messageWithTraceId;
			}

			const existingActions = message.actions?.filter(
				( action ) =>
					action.id !== 'checkpoint' &&
					! action.id.startsWith( 'feedback-' ) &&
					action.id !== 'copy' &&
					action.id !== 'regenerate'
			);

			return {
				...messageWithTraceId,
				actions: [ ...( existingActions ?? [] ), ...directActions ].sort(
					( actionA, actionB ) => ( actionA.order ?? Infinity ) - ( actionB.order ?? Infinity )
				),
			};
		} );

		return currentMessages;
	}, [
		checkpointActionRevision,
		checkpointSessionIdentity,
		currentPostId,
		deletedMessageIds,
		getChatComponent,
		getCopyActionsForMessage,
		getCheckpointActionsForMessage,
		getShowComponentOrder,
		getFeedbackActionsForMessage,
		getTraceIdForMessage,
		getRegenerateActionsForMessage,
		hasEditorRedo,
		isBuildingSite,
		isProcessing,
		messages,
		retainedShowComponentMessages,
		siteBuildUtils,
		sourceDriftInvalidatedCheckpointIds,
		thinkingMessage,
		transformMessages,
	] );

	// Notify parent when has-messages state changes.
	const messageCount = displayedMessages.length;
	const hasMessages = messageCount > 0;
	useEffect( () => {
		onHasMessagesChange( hasMessages );
	}, [ hasMessages, onHasMessagesChange ] );

	// Broadcast conversation activity so other bundles can re-sync transcript cards.
	useBroadcastConversationActivity( messageCount );

	// Broadcast the turn's edges so a host editing surface can tell the agent's
	// writes from a block settling itself on mount.
	useBroadcastTurnActivity( agentConfig?.agentId, isProcessing );

	const latestDisplayedMessage = displayedMessages[ displayedMessages.length - 1 ];
	const shouldSuppressTransientThinking = Boolean(
		latestDisplayedMessage?.role === 'agent' && latestDisplayedMessage.suppressThinking
	);
	let processingMessage = progressMessage;
	if ( isUploadingImages ) {
		processingMessage = __( 'Uploading images…', __i18n_text_domain__ );
	} else if ( isAwaitingReply ) {
		processingMessage = __( 'Waiting for the reply…', __i18n_text_domain__ );
	}
	const showProcessingIndicator =
		( isProcessing || isAwaitingReply || ( isThinking && ! isBuildingSite ) ) &&
		! shouldSuppressTransientThinking;

	// Determine which suggestions to show following Big Sky's logic:
	// - Empty chat: show provider empty-view chips plus dynamic chips.
	// - Active chat/input: show dynamic suggestions only.
	let displayedEmptyViewSuggestions: Suggestion[] = [];
	if ( ! suggestionsVisible ) {
		// Minimized/collapsed: the chat renders no suggestions, so leave the list
		// empty to avoid firing chat_suggestions_rendered for hidden chips.
		displayedEmptyViewSuggestions = [];
	} else if (
		! isLoadingConversation &&
		displayedMessages.length === 0 &&
		inputValue.length === 0
	) {
		// Prefer the registered store, but fall back to the live `useSuggestions`
		// output when the store is empty. Clicking a suggestion calls
		// `clearSuggestions()`, which empties the store, and the re-registration
		// effect is keyed on the (unchanged) hook output so it won't restore it.
		// Persistent empty-view chips must survive that clear.
		displayedEmptyViewSuggestions = mergeEmptyViewSuggestions(
			emptyViewSuggestions,
			replaceEmptyViewSuggestions || suggestions.length === 0
				? dynamicSuggestionsList
				: suggestions,
			replaceEmptyViewSuggestions
		);
	} else if ( suggestions.length > 0 ) {
		displayedEmptyViewSuggestions = suggestions;
	}
	renderedSuggestionsRef.current = displayedEmptyViewSuggestions;

	// Track when a set of suggestions is rendered — the dynamic block-context
	// suggestions or, on an empty chat, the empty-view starter chips. Mirrors
	// Big Sky, which tracked the empty view too. Dedupe on the rendered ids and
	// block context so the same actions appearing for a different block type are
	// tracked as a distinct exposure.
	const displayedSuggestionIds = displayedEmptyViewSuggestions.map( ( s ) => s.id ).join( '|' );
	const renderedSuggestionsBlockType =
		selectedBlockType &&
		displayedEmptyViewSuggestions.length > 0 &&
		displayedEmptyViewSuggestions.every( ( suggestion ) =>
			contextualSuggestionIds.has( suggestion.id )
		)
			? selectedBlockType
			: undefined;
	const lastTrackedSuggestionsRef = useRef< {
		ids: string;
		blockType?: string;
	} | null >( null );
	useEffect( () => {
		if ( displayedEmptyViewSuggestions.length === 0 ) {
			return;
		}
		const previous = lastTrackedSuggestionsRef.current;
		if (
			previous?.ids === displayedSuggestionIds &&
			( previous.blockType === renderedSuggestionsBlockType ||
				// The suggestion store can retain contextual chips for one render after
				// block deselection. Do not reclassify that exposure as post-level.
				( previous.blockType && ! renderedSuggestionsBlockType ) )
		) {
			return;
		}
		recordBigSkyTracksEvent( 'jetpack_big_sky_chat_suggestions_rendered', {
			suggestions: formatSuggestionIds( displayedEmptyViewSuggestions ),
			...( renderedSuggestionsBlockType ? { block_type: renderedSuggestionsBlockType } : {} ),
		} );
		lastTrackedSuggestionsRef.current = {
			ids: displayedSuggestionIds,
			blockType: renderedSuggestionsBlockType,
		};
		// `displayedEmptyViewSuggestions` identity is unstable; key on its ids and block context.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ displayedSuggestionIds, renderedSuggestionsBlockType ] );

	return (
		<AgentChat
			messages={ displayedMessages }
			suggestions={ suggestions }
			emptyViewSuggestions={ displayedEmptyViewSuggestions }
			isProcessing={ showProcessingIndicator || isUploadingImages }
			thinkingMessage={ processingMessage }
			error={ chatError || uploadError }
			onSubmit={ onSubmitWithImages }
			onAbort={ handleAbort }
			isLoadingConversation={ isLoadingConversation }
			isDocked={ isDocked }
			isOpen={ isOpen }
			onClose={ onClose }
			onExpand={ onExpand }
			clearSuggestions={ clearSuggestions }
			onSuggestionClick={ handleSuggestionClick }
			chatHeaderOptions={ chatHeaderOptions }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
			inputValue={ inputValue }
			onInputChange={ setInputValue }
			isCompactMode={ isCompactMode }
			groupWritingSuggestions={ groupWritingSuggestions }
			imageUpload={ imageUpload }
			isChatInputDisabled={ isChatInputDisabled }
			showFeedbackInput={ showFeedbackInput }
			onSubmitFeedbackText={ submitFeedbackText }
			onCancelFeedback={ resetFeedback }
			onContextCardAction={ handleContextCardAction }
			onContextCardDismiss={ dismissContextCard }
		/>
	);
}
