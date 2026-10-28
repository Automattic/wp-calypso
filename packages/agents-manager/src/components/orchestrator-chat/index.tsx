import { getAgentManager, type TaskUpdate } from '@automattic/agenttic-client';
import {
	type Suggestion,
	type MarkdownComponents,
	type MarkdownExtensions,
} from '@automattic/agenttic-ui';
import { useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { LOCAL_TOOL_RUNNING_MESSAGE } from '../../constants';
import { useAgentsManagerContext } from '../../contexts';
import { useRegisterCustomActions } from '../../hooks/custom-actions';
import useAbilitiesRegistration from '../../hooks/use-abilities-registration';
import useAgentTraceIds from '../../hooks/use-agent-trace-ids';
import { useBroadcastConversationActivity } from '../../hooks/use-broadcast-conversation-activity';
import { useBroadcastTurnActivity } from '../../hooks/use-broadcast-turn-activity';
import { useCanvasMoveAbort } from '../../hooks/use-canvas-move-abort';
import { useChatComposer } from '../../hooks/use-chat-composer';
import { useChatError } from '../../hooks/use-chat-error';
import { getCheckpointIdForMessage } from '../../hooks/use-checkpoint-action';
import { useCheckpointAvailability } from '../../hooks/use-checkpoint-availability';
import { useContextCardActions } from '../../hooks/use-context-card-actions';
import { useConversationHydration } from '../../hooks/use-conversation-hydration';
import useCopyAction from '../../hooks/use-copy-action';
import { useCredits } from '../../hooks/use-credits';
import { useDynamicSuggestions } from '../../hooks/use-dynamic-suggestions';
import { usePageOrSiteEditorSurface } from '../../hooks/use-empty-view-suggestions';
import useFeedbackAction from '../../hooks/use-feedback-action';
import { useGatedRegenerateHandler } from '../../hooks/use-gated-regenerate-handler';
import { useInlineSuggestionClick } from '../../hooks/use-inline-suggestion-click';
import { useNavigationContinuation } from '../../hooks/use-navigation-continuation';
import useRegenerateAction from '../../hooks/use-regenerate-action';
import { useResponseOutcomeTracking } from '../../hooks/use-response-outcome-tracking';
import { useRetriedToolCalls } from '../../hooks/use-retried-tool-calls';
import { useShowComponentRetention } from '../../hooks/use-show-component-retention';
import useSiteSetupChecklist from '../../hooks/use-site-setup-checklist';
import useSourcesAction from '../../hooks/use-sources-action';
import { useStreamedCheckpointMessages } from '../../hooks/use-streamed-checkpoint-messages';
import { useSuggestionTracking } from '../../hooks/use-suggestion-tracking';
import { convertInteractiveUiMessagesToComponents } from '../../interactive-ui/convert-messages-to-components';
import { useInteractiveUi } from '../../interactive-ui/use-interactive-ui';
import { markSessionSent } from '../../utils/agent-session';
import { convertBigSkyMessageToUIMessage } from '../../utils/convert-big-sky-message';
import convertToolMessagesToComponents, {
	type AgentsManagerUIMessage,
} from '../../utils/convert-tool-messages-to-components';
import { getDisplayedEmptyViewSuggestions } from '../../utils/empty-view-suggestions';
import { isReaderChatAgent } from '../../utils/is-reader-chat-agent';
import { isWooAiProvider } from '../../utils/is-woo-ai-provider';
import { getLatestAgentMessageId, getLatestUserMessageIndex } from '../../utils/latest-message';
import {
	hasCheckpointAction,
	hasDisabledCheckpointAction,
	withComputedActions,
} from '../../utils/message-actions';
import AgentChat from '../agent-chat';
import { type Options as ChatHeaderOptions } from '../chat-header';
import SiteSetupChecklist from '../site-setup-checklist';
import type { BigSkyMessage } from '../../types';
import type {
	AbilitiesSetupHook,
	GetChatComponent,
	LoadedProviders,
	UseSuggestionsHook,
	SiteBuildUtils,
	TransformMessages,
	UseCheckpointHook,
	ProviderCapabilities,
} from '../../utils/load-external-providers';

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
	/** The providers' interactive UI catalogs. */
	interactiveUiCatalogs?: LoadedProviders[ 'interactiveUiCatalogs' ];
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
	interactiveUiCatalogs,
	siteBuildUtils,
	transformMessages,
	useCheckpoint,
	capabilities,
	isChatInputDisabled,
	onHasMessagesChange,
}: Props ) {
	const { agentConfig, getTabSessionId, siteKey, site, currentUser } = useAgentsManagerContext();
	const isReaderChat = isReaderChatAgent( agentConfig?.agentId );

	// Set by the providers' abilities, e.g. while Big Sky builds a site.
	const [ isThinking, setIsThinking ] = useState( false );
	const [ thinkingMessage, setThinkingMessage ] = useState< string | null >( null );
	const [ isBuildingSite, setIsBuildingSite ] = useState( false );

	// Streamed task updates, recorded before the agent config's own `onTaskUpdate` runs.
	const {
		scopeIdentity,
		sessionId,
		streamGeneration,
		isCurrentStreamGeneration,
		recordTaskUpdate,
		startCheckpointRegeneration,
		finishCheckpointRegeneration,
		getCheckpointMessage,
		invalidateLoadedCheckpoints,
	} = useStreamedCheckpointMessages();
	const { retriedToolCallIds, recordRetriedToolCall } = useRetriedToolCalls( streamGeneration );
	const trackResponseOutcome = useResponseOutcomeTracking();

	const agentChatConfig = useMemo( () => {
		if ( ! agentConfig ) {
			return null;
		}

		const { onTaskUpdate } = agentConfig;
		return {
			...agentConfig,
			trackReplying: true,
			onTaskUpdate: async ( update: TaskUpdate ) => {
				// A previous session's stream must not write into this one.
				if ( isCurrentStreamGeneration( streamGeneration ) ) {
					recordRetriedToolCall( update );
					recordTaskUpdate( update );
				}

				trackResponseOutcome( update );
				await onTaskUpdate?.( update );
			},
		};
	}, [
		agentConfig,
		isCurrentStreamGeneration,
		recordRetriedToolCall,
		recordTaskUpdate,
		streamGeneration,
		trackResponseOutcome,
	] );

	// The chat runtime, behind the credits gate.
	// The composer's retry send is created after credits, so the notice reaches it through a ref.
	const retrySendRef = useRef< ( message: string ) => void >( () => {} );
	const tryAgain = useCallback( ( message: string ) => retrySendRef.current( message ), [] );
	const credits = useCredits( {
		onTryAgain: tryAgain,
		enabled: ! isReaderChat,
		agentConfig: agentChatConfig!,
		siteKey,
		userId: currentUser?.ID,
		site,
		// The compact composer can send too, so it keeps the balance fresh.
		isOpen: isOpen || ( ! isDocked && isCompactMode ),
		isNoticeVisible: isOpen,
	} );
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
		isReplying,
	} = credits.chat;
	const getTraceIdForMessage = useAgentTraceIds( agentConfig );

	useCanvasMoveAbort( { isProcessing, abortCurrentRequest, addMessage } );

	// Keeps pickers on screen while a stream drops them. A regeneration rewinds
	// them along with the turn's streamed checkpoints.
	const { pauseRetentionForRegeneration, withRetainedShowComponents, expectHistoryLoad } =
		useShowComponentRetention( {
			messages,
			isProcessing,
		} );

	const handleRegenerationStart = useCallback(
		( messageId: string | undefined ) => {
			pauseRetentionForRegeneration();
			startCheckpointRegeneration( messageId );
		},
		[ pauseRetentionForRegeneration, startCheckpointRegeneration ]
	);
	const getGatedRegenerateHandler = useGatedRegenerateHandler( {
		getRegenerateHandler,
		beforeSubmit: credits.beforeSubmit,
		onRegenerationStart: handleRegenerationStart,
		onRegenerationEnd: finishCheckpointRegeneration,
	} );

	// Sending, and loading the saved conversation.
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

	// A ref, as the prompts on screen are derived after this hook.
	const suggestionPromptsRef = useRef< Set< string > >( new Set() );
	const {
		inputValue,
		setInputValue,
		setChatInput,
		imageUpload,
		isUploadingImages,
		uploadError,
		submitComposerMessage,
		submitChatMessage,
		submitHostMessage,
		submitRetryMessage,
		submitContextMessage,
		stopResponse,
	} = useChatComposer( {
		isReaderChat,
		onSubmit,
		abortCurrentRequest,
		beforeSubmit: credits.beforeSubmit,
		flushPendingNavigation,
		suggestionPromptsRef,
	} );

	// What's in the box wins, as it sits right under the notice; the refused question is the fallback.
	// The draft goes as typed, so the composer recognises and clears it.
	retrySendRef.current = ( message ) =>
		submitRetryMessage( inputValue.trim() ? inputValue : message );

	// Marks the session as sent whichever path started the turn.
	useEffect( () => {
		if ( isProcessing && agentConfig?.sessionId ) {
			markSessionSent( agentConfig.sessionId );
		}
	}, [ isProcessing, agentConfig?.sessionId ] );

	const {
		isLoading: isLoadingConversation,
		notice: replyNotice,
		hasFailedResume,
	} = useConversationHydration( {
		hadParkedNavigation,
		loadMessages,
		onFetch: invalidateLoadedCheckpoints,
		onHistoryLoad: expectHistoryLoad,
		isProcessing,
		onRetry: submitRetryMessage,
		onSubmit,
	} );
	const siteSetupChecklist = useSiteSetupChecklist( {
		enabled: ! isReaderChat,
		isProcessing,
		isLoadingConversation,
		messages,
	} );
	// The empty view waits for the checklist too, or it flashes before the list.
	const isPreparingConversation = isLoadingConversation || siteSetupChecklist.isLoading;
	const siteSetupChecklistNode = siteSetupChecklist.variant ? (
		<SiteSetupChecklist
			variant={ siteSetupChecklist.variant }
			items={ siteSetupChecklist.items }
			busy={ isProcessing }
			focusHeaderOnMount={ siteSetupChecklist.focusHeaderOnMount }
		/>
	) : null;

	const chatError = useChatError( {
		error: hasFailedResume ? null : error,
		isReaderChat,
		takeRefusalCode: credits.takeRefusalCode,
		refusalNotice: credits.refusalNotice,
	} );

	// Registered before the providers' ability setup below, whose effects may
	// clear suggestions.
	const { dynamicSuggestions, replaceEmptyViewSuggestions, contextualSuggestionIds } =
		useDynamicSuggestions( { useSuggestions, isDocked, registerSuggestions, clearSuggestions } );

	// The actions under each agent message.
	const getCheckpointActionsForMessage = useCheckpointAvailability( {
		messages,
		registerMessageActions,
		useCheckpoint,
		getCheckpointMessage,
	} );
	const { showFeedbackInput, submitFeedbackText, resetFeedback, getFeedbackActionsForMessage } =
		useFeedbackAction( { messages, getTraceIdForMessage } );
	const getRegenerateActionsForMessage = useRegenerateAction( {
		enabled: capabilities?.supportsRegenerateAction === true,
		getRegenerateHandler: getGatedRegenerateHandler,
	} );
	const getCopyActionsForMessage = useCopyAction();
	useSourcesAction( registerMessageActions, ! isReaderChat );

	// Bridges to the host page and the providers.
	useRegisterCustomActions( { setChatInput, submitChatMessage: submitHostMessage } );

	const { handleContextCardAction, dismissContextCard } = useContextCardActions( {
		beforeSubmit: credits.beforeSubmit,
		submitChatMessage,
		setChatInput,
	} );

	const dispatchSuggestionClick = useInlineSuggestionClick( setChatInput );

	// The optional hook call is safe: this component renders only after the
	// providers load, so the hook never changes. Big Sky reads every handler but
	// `clearSuggestions` and `isProcessing`; jetpack-ai-sidebar reads those two.
	useProviderAbilitiesSetup?.( {
		addMessage: ( message: BigSkyMessage ) =>
			addMessage( convertBigSkyMessageToUIMessage( message ) ),
		clearMessages: () => loadMessages( [] ),
		clearSuggestions,
		getAgentManager,
		isProcessing,
		setIsThinking,
		// Big Sky stores its messages in the same conversation as this chat.
		getSessionId: getTabSessionId,
		setIsBuildingSite,
		setThinkingMessage,
	} );

	useAbilitiesRegistration();

	// The transcript as displayed.
	const currentPostId = useSelect( ( select ) => {
		const editor = select( 'core/editor' ) as { getCurrentPostId?: () => number | string };
		return editor?.getCurrentPostId?.();
	}, [] );

	const convertedMessages = useMemo< AgentsManagerUIMessage[] >( () => {
		// Let the provider rewrite the whole raw transcript first, at display time,
		// so a message restored from history is presented the same way as a new one.
		let currentMessages: AgentsManagerUIMessage[] = transformMessages
			? transformMessages( messages )
			: messages;

		// `local_tool_running` is a placeholder, not a reply.
		currentMessages = currentMessages.filter(
			( message ) =>
				! message.content?.some( ( content ) => content?.text === LOCAL_TOOL_RUNNING_MESSAGE )
		);
		currentMessages = withRetainedShowComponents( currentMessages );

		// Read before grouping and conversion below: a checkpoint lives in the tool
		// message's raw JSON.
		const checkpointActionsByMessageId = new Map(
			currentMessages.map( ( message ) => [
				message.id,
				getCheckpointActionsForMessage( getCheckpointMessage( message ) ),
			] )
		);

		// Checkpoint messages of earlier turns are dimmed: only the latest turn can be undone.
		const latestUserMessageIndex = getLatestUserMessageIndex( currentMessages );
		const supersededCheckpointMessageIds = new Set(
			currentMessages
				.slice( 0, Math.max( latestUserMessageIndex, 0 ) )
				.filter(
					( message ) =>
						getCheckpointIdForMessage( getCheckpointMessage( message ) ) !== null ||
						( checkpointActionsByMessageId.get( message.id )?.length ?? 0 ) > 0 ||
						hasCheckpointAction( message.actions )
				)
				.map( ( message ) => message.id )
		);

		// Big Sky's site build shows its messages as one progress card, with a
		// spinner while it styles the site.
		const hasBuildMessages = siteBuildUtils?.hasSiteBuildMessages( currentMessages );
		if ( siteBuildUtils?.groupSiteBuildMessages && ( isBuildingSite || hasBuildMessages ) ) {
			currentMessages = siteBuildUtils.groupSiteBuildMessages(
				currentMessages,
				isBuildingSite ? thinkingMessage : null
			);
		}

		currentMessages = convertInteractiveUiMessagesToComponents( currentMessages );

		currentMessages = convertToolMessagesToComponents( {
			messages: currentMessages,
			getChatComponent,
			currentPostId,
			isProcessing,
			canEscalateToHuman: isWooAiProvider(),
			retriedToolCallIds,
		} );

		const latestAgentMessageId = getLatestAgentMessageId( currentMessages );

		return currentMessages.map( ( message ) => {
			const checkpointActions = checkpointActionsByMessageId.get( message.id ) ?? [];
			const isDisabled =
				hasDisabledCheckpointAction( checkpointActions ) ||
				supersededCheckpointMessageIds.has( message.id );
			const traceId = getTraceIdForMessage( message.id );
			const decoratedMessage =
				traceId || isDisabled
					? {
							...message,
							...( traceId && { traceId } ),
							...( isDisabled && { disabled: true } ),
						}
					: message;

			return withComputedActions( decoratedMessage, [
				...checkpointActions,
				...getFeedbackActionsForMessage( message ),
				...getCopyActionsForMessage( message ),
				...getRegenerateActionsForMessage( message, {
					isLatestAgentMessage: message.id === latestAgentMessageId,
				} ),
			] );
		} );
	}, [
		currentPostId,
		getChatComponent,
		getCheckpointActionsForMessage,
		getCheckpointMessage,
		getCopyActionsForMessage,
		getFeedbackActionsForMessage,
		getRegenerateActionsForMessage,
		getTraceIdForMessage,
		isBuildingSite,
		isProcessing,
		messages,
		retriedToolCallIds,
		siteBuildUtils,
		thinkingMessage,
		transformMessages,
		withRetainedShowComponents,
	] );

	// Interactive UI surfaces in agent replies, and the actions they send.
	const displayedMessages = useInteractiveUi( {
		messages,
		convertedMessages,
		scopeIdentity,
		sessionId,
		isProcessing,
		isUploadingImages,
		submitContextMessage,
		interactiveUiCatalogs,
		currentPostId,
	} );

	const messageCount = displayedMessages.length;
	const hasMessages = messageCount > 0;
	useEffect( () => {
		onHasMessagesChange( hasMessages );
	}, [ hasMessages, onHasMessagesChange ] );

	// Lets other bundles re-sync their transcript cards.
	useBroadcastConversationActivity( messageCount );

	// Lets a host editing surface tell the agent's writes from a block settling
	// itself on mount.
	useBroadcastTurnActivity( agentConfig?.agentId, isProcessing );

	// Empty-view suggestions and their tracking.
	const displayedEmptyViewSuggestions = getDisplayedEmptyViewSuggestions( {
		isVisible: suggestionsVisible,
		isChatEmpty: ! isPreparingConversation && ! hasMessages,
		emptyViewSuggestions,
		registeredSuggestions: suggestions,
		dynamicSuggestions,
		replaceEmptyViewSuggestions,
	} );
	suggestionPromptsRef.current = new Set(
		displayedEmptyViewSuggestions.map( ( suggestion ) => suggestion.prompt ?? suggestion.label )
	);

	const { onSuggestionsRendered, trackSuggestionClick } = useSuggestionTracking( {
		contextualSuggestionIds,
		hasSuggestionsToRender: ! isPreparingConversation && displayedEmptyViewSuggestions.length > 0,
	} );

	const handleSuggestionClick = useCallback(
		(
			suggestion: Suggestion | string,
			availableSuggestions?: Suggestion[],
			isInMessage?: boolean
		) => {
			trackSuggestionClick( suggestion, availableSuggestions, isInMessage );
			dispatchSuggestionClick( suggestion );
		},
		[ dispatchSuggestionClick, trackSuggestionClick ]
	);

	const { isPageOrSiteEditorSurface } = usePageOrSiteEditorSurface();

	// The thinking indicator.
	const latestDisplayedMessage = displayedMessages[ displayedMessages.length - 1 ];
	const shouldSuppressTransientThinking = Boolean(
		latestDisplayedMessage?.role === 'agent' && latestDisplayedMessage.suppressThinking
	);
	const shouldShowProcessingIndicator =
		( isProcessing || ( isThinking && ! isBuildingSite ) ) && ! shouldSuppressTransientThinking;

	return (
		<AgentChat
			messages={ displayedMessages }
			suggestions={ suggestionsVisible ? suggestions : [] }
			emptyViewSuggestions={ displayedEmptyViewSuggestions }
			isProcessing={ shouldShowProcessingIndicator || isUploadingImages }
			// The indicator above hides mid-reply and covers uploads; response actions
			// follow the raw streaming state.
			isStreaming={ isProcessing }
			isReplying={ isReplying }
			thinkingMessage={
				isUploadingImages ? __( 'Uploading images…', __i18n_text_domain__ ) : progressMessage
			}
			error={ chatError.message || uploadError }
			errorNotice={ chatError.notice }
			onSubmit={ submitComposerMessage }
			onAbort={ stopResponse }
			isLoadingConversation={ isPreparingConversation }
			pinnedContent={ siteSetupChecklist.variant === 'pinned' ? siteSetupChecklistNode : null }
			emptyViewContent={ siteSetupChecklist.variant === 'empty' ? siteSetupChecklistNode : null }
			isDocked={ isDocked }
			isOpen={ isOpen }
			onClose={ onClose }
			onExpand={ onExpand }
			clearSuggestions={ clearSuggestions }
			onSuggestionClick={ handleSuggestionClick }
			onSuggestionsRendered={ onSuggestionsRendered }
			chatHeaderOptions={ chatHeaderOptions }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
			inputValue={ inputValue }
			onInputChange={ setInputValue }
			isCompactMode={ isCompactMode }
			groupWritingSuggestions={ isPageOrSiteEditorSurface }
			imageUpload={ imageUpload }
			notice={ credits.notice ?? replyNotice }
			trailingActions={ credits.trailingActions }
			beforeSubmit={ credits.beforeSubmit }
			isChatInputDisabled={ isChatInputDisabled }
			showFeedbackInput={ showFeedbackInput }
			onSubmitFeedbackText={ submitFeedbackText }
			onCancelFeedback={ resetFeedback }
			onContextCardAction={ handleContextCardAction }
			onContextCardDismiss={ dismissContextCard }
		/>
	);
}
