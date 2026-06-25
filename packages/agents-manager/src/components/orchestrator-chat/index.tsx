import { getAgentManager, useAgentChat } from '@automattic/agenttic-client';
import {
	type Suggestion,
	type MarkdownComponents,
	type MarkdownExtensions,
} from '@automattic/agenttic-ui';
import { useSelect } from '@wordpress/data';
import { useState, useCallback, useMemo, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import { LOCAL_TOOL_RUNNING_MESSAGE } from '../../constants';
import { useAgentsManagerContext } from '../../contexts';
import { useRegisterCustomActions } from '../../hooks/custom-actions';
import { useBroadcastConversationActivity } from '../../hooks/use-broadcast-conversation-activity';
import useCheckpointAction from '../../hooks/use-checkpoint-action';
import useConversation from '../../hooks/use-conversation';
import useCopyAction from '../../hooks/use-copy-action';
import useFeedbackAction from '../../hooks/use-feedback-action';
import useSaveNewChatRoute from '../../hooks/use-save-new-chat-route';
import useSourcesAction from '../../hooks/use-sources-action';
import useZoomAction from '../../hooks/use-zoom-action';
import { markSessionUsed } from '../../utils/agent-session';
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
import { getOrchestratorErrorMessage } from '../../utils/orchestrator-error-message';
import { persistLastActivity } from '../../utils/persist-last-activity';
import { getReaderChatErrorMessage } from '../../utils/reader-chat-error-message';
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
	ImageUploadHook,
	UseCheckpointHook,
} from '../../utils/load-external-providers';

/**
 * Pipe-delimited list of suggestion ids (e.g. `|id1|id2|`), matching Big Sky's
 * `suggestions` / `available_suggestions` tracks-prop format.
 */
function formatSuggestionIds( suggestions: Suggestion[] ): string {
	return '|' + suggestions.map( ( s ) => s.id ).join( '|' ) + '|';
}

interface Props {
	/** Suggestions displayed when the chat is empty. */
	emptyViewSuggestions: Suggestion[];
	/** Indicates if the chat is docked in the sidebar. */
	isDocked: boolean;
	/** Indicates if the chat is expanded (floating mode). */
	isOpen: boolean;
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
	/** Hook for setting up abilities that utilize React context. Invoked after custom actions registration. */
	useAbilitiesSetup?: AbilitiesSetupHook;
	/** Hook for providing dynamic suggestions based on context (e.g., selected block). */
	useSuggestions?: UseSuggestionsHook;
	/** Get a chat component by type for rendering in agent messages. */
	getChatComponent?: GetChatComponent;
	/** Utilities for site building flow (e.g., progress tracking, site preview). */
	siteBuildUtils?: SiteBuildUtils;
	/** Hook for handling image uploads within the agent chat. */
	useImageUpload?: ImageUploadHook;
	/** Hook for saving and restoring editor state so that AI actions can be undone. */
	useCheckpoint?: UseCheckpointHook;
	/** Called when the has-messages state changes. */
	onHasMessagesChange: ( hasMessages: boolean ) => void;
}

