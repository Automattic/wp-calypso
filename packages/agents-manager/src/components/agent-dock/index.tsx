import { getAgentManager } from '@automattic/agenttic-client';
import {
	type MarkdownComponents,
	type MarkdownExtensions,
	type Suggestion,
} from '@automattic/agenttic-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { columns, comment, drawerRight, login } from '@wordpress/icons';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import { useSetupCustomActions } from '../../hooks/custom-actions';
import useAdminBarIntegration from '../../hooks/use-admin-bar-integration';
import useAgentLayoutManager from '../../hooks/use-agent-layout-manager';
import useReaderChatPersistence from '../../hooks/use-reader-chat-persistence';
import { useShouldUseUnifiedAgent } from '../../hooks/use-should-use-unified-agent';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { LocalConversationListItem } from '../../types';
import { isReaderChatAgent } from '../../utils/is-reader-chat-agent';
import { persistLastActivity } from '../../utils/persist-last-activity';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
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
	const { siteKey, agentConfig } = useAgentsManagerContext();

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
	const { setIsOpen, setIsDocked, setIsMinimized, setIsSplitScreen } =
		useDispatch( AGENTS_MANAGER_STORE );
	const {
		isOpen: isPersistedOpen,
		isDocked: isPersistedDocked,
		isMinimized,
		isSplitScreen,
	} = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();

	// `agentConfig` is guaranteed non-null here because `AgentSetup` guards rendering.
	const agentId = agentConfig!.agentId;

	// Reader chat runs on public blog frontends with no wp-admin sidebar. We
	// detect it to hide docking options and skip persisting open/close state to
	// the logged-in REST endpoint.
	const isReaderChat = isReaderChatAgent( agentId );

	const setOpenState = useCallback(
		( isOpen: boolean ) => setIsOpen( isOpen, ! isReaderChat ),
		[ isReaderChat, setIsOpen ]
	);

	const { isDocked, canDock, dock, undock, openSidebar, closeSidebar, createAgentPortal } =
		useAgentLayoutManager( {
			defaultDocked: isReaderChat ? false : isPersistedDocked,
			defaultOpen: isPersistedOpen,
			desktopMediaQuery,
			// Only open the sidebar; keep the current route. Admin-bar items
			// set their own route (e.g. history) before opening it.
			onOpenSidebar: () => {
				recordBigSkyTracksEvent( 'sidebar_open_click' );
				setOpenState( true );
			},
			onCloseSidebar: () => {
				recordBigSkyTracksEvent( 'sidebar_close_click' );
				setOpenState( false );
			},
			onDock: () => {
				recordBigSkyTracksEvent( 'ai_chat_docked' );
			},
			onUndock: () => {
				recordBigSkyTracksEvent( 'ai_chat_undocked' );
			},
			isSplitScreen,
		} );

	// Docked close fires `sidebar_close_click` (via `onCloseSidebar`); undocked
	// close fires `dock_back_button_click`. Matches Big Sky.
	const handleClose = () => {
		if ( isDocked ) {
			closeSidebar();
		} else {
			recordBigSkyTracksEvent( 'dock_back_button_click' );
			setOpenState( false );
		}
	};

	// WP admin bar integration. Returns whether the AI chat entry button is present.
	const hasAiChatEntry = useAdminBarIntegration( {
		closeChat: handleClose,
		// Open/un-minimize the chat panel, leaving the route unchanged.
		maybeOpenChat: () => {
			if ( isMinimized ) {
				setIsMinimized( false );
			}
			// Skip a redundant save when the chat is already open.
			if ( ! isPersistedOpen ) {
				if ( isDocked ) {
					openSidebar();
				} else {
					setOpenState( true );
				}
			}
		},
	} );

	// Route visibility. All are hidden in reader chat (public blog frontends);
	// some add a further requirement, noted below. Ordered to match the routes.
	//
	// `/zendesk` also needs the unified agent or using Woo AI.
	const showZendeskChat = shouldUseUnifiedAgent && ! isReaderChat;
	// `/support-guides` (the list) also needs the unified agent, and is only
	// reachable from the AI chat entry button (WP admin bar or Calypso masterbar).
	const showSupportGuides = shouldUseUnifiedAgent && ! isReaderChat && hasAiChatEntry;
	// `/post` (the viewer) opens a guide or link from in-chat links and sources,
	// so unlike the list it isn't tied to the admin bar.
	const showSupportGuide = ! isReaderChat;
	// `/history` matches the chat header's history button.
	const showChatHistory = ! isReaderChat;

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

	// Persist the reader-chat open state across page loads (no-op for other agents).
	useReaderChatPersistence();

	const handleAbort = useCallback( () => {
		const agentManager = getAgentManager();

		if ( agentManager.hasAgent( agentId ) ) {
			agentManager.abortCurrentRequest( agentId );
		}
	}, [ agentId ] );

	const handleChatHasMessagesChange = useCallback(
		( hasMessages: boolean ) => setIsOrchestratorChatEmpty( ! hasMessages ),
		[]
	);

	const handleExpand = () => {
		recordBigSkyTracksEvent( 'dock_assistant_icon_click' );
		if ( isMinimized ) {
			setIsMinimized( false );
		}
		// Skip a redundant save when the chat is already open (e.g. expanding
		// from the minimized bar).
		if ( ! isPersistedOpen ) {
			setOpenState( true );
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

	const getChatHeaderOptions = (): ChatHeaderOptions => {
		return [
			{
				icon: comment,
				title: __( 'New chat', '__i18n_text_domain__' ),
				isDisabled: pathname === '/chat' && isOrchestratorChatEmpty,
				onClick: () => {
					recordBigSkyTracksEvent( 'ai_chat_more_options_click', {
						type: 'reset_chat',
					} );
					navigate( '/' );
				},
			},
			// Sidebar docking only makes sense in wp-admin where a block-editor
			// sidebar slot exists. On public reader-chat frontends there's no
			// sidebar to dock into — the click does nothing, so hide the option.
			! isReaderChat &&
				isDocked && {
					icon: login,
					title: __( 'Pop out sidebar', '__i18n_text_domain__' ),
					onClick: () => {
						recordBigSkyTracksEvent( 'ai_chat_more_options_click', {
							type: 'undock',
						} );
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
						recordBigSkyTracksEvent( 'ai_chat_more_options_click', {
							type: 'dock',
						} );
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

	// With the AI chat entry button, the chat hides on close and can minimize to
	// the bar. Without one, it stays mounted and collapses to a button instead.
	const isChatVisible = isPersistedOpen || ! hasAiChatEntry;
	const isMinimizedActive = hasAiChatEntry && isMinimized;
	const chatIsOpen = isPersistedOpen && ! isMinimizedActive;

	const OrchestratorChatRoute = (
		<OrchestratorChat
			emptyViewSuggestions={ emptyViewSuggestions }
			isDocked={ isDocked }
			isOpen={ chatIsOpen }
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
			isOpen={ chatIsOpen }
			onClose={ handleClose }
			onExpand={ handleExpand }
			chatHeaderOptions={ chatHeaderOptions }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
		/>
	);

	const HistoryRoute = (
		<AgentHistory
			chatHeaderOptions={ chatHeaderOptions }
			isDocked={ isDocked }
			isOpen={ chatIsOpen }
			onAbort={ handleAbort }
			onClose={ handleClose }
			onExpand={ handleExpand }
			onSelectConversation={ handleSelectConversation }
		/>
	);

	const SupportGuideRoute = (
		<SupportGuide
			onAbort={ handleAbort }
			onClose={ handleClose }
			onExpand={ handleExpand }
			isDocked={ isDocked }
			isOpen={ chatIsOpen }
			chatHeaderOptions={ chatHeaderOptions }
		/>
	);

	const SupportGuidesRoute = (
		<SupportGuides
			onAbort={ handleAbort }
			onClose={ handleClose }
			onExpand={ handleExpand }
			isDocked={ isDocked }
			isOpen={ chatIsOpen }
			chatHeaderOptions={ chatHeaderOptions }
		/>
	);

	return (
		shouldRenderChat &&
		isChatVisible &&
		createAgentPortal(
			// NOTE: Use route state to pass data that needs to be accessed throughout the app.
			<Routes>
				<Route path="/chat" element={ OrchestratorChatRoute } />
				{ showZendeskChat && <Route path="/zendesk" element={ ZendeskChatRoute } /> }
				{ showSupportGuides && <Route path="/support-guides" element={ SupportGuidesRoute } /> }
				{ showSupportGuide && <Route path="/post" element={ SupportGuideRoute } /> }
				{ showChatHistory && <Route path="/history" element={ HistoryRoute } /> }
				<Route path="*" element={ <Navigate to="/chat" state={ { isNewChat: true } } replace /> } />
			</Routes>
		)
	);
}
