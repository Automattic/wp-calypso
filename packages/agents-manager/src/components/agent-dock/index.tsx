import { type UseAgentChatConfig } from '@automattic/agenttic-client';
import {
	type MarkdownComponents,
	type MarkdownExtensions,
	type Suggestion,
} from '@automattic/agenttic-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { comment, drawerRight, login, lifesaver } from '@wordpress/icons';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import useAdminBarIntegration from '../../hooks/use-admin-bar-integration';
import useAgentLayoutManager from '../../hooks/use-agent-layout-manager';
import useSetupCustomActions from '../../hooks/use-setup-custom-actions';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { LocalConversationListItem } from '../../types';
import { setSessionId } from '../../utils/agent-session';
import AgentHistory from '../agent-history';
import { type Options as ChatHeaderOptions } from '../chat-header';
import OrchestratorChat, { type OrchestratorChatHandle } from '../orchestrator-chat';
import SupportGuide from '../support-guide';
import SupportGuides from '../support-guides';
import ZendeskChat, { type ZendeskChatHandle } from '../zendesk-chat';
import type {
	NavigationContinuationHook,
	AbilitiesSetupHook,
	GetChatComponent,
	UseSuggestionsHook,
	SiteBuildUtils,
} from '../../utils/load-external-providers';
import type { AgentsManagerSelect } from '@automattic/data-stores';
import './style.scss';

interface Props {
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
	/** Utilities for site building flow (e.g., progress tracking, site preview). */
	siteBuildUtils?: SiteBuildUtils;
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
}: Props ) {
	const { site, sectionName, isEligibleForChat } = useAgentsManagerContext();
	const [ isCompactMode, setIsCompactMode ] = useState( false );
	const [ shouldRenderChat, setShouldRenderChat ] = useState( true );
	const orchestratorChatRef = useRef< OrchestratorChatHandle >( null );
	const zendeskChatRef = useRef< ZendeskChatHandle >( null );
	const { setIsOpen, setIsDocked } = useDispatch( AGENTS_MANAGER_STORE );
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

	// Handle WordPress admin bar integration
	useAdminBarIntegration( {
		isOpen: isPersistedOpen,
		sectionName,
		setIsOpen,
		navigate,
	} );

	useSetupCustomActions( {
		dock,
		undock,
		openSidebar,
		closeSidebar,
		setIsCompactMode,
		setShouldRenderChat,
	} );

	const handleAbort = () => orchestratorChatRef.current?.abortCurrentRequest();

	const handleNewChat = () => navigate( '/' );

	const handleClose = isDocked ? closeSidebar : () => setIsOpen( false );

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

			orchestratorChatRef.current?.abortCurrentRequest();
			setSessionId( sessionId, agentId );
			navigate( '/chat', { state: { sessionId } } );
		}
	};

	const getChatHeaderOptions = (): ChatHeaderOptions => {
		const orchestratorMessagesCount = orchestratorChatRef.current?.getMessagesCount() ?? 0;
		const zendeskMessagesCount = zendeskChatRef.current?.getMessagesCount() ?? 0;

		return [
			{
				icon: comment,
				title: __( 'New chat', '__i18n_text_domain__' ),
				isDisabled: pathname === '/chat' && ! orchestratorMessagesCount,
				onClick: handleNewChat,
			},
			{
				icon: lifesaver,
				title: __( 'New Zendesk chat', '__i18n_text_domain__' ),
				isDisabled: pathname === '/zendesk' && ! zendeskMessagesCount,
				onClick: () => {
					handleAbort();
					navigate( '/zendesk' );
				},
			},
			isDocked && {
				icon: login,
				title: __( 'Pop out sidebar', '__i18n_text_domain__' ),
				onClick: () => {
					undock();
					setIsDocked( false );
				},
			},
			! isDocked &&
				canDock && {
					icon: drawerRight,
					title: __( 'Move to sidebar', '__i18n_text_domain__' ),
					onClick: () => {
						dock();
						setIsDocked( true );
					},
				},
		].filter( Boolean ) as ChatHeaderOptions;
	};

	const chatHeaderOptions = getChatHeaderOptions();

	const OrchestratorChatRoute = (
		<OrchestratorChat
			ref={ orchestratorChatRef }
			agentConfig={ agentConfig }
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
			navigate={ navigate }
		/>
	);

	const ZendeskChatRoute = (
		<ZendeskChat
			ref={ zendeskChatRef }
			isDocked={ isDocked }
			isOpen={ isPersistedOpen }
			onClose={ handleClose }
			onExpand={ handleExpand }
			chatHeaderOptions={ chatHeaderOptions }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
		/>
	);

	const HistoryRoute = (
		<AgentHistory
			agentId={ agentId }
			authProvider={ agentConfig.authProvider }
			chatHeaderOptions={ chatHeaderOptions }
			isDocked={ isDocked }
			isOpen={ isPersistedOpen }
			onAbort={ handleAbort }
			onClose={ handleClose }
			onExpand={ handleExpand }
			onSelectConversation={ handleSelectConversation }
			onNewChat={ handleNewChat }
		/>
	);

	const SupportGuideRoute = (
		<SupportGuide
			isEligibleForChat={ isEligibleForChat }
			onAbort={ handleAbort }
			onClose={ closeSidebar }
			isOpen={ isPersistedOpen }
			sectionName={ sectionName }
			currentSiteDomain={ site?.domain }
			chatHeaderOptions={ chatHeaderOptions }
			isChatDocked={ isDocked }
		/>
	);

	const SupportGuidesRoute = (
		<SupportGuides
			onAbort={ handleAbort }
			onClose={ closeSidebar }
			isOpen={ isPersistedOpen }
			chatHeaderOptions={ chatHeaderOptions }
			isChatDocked={ isDocked }
		/>
	);

	return (
		shouldRenderChat &&
		createAgentPortal(
			// NOTE: Use route state to pass data that needs to be accessed throughout the app.
			<Routes>
				<Route path="/chat" element={ OrchestratorChatRoute } />
				<Route path="/post" element={ SupportGuideRoute } />
				<Route path="/zendesk" element={ ZendeskChatRoute } />
				<Route path="/support-guides" element={ SupportGuidesRoute } />
				<Route path="/history" element={ HistoryRoute } />
				<Route path="*" element={ <Navigate to="/chat" state={ { isNewChat: true } } replace /> } />
			</Routes>
		)
	);
}
