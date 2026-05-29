import { getAgentManager } from '@automattic/agenttic-client';
import {
	type MarkdownComponents,
	type MarkdownExtensions,
	type Suggestion,
} from '@automattic/agenttic-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { columns, comment, drawerRight, help, login, lifesaver } from '@wordpress/icons';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import useAdminBarIntegration from '../../hooks/use-admin-bar-integration';
import useAgentLayoutManager from '../../hooks/use-agent-layout-manager';
import useSetupCustomActions from '../../hooks/use-setup-custom-actions';
import { useShouldUseUnifiedAgent } from '../../hooks/use-should-use-unified-agent';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { LocalConversationListItem } from '../../types';
import { isReaderChatAgent } from '../../utils/is-reader-chat-agent';
import { isJetpackAiSidebarPreviewFeatureEnabled } from '../../utils/jetpack-ai-sidebar-preview';
import { persistLastActivity } from '../../utils/persist-last-activity';
import AgentHistory from '../agent-history';
import { type Options as ChatHeaderOptions } from '../chat-header';
import OrchestratorChat from '../orchestrator-chat';
import SupportGuide from '../support-guide';
import SupportGuides from '../support-guides';
import ZendeskChat from '../zendesk-chat';
import type {
	NavigationContinuationHook,
	AbilitiesSetupHook,
	GetChatComponent,
	UseSuggestionsHook,
	SiteBuildUtils,
	ImageUploadHook,
	UseCheckpointHook,
	ProviderCapabilities,
} from '../../utils/load-external-providers';
import type { AgentsManagerSelect } from '@automattic/data-stores';
import './style.scss';

interface Props {
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
	/** Utilities for site building flow (e.g., progress tracking, site preview). */
	siteBuildUtils?: SiteBuildUtils;
	/** Hook for handling image uploads within the agent chat. */
	useImageUpload?: ImageUploadHook;
	/** Hook for saving and restoring editor state so that AI actions can be undone. */
	useCheckpoint?: UseCheckpointHook;
	/** Optional capability flags declared by one or more loaded providers. */
	capabilities?: ProviderCapabilities;
}

