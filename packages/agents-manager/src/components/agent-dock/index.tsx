import {
	getAgentManager,
	useAgentChat,
	type UseAgentChatConfig,
} from '@automattic/agenttic-client';
import {
	type MarkdownComponents,
	type MarkdownExtensions,
	type Suggestion,
} from '@automattic/agenttic-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useMemo, useEffect, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { comment, drawerRight, login, lifesaver } from '@wordpress/icons';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LOCAL_TOOL_RUNNING_MESSAGE } from '../../constants';
import { useAgentsManagerContext } from '../../contexts';
import useAdminBarIntegration from '../../hooks/use-admin-bar-integration';
import useAgentLayoutManager from '../../hooks/use-agent-layout-manager';
import useConversation from '../../hooks/use-conversation';
import useSetupCustomActions from '../../hooks/use-setup-custom-actions';
import { useShouldUseUnifiedAgent } from '../../hooks/use-should-use-unified-agent';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { LocalConversationListItem } from '../../types';
import { setSessionId, getSessionId as getStoredSessionId } from '../../utils/agent-session';
import { convertToolMessagesToComponents } from '../../utils/convert-tool-message-to-component';
import AgentChat from '../agent-chat';
import AgentHistory from '../agent-history';
import { type Options as ChatHeaderOptions } from '../chat-header';
import SupportGuide from '../support-guide';
import SupportGuides from '../support-guides';
import { ZendeskChat } from '../zendesk-chat';
import type { BigSkyMessage } from '../../types';
import type {
	NavigationContinuationHook,
	AbilitiesSetupHook,
	GetChatComponent,
	UseSuggestionsHook,
	SiteBuildUtils,
	ImageUploadHook,
} from '../../utils/load-external-providers';
import type { AgentsManagerSelect } from '@automattic/data-stores';

interface AgentDockProps {
	/** Agent configuration for the chat client. */
	agentConfig: UseAgentChatConfig;
	/** Suggestions displayed when the chat is empty. */
	emptyViewSuggestions?: Suggestion[];
	/** Custom components for rendering markdown. */
	markdownComponents?: MarkdownComponents;
	/** Custom markdown extensions. */
	markdownExtensions?: MarkdownExtensions;
	/** Navigation continuation hook for post-navigation conversation resumption. */
	useNavigationContinuation?: NavigationContinuationHook;
	/** Hook for setting up abilities that utilize React context. Invoked after custom actions registration. */
	useAbilitiesSetup?: AbilitiesSetupHook;
	/** Hook for providing dynamic suggestions based on context (e.g., selected block). */
	useSuggestions?: UseSuggestionsHook;
	/** Get a chat component by type for rendering in agent messages. */
	getChatComponent?: GetChatComponent;
	siteBuildUtils?: SiteBuildUtils;
	/** Hook for handling image uploads within the agent chat. */
	useImageUpload?: ImageUploadHook;
}