export default function OrchestratorChat( {
	emptyViewSuggestions,
	isDocked,
	isOpen,
	onClose,
	onExpand,
	chatHeaderOptions,
	markdownComponents,
	markdownExtensions,
	isCompactMode,
	useNavigationContinuation,
	useAbilitiesSetup,
	useSuggestions,
	getChatComponent,
	siteBuildUtils,
	useImageUpload,
	useCheckpoint,
	onHasMessagesChange,
}: Props ) {
	const { agentConfig, getActiveSessionId, siteKey } = useAgentsManagerContext();

	const navigate = useNavigate();
	const [ inputValue, setInputValue ] = useState( '' );
	const [ isThinking, setIsThinking ] = useState( false );
	const [ thinkingMessage, setThinkingMessage ] = useState< string | null >( null );
	const [ isBuildingSite, setIsBuildingSite ] = useState( false );
	const [ deletedMessageIds, setDeletedMessageIds ] = useState< Set< string > >( new Set() );
	const [ hasUserSentMessage, setHasUserSentMessage ] = useState( false );
	const currentPostId = useSelect( ( select ) => {
		return ( select( 'core/editor' ) as { getCurrentPostId?: () => number } )?.getCurrentPostId?.();
	}, [] );

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
		progressMessage,
	} = useAgentChat( agentConfig! );

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

			// Update the UI with the loaded messages
			loadMessages( loadedMessages );
			// Make sure future messages go to the right session
			getAgentManager().updateSessionId( agentConfig!.agentId, serverSessionId );

			// Sync local session ID with the server's
			if ( agentConfig!.sessionId !== serverSessionId ) {
				navigate( '/chat', { state: { sessionId: serverSessionId }, replace: true } );
			}
		},
	} );

	// Use dynamic suggestions from the external provider (e.g., Big Sky block-based suggestions)
	const maxDynamicSuggestions = isDocked ? undefined : 3;
	const dynamicSuggestions = useSuggestions?.( maxDynamicSuggestions, {
		suggestionsVisible: isOpen || isCompactMode,
	} );
	const dynamicSuggestionsList = dynamicSuggestions?.suggestions ?? [];
	const dynamicSuggestionsKey = JSON.stringify(
		dynamicSuggestionsList.map( ( s ) => [ s.id, s.label, s.prompt ] )
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

	// Track when a new set of suggestions is rendered. Keyed on the rendered
	// ids so re-renders that don't change the set don't re-fire.
	const renderedSuggestionsKey = suggestions.map( ( s ) => s.id ).join( '|' );
	useEffect( () => {
		if ( suggestions.length > 0 ) {
			recordBigSkyTracksEvent( 'chat_suggestions_rendered', {
				suggestions: formatSuggestionIds( suggestions ),
			} );
		}
		// `suggestions` identity is unstable; key on its rendered ids instead.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ renderedSuggestionsKey ] );

	// Persist the chat route so the conversation can be resumed later.
	useSaveNewChatRoute( hasUserSentMessage );

	// Register an "Undo" action on agent messages with checkpoints.
	const checkpoint = useCheckpoint?.();
	useCheckpointAction( registerMessageActions, checkpoint );

	// Register thumbs-up/down feedback actions on agent messages.
	const { showFeedbackInput, submitFeedbackText, resetFeedback, getFeedbackActionsForMessage } =
		useFeedbackAction( {
			registerMessageActions,
			messages,
		} );

	// Add a "Copy" action on plain-text agent messages.
	const getCopyActionsForMessage = useCopyAction();

	// Register zoom-in/zoom-out actions on agent messages.
	useZoomAction( registerMessageActions );

	// Register a "Sources" action on agent messages with sources data.
	useSourcesAction( registerMessageActions, ! isReaderChat );

	const imageUpload = useImageUpload?.();
	const pendingImages = imageUpload?.pendingImages || [];
	const uploadImagesToWordPress = imageUpload?.uploadImagesToWordPress;

	const onSubmitWithImages = useCallback(
		async ( message: string ) => {
			setHasUserSentMessage( true );
			persistLastActivity( siteKey );

			recordBigSkyTracksEvent( 'chat_input_send_message', {
				message_length: message?.length || 0,
				has_images: pendingImages.length > 0,
			} );

			if ( pendingImages.length > 0 && uploadImagesToWordPress ) {
				try {
					// Upload files to WordPress media library
					const mediaObjects = await uploadImagesToWordPress();

					recordBigSkyTracksEvent( 'file_upload_success', {
						count: mediaObjects.length,
					} );

					// Create image data objects with full metadata including attachment ID
					const imageData = mediaObjects.map( ( media ) => ( {
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

					// Send message with images using agenttic's imageUrls option
					// FileParts will be automatically persisted in conversation history with metadata
					await onSubmit( message, { imageUrls: imageData } );
				} catch ( uploadError ) {
					throw new Error(
						__( 'Failed to upload images. Please try again.', '__i18n_text_domain__' )
					);
				}
			} else {
				// No images, just send normally
				await onSubmit( message );
			}
			consumeNextMessageExternalContextEntries();
			if ( isReaderChat ) {
				markSessionUsed( agentConfig?.agentId );
			}
		},
		[
			agentConfig?.agentId,
			isReaderChat,
			onSubmit,
			pendingImages.length,
			siteKey,
			uploadImagesToWordPress,
		]
	);

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

	const submitChatMessage = useCallback(
		async ( message?: string ) => {
			const submittedMessage = typeof message === 'string' ? message : inputValue;

			if ( ! submittedMessage.trim() ) {
				return;
			}

			await onSubmitWithImages( submittedMessage );
			setInputValue( '' );
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
		sessionId: getActiveSessionId(),
		pathname: window.location.pathname,
	} );

	// Listen for inline suggestion clicks dispatched by external providers or the Agenttic bridge below.
	useEffect( () => {
		const handleInlineSuggestionClick = ( event: Event ) => {
			const { value } = ( event as CustomEvent ).detail;
			if ( value ) {
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

			if ( typeof suggestion !== 'string' ) {
				recordBigSkyTracksEvent( 'chat_suggestion_click', {
					suggestion_text: suggestion.prompt || '',
					suggestion_id: suggestion.id || '',
					available_suggestions: formatSuggestionIds( availableSuggestions ?? [] ),
				} );
			}

			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', { detail: { value } } )
			);
		},
		[]
	);

	// Invoke abilities setup hook to register hook-based abilities that utilize React context.
	// Provides custom action handlers for agent and chat interaction within Big Sky's AI store.
	// The hook is stable as `OrchestratorChat` only renders after external providers have been loaded.
	useAbilitiesSetup?.( {
		addMessage: ( message: BigSkyMessage ) => {
			// Transform Big Sky message format to `UIMessage` format and add to chat
			addMessage( {
				// Keep Big Sky message properties without explicit mapping to keep linter happy
				// Big Sky messages sometimes have a `context` field used by the
				// site build to show the progress indicator
				...message,
				id: message.id,
				role: message.role === 'assistant' ? 'agent' : 'user',
				content: message.content,
				timestamp: message.created_at ? message.created_at * 1000 : Date.now(),
				archived: message.archived ?? false,
				showIcon: message.showIcon ?? true,
			} );
		},
		clearMessages: () => loadMessages( [] ),
		clearSuggestions,
		getAgentManager,
		isProcessing,
		setIsThinking,
		deleteMarkedMessages: ( msgs ) => {
			setDeletedMessageIds(
				( prevIds ) => new Set( [ ...prevIds, ...msgs.map( ( msg ) => msg.id ) ] )
			);
		},
		// This ensures the same session ID is used between Big Sky and Calypso agents,
		// so that messages will be stored in the same conversation.
		getSessionId: getActiveSessionId,
		setIsBuildingSite,
		setThinkingMessage,
	} );

	const displayedMessages = useMemo< AgentsManagerUIMessage[] >( () => {
		let currentMessages: AgentsManagerUIMessage[] = messages;

		currentMessages = currentMessages.filter(
			( message ) =>
				! deletedMessageIds.has( message.id ) &&
				! message.content?.some( ( content ) => content?.text === LOCAL_TOOL_RUNNING_MESSAGE )
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
			onSubmit: onSubmitWithImages,
		} );

		currentMessages = currentMessages.map( ( message ) => {
			if ( message.id.endsWith( '-next-step' ) ) {
				return message;
			}

			const directActions = [
				...getFeedbackActionsForMessage( message ),
				...getCopyActionsForMessage( message ),
			];
			if ( directActions.length === 0 ) {
				return message;
			}

			const existingActions = message.actions?.filter(
				( action ) => ! action.id.startsWith( 'feedback-' ) && action.id !== 'copy'
			);

			return {
				...message,
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
		getFeedbackActionsForMessage,
		isBuildingSite,
		messages,
		onSubmitWithImages,
		siteBuildUtils,
		thinkingMessage,
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
	// - When there are dynamic suggestions (from block selection, etc.), show those
	// - Otherwise, show empty view suggestions only when there are no messages AND no input text
	let displayedEmptyViewSuggestions: Suggestion[] = [];
	if ( suggestions.length > 0 ) {
		displayedEmptyViewSuggestions = suggestions;
	} else if ( displayedMessages.length === 0 && inputValue.length === 0 ) {
		// Read straight from the live `useSuggestions` output rather than the
		// registered store. Clicking a suggestion calls `clearSuggestions()`,
		// which empties the store, and the re-registration effect is keyed on
		// the (unchanged) hook output so it won't restore it. Persistent
		// empty-view chips must survive that clear; fall back to the static
		// defaults only when the hook genuinely has none.
		displayedEmptyViewSuggestions =
			dynamicSuggestionsList.length > 0 ? dynamicSuggestionsList : emptyViewSuggestions;
	}

	return (
		<AgentChat
			messages={ displayedMessages }
			suggestions={ suggestions }
			emptyViewSuggestions={ displayedEmptyViewSuggestions }
			isProcessing={ showProcessingIndicator }
			thinkingMessage={ progressMessage }
			error={ chatError }
			onSubmit={ onSubmitWithImages }
			onAbort={ abortCurrentRequest }
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
			imageUpload={ imageUpload }
			showFeedbackInput={ showFeedbackInput }
			onSubmitFeedbackText={ submitFeedbackText }
			onCancelFeedback={ resetFeedback }
			onContextCardAction={ handleContextCardAction }
			onContextCardDismiss={ dismissContextCard }
		/>
	);
}