export default function AgentDock( {
	emptyViewSuggestions = [],
	markdownComponents = {},
	markdownExtensions = {},
	useNavigationContinuation,
	useAbilitiesSetup,
	getChatComponent,
	useSuggestions,
	siteBuildUtils,
	useImageUpload,
	useCheckpoint,
	capabilities,
}: Props ) {
	const { siteKey, sectionName, agentConfig } = useAgentsManagerContext();

	const [ isCompactMode, setIsCompactMode ] = useState(
		window.__agentsManagerActions?.isCompactMode ?? false
	);
	const [ shouldRenderChat, setShouldRenderChat ] = useState(
		window.__agentsManagerActions?.isChatEnabled ?? true
	);
	const [ desktopMediaQuery, setDesktopMediaQuery ] = useState< string | undefined >(
		window.__agentsManagerActions?.desktopMediaQuery
	);
	const [ isOrchestratorChatEmpty, setIsOrchestratorChatEmpty ] = useState( true );
	const [ isZendeskChatEmpty, setIsZendeskChatEmpty ] = useState( true );
	const { setIsOpen, setIsDocked, setIsSplitScreen } = useDispatch( AGENTS_MANAGER_STORE );
	const {
		isOpen: isPersistedOpen = false,
		isDocked: isPersistedDocked = false,
		isSplitScreen = false,
	} = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();

	// `agentConfig` is guaranteed non-null here because AgentSetup guards rendering
	const agentId = agentConfig!.agentId;
	// Reader-chat runs on public blog frontends where there's no wp-admin
	// sidebar to dock into. Detect that context so we can hide options that
	// don't apply and avoid persisting open/close state through the logged-in
	// Agents Manager REST state endpoint.
	const isReaderChat = isReaderChatAgent( agentId );
	const showChatHistory =
		! isReaderChat && isJetpackAiSidebarPreviewFeatureEnabled( 'chatHistory' );
	const showSupportGuides =
		! isReaderChat && isJetpackAiSidebarPreviewFeatureEnabled( 'supportGuides' );
	const setOpenState = useCallback(
		( isOpen: boolean ) => setIsOpen( isOpen, ! isReaderChat ),
		[ isReaderChat, setIsOpen ]
	);

	const { isDocked, canDock, dock, undock, openSidebar, closeSidebar, createAgentPortal } =
		useAgentLayoutManager( {
			defaultDocked: isReaderChat ? false : isPersistedDocked,
			defaultOpen: isPersistedOpen,
			desktopMediaQuery,
			onOpenSidebar: () => setOpenState( true ),
			onCloseSidebar: () => setOpenState( false ),
			isSplitScreen,
		} );

	// Handle WordPress admin bar integration
	useAdminBarIntegration( {
		isOpen: isPersistedOpen,
		sectionName,
		maybeOpenChat: () => {
			if ( ! isPersistedOpen ) {
				if ( isDocked ) {
					openSidebar();
				} else {
					setOpenState( true );
				}
			}
		},
		navigate,
	} );

	useSetupCustomActions( {
		canDock,
		dock,
		undock,
		openSidebar,
		closeSidebar,
		setIsCompactMode,
		setShouldRenderChat,
		setDesktopMediaQuery,
	} );

	const handleAbort = useCallback( () => {
		const agentManager = getAgentManager();

		if ( agentManager.hasAgent( agentId ) ) {
			agentManager.abortCurrentRequest( agentId );
		}
	}, [ agentId ] );

	// Woo AI sites (sectionName 'wooai-admin') don't have HVM tagging yet,
	// so Zendesk escalation is disabled until routing is in place.
	const isWooAiAdmin = sectionName === 'wooai-admin';
	const shouldShowUnifiedSupport = shouldUseUnifiedAgent && ! isReaderChat && ! isWooAiAdmin;

	const handleChatHasMessagesChange = useCallback(
		( hasMessages: boolean ) => setIsOrchestratorChatEmpty( ! hasMessages ),
		[]
	);
	const handleZendeskHasMessagesChange = useCallback(
		( hasMessages: boolean ) => setIsZendeskChatEmpty( ! hasMessages ),
		[]
	);

	const handleClose = isDocked ? closeSidebar : () => setOpenState( false );

	const handleExpand = () => {
		setOpenState( true );
		if ( pathname === '/history' ) {
			navigate( '/' );
		}
	};

	const handleSelectConversation = ( conversation: LocalConversationListItem ) => {
		if ( conversation.is_zendesk ) {
			if ( isReaderChat ) {
				return;
			}
			navigate( '/zendesk', { state: { conversationId: conversation.conversation_id } } );
		} else {
			const sessionId = conversation.session_id || '';

			persistLastActivity( siteKey );
			handleAbort();
			navigate( '/chat', { state: { sessionId } } );
		}
	};

	// Persist reader-chat open/closed state across page navigations via
	// localStorage — the AGENTS_MANAGER_STORE is in-memory only, so a fresh
	// page load resets isOpen to false by default. Read the stored flag on
	// mount and restore; write it on every toggle.
	const OPEN_STORAGE_KEY = `jetpack-reader-chat-open-${ agentId }`;
	useEffect( () => {
		if ( ! isReaderChat ) {
			return;
		}
		try {
			if ( localStorage.getItem( OPEN_STORAGE_KEY ) === '1' && ! isPersistedOpen ) {
				setOpenState( true );
			}
		} catch {
			// ignore
		}
		// Only restore on first mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
	useEffect( () => {
		if ( ! isReaderChat ) {
			return;
		}
		try {
			if ( isPersistedOpen ) {
				localStorage.setItem( OPEN_STORAGE_KEY, '1' );
			} else {
				localStorage.removeItem( OPEN_STORAGE_KEY );
			}
		} catch {
			// ignore
		}
	}, [ isPersistedOpen, isReaderChat, OPEN_STORAGE_KEY ] );

	const getChatHeaderOptions = (): ChatHeaderOptions => {
		return [
			{
				icon: comment,
				title: __( 'New chat', '__i18n_text_domain__' ),
				isDisabled: pathname === '/chat' && isOrchestratorChatEmpty,
				onClick: () => navigate( '/' ),
			},
			shouldShowUnifiedSupport && {
				icon: lifesaver,
				title: __( 'New Zendesk chat', '__i18n_text_domain__' ),
				isDisabled: pathname === '/zendesk' && isZendeskChatEmpty,
				onClick: () => {
					handleAbort();
					navigate( '/zendesk' );
				},
			},
			showSupportGuides && {
				icon: help,
				title: __( 'Support guides', '__i18n_text_domain__' ),
				isDisabled: pathname === '/support-guides',
				onClick: () => navigate( '/support-guides' ),
			},
			// Sidebar docking only makes sense in wp-admin where a block-editor
			// sidebar slot exists. On public reader-chat frontends there's no
			// sidebar to dock into — the click does nothing, so hide the option.
			! isReaderChat &&
				isDocked && {
					icon: login,
					title: __( 'Pop out sidebar', '__i18n_text_domain__' ),
					onClick: () => {
						undock();
						setIsDocked( false );
					},
				},
			! isReaderChat &&
				! isDocked &&
				canDock && {
					icon: drawerRight,
					title: __( 'Move to sidebar', '__i18n_text_domain__' ),
					onClick: () => {
						dock();
						setIsDocked( true );
					},
				},
			// Split-screen toggle — gated to providers that opt in via
			// `capabilities.supportsSplitScreen`. Only visible while the
			// sidebar is docked (at 50vw the floating modal would be redundant).
			isDocked &&
				capabilities?.supportsSplitScreen && {
					icon: columns,
					title: isSplitScreen
						? __( 'Exit split screen', '__i18n_text_domain__' )
						: __( 'Split screen sidebar', '__i18n_text_domain__' ),
					onClick: () => setIsSplitScreen( ! isSplitScreen ),
				},
		].filter( Boolean ) as ChatHeaderOptions;
	};

	const chatHeaderOptions = getChatHeaderOptions();

	const OrchestratorChatRoute = (
		<OrchestratorChat
			emptyViewSuggestions={ emptyViewSuggestions }
			isDocked={ isDocked }
			isOpen={ isPersistedOpen }
			onClose={ handleClose }
			onExpand={ handleExpand }
			chatHeaderOptions={ chatHeaderOptions }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
			isCompactMode={ isCompactMode }
			useNavigationContinuation={ useNavigationContinuation }
			useAbilitiesSetup={ useAbilitiesSetup }
			useSuggestions={ useSuggestions }
			getChatComponent={ getChatComponent }
			siteBuildUtils={ siteBuildUtils }
			useImageUpload={ useImageUpload }
			useCheckpoint={ useCheckpoint }
			onHasMessagesChange={ handleChatHasMessagesChange }
		/>
	);

	const ZendeskChatRoute = (
		<ZendeskChat
			isDocked={ isDocked }
			isOpen={ isPersistedOpen }
			onClose={ handleClose }
			onExpand={ handleExpand }
			chatHeaderOptions={ chatHeaderOptions }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
			onHasMessagesChange={ handleZendeskHasMessagesChange }
		/>
	);

	const HistoryRoute = (
		<AgentHistory
			chatHeaderOptions={ chatHeaderOptions }
			isDocked={ isDocked }
			isOpen={ isPersistedOpen }
			onAbort={ handleAbort }
			onClose={ handleClose }
			onExpand={ handleExpand }
			onSelectConversation={ handleSelectConversation }
		/>
	);

	const SupportGuideRoute = (
		<SupportGuide
			onAbort={ handleAbort }
			onClose={ closeSidebar }
			isDocked={ isDocked }
			isOpen={ isPersistedOpen }
			chatHeaderOptions={ chatHeaderOptions }
		/>
	);

	const SupportGuidesRoute = (
		<SupportGuides
			onAbort={ handleAbort }
			onClose={ closeSidebar }
			isDocked={ isDocked }
			isOpen={ isPersistedOpen }
			chatHeaderOptions={ chatHeaderOptions }
		/>
	);

	return (
		shouldRenderChat &&
		createAgentPortal(
			// NOTE: Use route state to pass data that needs to be accessed throughout the app.
			<Routes>
				<Route path="/chat" element={ OrchestratorChatRoute } />
				{ showSupportGuides && <Route path="/post" element={ SupportGuideRoute } /> }
				{ shouldShowUnifiedSupport && <Route path="/zendesk" element={ ZendeskChatRoute } /> }
				{ showSupportGuides && <Route path="/support-guides" element={ SupportGuidesRoute } /> }
				{ showChatHistory && <Route path="/history" element={ HistoryRoute } /> }
				<Route path="*" element={ <Navigate to="/chat" state={ { isNewChat: true } } replace /> } />
			</Routes>
		)
	);
}
