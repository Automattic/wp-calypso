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
import { useSelect } from '@wordpress/data';
import { useState, useCallback, useMemo, useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { LOCAL_TOOL_RUNNING_MESSAGE } from '../../constants';
import { useAgentsManagerContext } from '../../contexts';
import { useRegisterCustomActions } from '../../hooks/custom-actions';
import useAbilitiesRegistration from '../../hooks/use-abilities-registration';
import useAgentTraceIds from '../../hooks/use-agent-trace-ids';
import { useBroadcastConversationActivity } from '../../hooks/use-broadcast-conversation-activity';
import useCheckpointAction from '../../hooks/use-checkpoint-action';
import useConversation from '../../hooks/use-conversation';
import useCopyAction from '../../hooks/use-copy-action';
import { usePageOrSiteEditorSurface } from '../../hooks/use-empty-view-suggestions';
import useFeedbackAction from '../../hooks/use-feedback-action';
import { useImageUpload } from '../../hooks/use-image-upload';
import useRegenerateAction from '../../hooks/use-regenerate-action';
import useSourcesAction from '../../hooks/use-sources-action';
import convertToolMessagesToComponents, {
	type AgentsManagerUIMessage,
} from '../../utils/convert-tool-messages-to-components';
import {
	consumeNextMessageExternalContextEntries,
	removeExternalContextCard,
	removeExternalContextEntry,
	type ExternalContextCard,
	type ExternalContextCardAction,
} from '../../utils/external-context';
import { isReaderChatAgent } from '../../utils/is-reader-chat-agent';
import { mergeEmptyViewSuggestions } from '../../utils/merge-empty-view-suggestions';
import { getOrchestratorErrorMessage } from '../../utils/orchestrator-error-message';
import { setProviderCheckpoints } from '../../utils/provider-checkpoints';
import { getReaderChatErrorMessage } from '../../utils/reader-chat-error-message';
import { isShowComponentTool } from '../../utils/show-component-tools';
import { isBlockEditToolId } from '../../utils/tool-message-utils';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
import AgentChat from '../agent-chat';
import { type Options as ChatHeaderOptions } from '../chat-header';
import type { BigSkyMessage } from '../../types';
import type {
	NavigationContinuationHook,
	AbilitiesSetupHook,
	GetChatComponent,
	UseSuggestionsHook,
	SiteBuildUtils,
	TransformMessages,
	UseCheckpointHook,
	ProviderCapabilities,
} from '../../utils/load-external-providers';

const streamedCheckpointMessagesBySession = new Map< string, Map< string, UIMessage > >();

function getStreamedCheckpointMessages( sessionIdentity: string ): Map< string, UIMessage > {
	const existing = streamedCheckpointMessagesBySession.get( sessionIdentity );
	if ( existing ) {
		return existing;
	}

	const messages = new Map< string, UIMessage >();
	streamedCheckpointMessagesBySession.set( sessionIdentity, messages );
	return messages;
}

function getLatestAgentMessageId( messages: UIMessage[] ): string | null {
	for ( let index = messages.length - 1; index >= 0; index-- ) {
		if ( messages[ index ].role === 'agent' ) {
			return messages[ index ].id;
		}
	}

	return null;
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
	availableSuggestions: Suggestion[]
): string | undefined {
	const originalSuggestion = availableSuggestions.find(
		( suggestion ) => suggestion.id === selectedSuggestion.id
	);
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
	/** Navigation continuation hook for post-navigation conversation resumption. */
	useNavigationContinuation?: NavigationContinuationHook;
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
	useNavigationContinuation,
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
	const { agentConfig, getTabSessionId } = useAgentsManagerContext();

	const [ inputValue, setInputValue ] = useState( '' );
	const [ isThinking, setIsThinking ] = useState( false );
	const [ thinkingMessage, setThinkingMessage ] = useState< string | null >( null );
	const [ isBuildingSite, setIsBuildingSite ] = useState( false );
	const [ deletedMessageIds, setDeletedMessageIds ] = useState< Set< string > >( new Set() );
	const [ retainedShowComponentMessages, setRetainedShowComponentMessages ] = useState<
		Map< string, UIMessage >
	>( new Map() );
	const [ isRegenerating, setIsRegenerating ] = useState( false );
	const [ hasUserSentMessage, setHasUserSentMessage ] = useState( false );
	const currentPostId = useSelect( ( select ) => {
		const editor = select( 'core/editor' ) as { getCurrentPostId?: () => number | string };
		return editor?.getCurrentPostId?.();
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
	const { isPageOrSiteEditorSurface: groupWritingSuggestions } = usePageOrSiteEditorSurface();
	const checkpointSessionIdentity = `${ agentConfig?.agentId ?? '' }:${
		agentConfig?.sessionId ?? getActiveSessionId() ?? ''
	}`;
	const streamedCheckpointMessagesRef = useRef( {
		sessionIdentity: checkpointSessionIdentity,
		pendingByTaskId: new Map< string, UIMessage >(),
		byFinalMessageId: getStreamedCheckpointMessages( checkpointSessionIdentity ),
		regeneratingMessageId: undefined as string | undefined,
	} );
	if ( streamedCheckpointMessagesRef.current.sessionIdentity !== checkpointSessionIdentity ) {
		streamedCheckpointMessagesRef.current = {
			sessionIdentity: checkpointSessionIdentity,
			pendingByTaskId: new Map(),
			byFinalMessageId: getStreamedCheckpointMessages( checkpointSessionIdentity ),
			regeneratingMessageId: undefined,
		};
	}
	const agentChatConfig = useMemo( () => {
		if ( ! agentConfig ) {
			return null;
		}

		const { onTaskUpdate } = agentConfig;
		return {
			...agentConfig,
			onTaskUpdate: async ( update: TaskUpdate ) => {
				const streamedMessages = streamedCheckpointMessagesRef.current;
				if ( streamedMessages.sessionIdentity === checkpointSessionIdentity && update.text ) {
					const message: UIMessage = {
						id: update.status.message?.messageId ?? update.agentMessage?.messageId ?? update.id,
						role: 'agent',
						content: [ { type: 'text', text: update.text } ],
						timestamp: Date.now(),
						archived: false,
						showIcon: true,
					};
					if ( isBlockEditToolId( getToolMessageData( message )?.toolId ) ) {
						streamedMessages.pendingByTaskId.set( update.id, message );
					}
				}

				const isTerminal =
					update.final === true ||
					[ 'completed', 'canceled', 'failed' ].includes( update.status.state );
				if ( isTerminal ) {
					const finalMessageId = update.status.message?.messageId ?? update.agentMessage?.messageId;
					const completedSuccessfully =
						update.status.state === 'completed' ||
						( update.final === true && ! [ 'canceled', 'failed' ].includes( update.status.state ) );
					const checkpointMessage = streamedMessages.pendingByTaskId.get( update.id );
					const regeneratingMessageId = streamedMessages.regeneratingMessageId;
					if ( completedSuccessfully && regeneratingMessageId ) {
						streamedMessages.byFinalMessageId.delete( regeneratingMessageId );
					}
					if ( finalMessageId && completedSuccessfully && checkpointMessage ) {
						streamedMessages.byFinalMessageId.set( finalMessageId, checkpointMessage );
					} else if ( completedSuccessfully && regeneratingMessageId ) {
						if ( finalMessageId ) {
							streamedMessages.byFinalMessageId.delete( finalMessageId );
						}
					}
					streamedMessages.pendingByTaskId.delete( update.id );
					streamedMessages.regeneratingMessageId = undefined;
				}

				await onTaskUpdate?.( update );
			},
		};
	}, [ agentConfig, checkpointSessionIdentity ] );

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

	const { isLoading: isLoadingConversation } = useConversation( {
		maxPages: isReaderChat ? 1 : 10,
		enabled: shouldLoadConversation,
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

			// Update the UI with the loaded messages
			loadMessages( loadedMessages );
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
	const getCheckpointActionsForMessage = useCheckpointAction( registerMessageActions, checkpoint );

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

			recordBigSkyTracksEvent( 'chat_input_send_message', {
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

					recordBigSkyTracksEvent( 'file_upload_success', {
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
						recordBigSkyTracksEvent( 'file_upload_cancel', {
							count: pendingImages.length,
						} );
						return;
					}

					recordBigSkyTracksEvent( 'file_upload_error', {
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

			submitDispatchedRef.current = true;
			try {
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

	// Handle navigation continuation if hook is provided
	// This allows to resume conversations after full page navigation
	useNavigationContinuation?.( {
		isProcessing,
		sendToolResult: async ( params ) => {
			await onSubmit( params.message, {
				type: 'tool_result',
				toolCallId: params.toolCallId,
				toolId: params.toolId,
				sessionId: params.sessionId,
			} );
		},
		sessionId: getTabSessionId(),
		pathname: window.location.pathname,
	} );

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

	const handleSuggestionClick = useCallback(
		( suggestion: Suggestion | string, availableSuggestions?: Suggestion[] ) => {
			const value =
				typeof suggestion === 'string' ? suggestion : suggestion.prompt ?? suggestion.label;

			const autoSubmit = typeof suggestion !== 'string' && !! suggestion.autoSubmit;
			const suggestionId = typeof suggestion !== 'string' ? suggestion.id : undefined;
			const optionId =
				typeof suggestion !== 'string'
					? getSelectedOptionId( suggestion, availableSuggestions ?? [] )
					: undefined;
			const blockType =
				typeof suggestion !== 'string' && contextualSuggestionIds.has( suggestion.id )
					? selectedBlockType
					: undefined;

			if ( typeof suggestion !== 'string' ) {
				recordBigSkyTracksEvent( 'chat_suggestion_click', {
					suggestion_text: suggestion.prompt || '',
					suggestion_id: suggestion.id || '',
					available_suggestions: formatSuggestionIds( availableSuggestions ?? [] ),
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
			const traceId = getTraceIdForMessage( message.id );
			const messageWithTraceId = traceId ? { ...message, traceId } : message;

			const directActions = [
				...( checkpointActionsByMessageId.get( message.id ) ?? [] ),
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
		currentPostId,
		deletedMessageIds,
		getChatComponent,
		getCopyActionsForMessage,
		getCheckpointActionsForMessage,
		getShowComponentOrder,
		getFeedbackActionsForMessage,
		getTraceIdForMessage,
		getRegenerateActionsForMessage,
		isBuildingSite,
		isProcessing,
		messages,
		retainedShowComponentMessages,
		siteBuildUtils,
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

	const latestDisplayedMessage = displayedMessages[ displayedMessages.length - 1 ];
	const shouldSuppressTransientThinking = Boolean(
		latestDisplayedMessage?.role === 'agent' && latestDisplayedMessage.suppressThinking
	);
	const showProcessingIndicator =
		( isProcessing || ( isThinking && ! isBuildingSite ) ) && ! shouldSuppressTransientThinking;

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
		recordBigSkyTracksEvent( 'chat_suggestions_rendered', {
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
			thinkingMessage={
				isUploadingImages ? __( 'Uploading images…', __i18n_text_domain__ ) : progressMessage
			}
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
