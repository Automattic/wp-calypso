import { type AuthProvider } from '@automattic/agenttic-client';
import { useManagedOdieChat } from '@automattic/odie-client';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState, useRef, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { comment, drawerRight, login } from '@wordpress/icons';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { createCalypsoAuthProvider } from '../../auth/calypso-auth-provider';
import useAgentLayoutManager from '../../hooks/use-agent-layout-manager';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { loadExternalProviders, type LoadedProviders } from '../../utils/load-external-providers';
import AgentChat from '../agent-chat';
import AgentHistory from '../agent-history';
import { type Options as ChatHeaderOptions } from '../chat-header';
import OrchestratorAgentChat from '../orchestrator-agent-chat';
import SupportGuide from '../support-guide';
import SupportGuides from '../support-guides';
import type { AgentsManagerSelect, HelpCenterSite } from '@automattic/data-stores';

interface AgentDockProps {
	/** The selected site object. */
	site?: HelpCenterSite | null;
	/** The current route path. */
	currentRoute?: string;
	/** The name of the current section (e.g., 'posts', 'pages'). */
	sectionName: string;
	/** Indicates if the user is eligible for chat. */
	isEligibleForChat: boolean;
}

export default function AgentDock( {
	site,
	currentRoute,
	sectionName,
	isEligibleForChat,
}: AgentDockProps ) {
	const navigate = useNavigate();
	const providersLoadedRef = useRef( false );
	const [ loadedProviders, setLoadedProviders ] = useState< LoadedProviders >( {} );

	const { setIsOpen } = useDispatch( AGENTS_MANAGER_STORE );
	const { hasLoaded: isStoreReady, isOpen = false } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	const { isDocked, isDesktop, dock, undock, closeSidebar, createAgentPortal } =
		useAgentLayoutManager();

	const authProvider: AuthProvider = useMemo(
		() => createCalypsoAuthProvider( site?.ID ),
		[ site?.ID ]
	);

	// Default suggestions - can be overridden by loaded providers
	const defaultSuggestions = useMemo(
		() => [
			{
				id: 'getting-started',
				label: 'Getting started with WordPress',
				prompt: 'How do I get started with WordPress?',
			},
			{
				id: 'create-post',
				label: 'Create a blog post',
				prompt: 'How do I create a blog post?',
			},
			{
				id: 'customize-site',
				label: 'Customize my site',
				prompt: 'How can I customize my site?',
			},
		],
		[]
	);

	const {
		messages: odieMessages,
		isProcessing: isOdieProcessing,
		sendMessage: sendOdieMessage,
	} = useManagedOdieChat();

	const getChatHeaderOptions = (): ChatHeaderOptions => {
		const newChatMenuItem = {
			icon: comment,
			title: __( 'New chat', '__i18n_text_domain__' ),
			onClick: () => navigate( '/' ),
		};
		const undockMenuItem = {
			icon: login,
			title: __( 'Pop out sidebar', '__i18n_text_domain__' ),
			onClick: () => {
				// TODO: Persist floating chat position...
				try {
					window.localStorage?.setItem( 'agenttic-chat-position', 'right' );
				} catch ( err ) {
					// Ignore errors
				}

				undock();
			},
		};
		const dockMenuItem = {
			icon: drawerRight,
			title: __( 'Move to sidebar', '__i18n_text_domain__' ),
			onClick: dock,
		};

		const options: ChatHeaderOptions = [ newChatMenuItem ];

		if ( isDocked ) {
			options.push( undockMenuItem );
		} else if ( isDesktop ) {
			options.push( dockMenuItem );
		}

		return options;
	};

	useEffect( () => {
		const loadProviders = async () => {
			if ( ! providersLoadedRef.current ) {
				const providers = await loadExternalProviders();
				providersLoadedRef.current = true;
				setLoadedProviders( providers );
			}
		};

		loadProviders();
	}, [] );

	const OrchestratorChat = (
		<OrchestratorAgentChat
			authProvider={ authProvider }
			currentRoute={ currentRoute }
			isDocked={ isDocked }
			closeSidebar={ closeSidebar }
			chatHeaderOptions={ getChatHeaderOptions() }
			defaultSuggestions={ defaultSuggestions }
			loadedProviders={ loadedProviders }
		/>
	);

	const OdieChat = (
		<AgentChat
			messages={ odieMessages }
			suggestions={ [] }
			isProcessing={ isOdieProcessing }
			error={ null }
			onSubmit={ sendOdieMessage }
			onAbort={ () => {} }
			isLoadingConversation={ false }
			isDocked={ isDocked }
			isOpen={ isOpen }
			onClose={ isDocked ? closeSidebar : () => setIsOpen( false ) }
			onExpand={ () => setIsOpen( true ) }
			chatHeaderOptions={ getChatHeaderOptions() }
			markdownComponents={ loadedProviders.markdownComponents }
			markdownExtensions={ loadedProviders.markdownExtensions }
			emptyViewSuggestions={ loadedProviders.suggestions || defaultSuggestions }
		/>
	);

	const History = (
		<AgentHistory
			authProvider={ authProvider }
			chatHeaderOptions={ getChatHeaderOptions() }
			isDocked={ isDocked }
			isOpen={ isOpen }
			onClose={ isDocked ? closeSidebar : () => setIsOpen( false ) }
			onExpand={ () => setIsOpen( true ) }
		/>
	);

	const SupportGuideRoute = (
		<SupportGuide
			isEligibleForChat={ isEligibleForChat }
			onClose={ closeSidebar }
			isOpen={ isOpen }
			sectionName={ sectionName }
			currentSiteDomain={ site?.domain }
			chatHeaderOptions={ getChatHeaderOptions() }
			isChatDocked={ isDocked }
		/>
	);

	const SupportGuidesRoute = (
		<SupportGuides
			onClose={ closeSidebar }
			isOpen={ isOpen }
			chatHeaderOptions={ getChatHeaderOptions() }
			isChatDocked={ isDocked }
		/>
	);

	if ( ! isStoreReady ) {
		return null;
	}

	return createAgentPortal(
		<Routes>
			<Route path="/chat/:sessionId?" element={ OrchestratorChat } />
			<Route path="/odie/:sessionId?" element={ OdieChat } />
			<Route path="/post" element={ SupportGuideRoute } />
			<Route path="/support-guides" element={ SupportGuidesRoute } />
			<Route path="/history" element={ History } />
			<Route path="*" element={ <Navigate to="/chat" replace /> } />
		</Routes>
	);
}
