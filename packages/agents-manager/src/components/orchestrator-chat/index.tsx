import { getAgentManager, useAgentChat } from '@automattic/agenttic-client';
import {
	type Suggestion,
	type MarkdownComponents,
	type MarkdownExtensions,
} from '@automattic/agenttic-ui';
import { useState, useCallback, useMemo, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { LOCAL_TOOL_RUNNING_MESSAGE } from '../../constants';
import { useAgentsManagerContext } from '../../contexts';
import useConversation from '../../hooks/use-conversation';
import useCopyMessage from '../../hooks/use-copy-message';
import useFeedback from '../../hooks/use-feedback';
import useSaveNewChatRoute from '../../hooks/use-save-new-chat-route';
import { setSessionId, getSessionId as getStoredSessionId } from '../../utils/agent-session';
import { convertToolMessagesToComponents } from '../../utils/convert-tool-message-to-component';
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
} from '../../utils/load-external-providers';
import type { NavigateFunction } from 'react-router-dom';

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
	/** Navigate function from the router. */
	navigate: NavigateFunction;
	/** Hook for handling image uploads within the agent chat. */
	useImageUpload?: ImageUploadHook;
	/** Called when the message count changes. */
	onMessagesCountChange: ( count: number ) => void;
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
	onMessagesCountChange,
	navigate,
}: Props ) {
	const { agentConfig } = useAgentsManagerContext();

	const [ inputValue, setInputValue ] = useState( '' );
	const [ isThinking, setIsThinking ] = useState( false );
	const [ thinkingMessage, setThinkingMessage ] = useState< string | null >( null );
	const [ isBuildingSite, setIsBuildingSite ] = useState( false );
	const [ deletedMessageIds, setDeletedMessageIds ] = useState< Set< string > >( new Set() );

	// `agentConfig` is guaranteed non-null here because AgentSetup guards rendering
	const sessionId = agentConfig!.sessionId;
	const agentId = agentConfig!.agentId;

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
	} = useAgentChat( agentConfig! );

	// Notify parent when message count changes
	useEffect( () => {
		onMessagesCountChange( messages.length );
	}, [ messages.length, onMessagesCountChange ] );

	// Use dynamic suggestions from the external provider (e.g., Big Sky block-based suggestions)
	const dynamicSuggestions = useSuggestions?.();

	// Register dynamic suggestions whenever they change
	useEffect( () => {
		const currentSuggestions = dynamicSuggestions?.suggestions;

		if ( currentSuggestions && currentSuggestions.length > 0 ) {
			registerSuggestions?.( currentSuggestions );
		} else {
			// Clear suggestions when there are none
			clearSuggestions?.();
		}
	}, [ dynamicSuggestions?.suggestions, registerSuggestions, clearSuggestions ] );

	const { isLoading: isLoadingConversation } = useConversation( {
		onSuccess: ( loadedMessages, serverSessionId ) => {
			// Update the UI with the loaded messages
			loadMessages( loadedMessages );
			// Make sure future messages go to the right session
			getAgentManager().updateSessionId( agentId, serverSessionId );

			// Sync local session ID with the server's
			if ( sessionId !== serverSessionId ) {
				setSessionId( serverSessionId, agentId );
				navigate( '/chat', { state: { sessionId: serverSessionId }, replace: true } );
			}
		},
	} );

	// Save new chat route for cross-domain conversation restore.
	useSaveNewChatRoute( agentId, messages );

	// Register thumbs-up/down feedback actions on agent messages.
	const { showFeedbackInput, submitFeedbackText, resetFeedback } = useFeedback( {
		registerMessageActions,
		messages,
	} );

	// Register a "Copy" action on plain-text agent messages.
	useCopyMessage( registerMessageActions );

	const imageUpload = useImageUpload?.();
	const pendingImages = imageUpload?.pendingImages || [];
	const uploadImagesToWordPress = imageUpload?.uploadImagesToWordPress;

	const onSubmitWithImages = useCallback(
		async ( message: string ) => {
			if ( pendingImages.length > 0 && uploadImagesToWordPress ) {
				try {
					// Upload files to WordPress media library
					const mediaObjects = await uploadImagesToWordPress();

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
				onSubmit( message );
			}
		},
		[ onSubmit, pendingImages.length, uploadImagesToWordPress ]
	);

	// Handle navigation continuation if hook is provided
	// This allows to resume conversations after full page navigation
	useNavigationContinuation?.( {
		isProcessing,
		onSubmit,
		sessionId,
		agentId,
	} );

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
		setIsThinking,
		deleteMarkedMessages: ( msgs ) => {
			setDeletedMessageIds(
				( prevIds ) => new Set( [ ...prevIds, ...msgs.map( ( msg ) => msg.id ) ] )
			);
		},
		// This ensures the same session ID is used between Big Sky and Calypso agents,
		// so that messages will be stored in the same conversation.
		getSessionId: () => sessionId || getStoredSessionId( agentId ),
		setIsBuildingSite,
		setThinkingMessage,
	} );

	const visibleMessages = useMemo( () => {
		let currentMessages = messages;

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
		} );

		return currentMessages;
	}, [
		deletedMessageIds,
		getChatComponent,
		isBuildingSite,
		messages,
		siteBuildUtils,
		thinkingMessage,
	] );

	// Determine which suggestions to show following Big Sky's logic:
	// - When there are dynamic suggestions (from block selection, etc.), show those
	// - Otherwise, show empty view suggestions only when there are no messages AND no input text
	let displayedEmptyViewSuggestions: Suggestion[] = [];
	if ( suggestions.length > 0 ) {
		displayedEmptyViewSuggestions = suggestions;
	} else if ( visibleMessages.length === 0 && inputValue.length === 0 ) {
		displayedEmptyViewSuggestions = emptyViewSuggestions;
	}

	return (
		<AgentChat
			messages={ visibleMessages }
			suggestions={ suggestions }
			emptyViewSuggestions={ displayedEmptyViewSuggestions }
			isProcessing={ isProcessing || ( isThinking && ! isBuildingSite ) }
			error={ error }
			onSubmit={ onSubmitWithImages }
			onAbort={ abortCurrentRequest }
			isLoadingConversation={ isLoadingConversation }
			isDocked={ isDocked }
			isOpen={ isOpen }
			onClose={ onClose }
			onExpand={ onExpand }
			clearSuggestions={ clearSuggestions }
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
		/>
	);
}