export default function AgentDock( {
	agentConfig,
	emptyViewSuggestions = [],
	markdownComponents = {},
	markdownExtensions = {},
	useNavigationContinuation,
	useAbilitiesSetup,
	getChatComponent,
	useSuggestions,
	siteBuildUtils,
	useImageUpload,
}: AgentDockProps ) {
	const { site, sectionName, isEligibleForChat } = useAgentsManagerContext();
	const [ isThinking, setIsThinking ] = useState( false );
	const [ thinkingMessage, setThinkingMessage ] = useState< string | null >( null );
	const [ isBuildingSite, setIsBuildingSite ] = useState( false );
	const [ deletedMessageIds, setDeletedMessageIds ] = useState< Set< string > >( new Set() );
	const [ inputValue, setInputValue ] = useState( '' );
	const [ isCompactMode, setIsCompactMode ] = useState( false );
	const [ shouldRenderChat, setShouldRenderChat ] = useState( true );
	const { setIsOpen, setIsDocked } = useDispatch( AGENTS_MANAGER_STORE );
	const shouldUseAgentsManager = useShouldUseUnifiedAgent();
	const {
		hasLoaded: isStoreReady,
		isOpen: isPersistedOpen = false,
		isDocked: isPersistedDocked = false,
	} = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );
	const { pathname } = useLocation();
	const navigate = useNavigate();

	const sessionId = agentConfig.sessionId;
	const agentId = agentConfig.agentId;

	const { isDocked, canDock, dock, undock, openSidebar, closeSidebar, createAgentPortal } =
		useAgentLayoutManager( {
			isReady: isStoreReady,
			defaultDocked: isPersistedDocked,
			defaultOpen: isPersistedOpen,
			onOpenSidebar: () => {
				setIsOpen( true );
				if ( pathname === '/history' ) {
					navigate( '/' );
				}
			},
			onCloseSidebar: () => setIsOpen( false ),
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
	} = useAgentChat( agentConfig );

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

	// Use dynamic suggestions from the external provider (e.g., Big Sky block-based suggestions)
	const dynamicSuggestions = useSuggestions?.();

	// Register dynamic suggestions whenever they change
	useEffect( () => {
		const suggestions = dynamicSuggestions?.suggestions;

		if ( suggestions && suggestions.length > 0 ) {
			registerSuggestions?.( suggestions );
		} else {
			// Clear suggestions when there are none
			clearSuggestions?.();
		}
	}, [ dynamicSuggestions?.suggestions, registerSuggestions, clearSuggestions ] );

	const { isLoading: isLoadingConversation } = useConversation( {
		agentId,
		sessionId,
		authProvider: agentConfig.authProvider,
		onSuccess: ( messages, serverSessionId ) => {
			// Update the UI with the loaded messages
			loadMessages( messages );
			// Make sure future messages go to the right session
			getAgentManager().updateSessionId( agentId, serverSessionId );

			// Sync local session ID with the server's
			if ( sessionId !== serverSessionId ) {
				setSessionId( serverSessionId, agentId );
				navigate( '/chat', { state: { sessionId: serverSessionId }, replace: true } );
			}
		},
	} );

	// Handle navigation continuation if hook is provided
	// This allows to resume conversations after full page navigation
	useNavigationContinuation?.( {
		isProcessing,
		onSubmit,
		sessionId,
		agentId,
	} );

	// Handle WordPress admin bar integration
	useAdminBarIntegration( {
		isOpen: isPersistedOpen,
		sectionName,
		setIsOpen,
		navigate,
	} );

	// Invoke abilities setup hook to register hook-based abilities that utilize React context.
	// Provides custom action handlers for agent and chat interaction within Big Sky's AI store.
	// The hook is stable as `AgentDock` only renders after external providers have been loaded.
	useAbilitiesSetup?.( {
		addMessage: ( message: BigSkyMessage ) => {
			// Transform Big Sky message format to UIMessage format and add to chat
			addMessage( {
				// Keep BigSky message properties without explicit mapping to keep linter happy
				// BigSky messages sometimes have a 'context' field used by the
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

	useSetupCustomActions( {
		dock,
		undock,
		openSidebar,
		closeSidebar,
		setIsCompactMode,
		setShouldRenderChat,
	} );

	const handleNewChat = () => {
		navigate( '/' );
	};

	const handleExpand = () => {
		setIsOpen( true );
		if ( pathname === '/history' ) {
			navigate( '/' );
		}
	};

	const handleSelectConversation = ( conversation: LocalConversationListItem ) => {
		if ( conversation.is_zendesk ) {
			navigate( '/zendesk', { state: { conversationId: conversation.conversation_id } } );
		} else {
			const sessionId = conversation.session_id || '';

			abortCurrentRequest();
			setSessionId( sessionId, agentId );
			navigate( '/chat', { state: { sessionId } } );
		}
	};

	const getChatHeaderOptions = (): ChatHeaderOptions => {
		const newChatMenuItem = {
			icon: comment,
			title: __( 'New chat', '__i18n_text_domain__' ),
			isDisabled: pathname === '/chat' && ! messages.length,
			onClick: handleNewChat,
		};
		const newZDChatMenuItem = {
			icon: lifesaver,
			title: __( 'New Zendesk chat', '__i18n_text_domain__' ),
			isDisabled: pathname === '/zendesk' && ! messages.length,
			onClick: () => navigate( '/zendesk' ),
		};
		const undockMenuItem = {
			icon: login,
			title: __( 'Pop out sidebar', '__i18n_text_domain__' ),
			onClick: () => {
				undock();
				setIsDocked( false );
			},
		};
		const dockMenuItem = {
			icon: drawerRight,
			title: __( 'Move to sidebar', '__i18n_text_domain__' ),
			onClick: () => {
				dock();
				setIsDocked( true );
			},
		};

		const options: ChatHeaderOptions = [ newChatMenuItem ];

		if ( shouldUseAgentsManager ) {
			options.push( newZDChatMenuItem );
		}

		if ( isDocked ) {
			options.push( undockMenuItem );
		} else if ( canDock ) {
			options.push( dockMenuItem );
		}

		return options;
	};

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

	const Chat = (
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
			isOpen={ isPersistedOpen }
			onClose={ isDocked ? closeSidebar : () => setIsOpen( false ) }
			onExpand={ handleExpand }
			clearSuggestions={ clearSuggestions }
			chatHeaderOptions={ getChatHeaderOptions() }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
			inputValue={ inputValue }
			onInputChange={ setInputValue }
			isCompactMode={ isCompactMode }
			imageUpload={ imageUpload }
		/>
	);

	const ZendeskChatRoute = (
		<ZendeskChat
			isDocked={ isDocked }
			isOpen={ isPersistedOpen }
			onClose={ isDocked ? closeSidebar : () => setIsOpen( false ) }
			onExpand={ () => setIsOpen( true ) }
			chatHeaderOptions={ getChatHeaderOptions() }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
		/>
	);

	const History = (
		<AgentHistory
			agentId={ agentId }
			authProvider={ agentConfig.authProvider }
			chatHeaderOptions={ getChatHeaderOptions() }
			isDocked={ isDocked }
			isOpen={ isPersistedOpen }
			onSubmit={ onSubmit }
			onAbort={ abortCurrentRequest }
			onClose={ isDocked ? closeSidebar : () => setIsOpen( false ) }
			onExpand={ handleExpand }
			onSelectConversation={ handleSelectConversation }
			onNewChat={ handleNewChat }
		/>
	);

	const SupportGuideRoute = (
		<SupportGuide
			isEligibleForChat={ isEligibleForChat }
			onAbort={ abortCurrentRequest }
			onClose={ closeSidebar }
			isOpen={ isPersistedOpen }
			sectionName={ sectionName }
			currentSiteDomain={ site?.domain }
			chatHeaderOptions={ getChatHeaderOptions() }
			isChatDocked={ isDocked }
		/>
	);

	const SupportGuidesRoute = (
		<SupportGuides
			onAbort={ abortCurrentRequest }
			onClose={ closeSidebar }
			isOpen={ isPersistedOpen }
			chatHeaderOptions={ getChatHeaderOptions() }
			isChatDocked={ isDocked }
		/>
	);

	return (
		shouldRenderChat &&
		createAgentPortal(
			// NOTE: Use route state to pass data that needs to be accessed throughout the app.
			<Routes>
				<Route path="/chat" element={ Chat } />
				<Route path="/post" element={ SupportGuideRoute } />
				<Route path="/zendesk" element={ ZendeskChatRoute } />
				<Route path="/support-guides" element={ SupportGuidesRoute } />
				<Route path="/history" element={ History } />
				<Route path="*" element={ <Navigate to="/chat" state={ { isNewChat: true } } replace /> } />
			</Routes>
		)
	);
}
