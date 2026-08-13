import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	type AgentsManagerSite,
	type CurrentUser,
	AgentsManagerSelect,
} from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo } from '@wordpress/element';
import EditorAiChatButton from './components/editor-ai-chat-button';
import OrchestratorChat from './components/orchestrator-chat';
import { PersistentRouter } from './components/persistent-router';
import { AgentsManagerContextProvider, useAgentsManagerContext } from './contexts';
import { useRegisterCustomActions } from './hooks/custom-actions/use-register-custom-actions';
import useAgentLayoutManager from './hooks/use-agent-layout-manager';
import { useOpenChatUrlParam } from './hooks/use-open-chat-url-param';
import useWritingAiChatEntryButton from './hooks/use-writing-ai-chat-entry-button';
import { AGENTS_MANAGER_STORE } from './stores';
import { createWritingOnlyAgentConfig } from './utils/create-writing-only-agent-config';
import type { LoadedProviders } from './utils/load-external-providers';
import type { JSX } from 'react';
import './components/agent-dock/style.scss';

export interface WritingOnlyAgentsManagerProps {
	sectionName: string;
	provider: LoadedProviders & { providerId: string };
	currentUser?: CurrentUser;
	site?: AgentsManagerSite | null;
	currentSiteId?: number;
}

const queryClient = new QueryClient();
const EMPTY_HEADER_OPTIONS: [] = [];
const NOOP = () => {};

/**
 * Gutenberg shell for Jetpack writing tools. It intentionally does not import
 * AgentDock, the provider merger, Agents Manager abilities, or any Big Sky code.
 */
export default function WritingOnlyAgentsManager( {
	sectionName,
	provider,
	currentUser,
	site,
	currentSiteId,
}: WritingOnlyAgentsManagerProps ): JSX.Element | null {
	const hasLoaded = useSelect(
		( select ) =>
			( select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect ).getAgentsManagerState().hasLoaded,
		[]
	);
	const isOpenParamHandled = useOpenChatUrlParam();

	if ( ! hasLoaded || ! isOpenParamHandled ) {
		return null;
	}

	const siteKey = currentSiteId ? String( currentSiteId ) : 'no-site';

	return (
		<QueryClientProvider client={ queryClient }>
			<PersistentRouter siteKey={ siteKey }>
				<AgentsManagerContextProvider value={ { sectionName, currentUser, site, siteKey } }>
					<WritingOnlySetup provider={ provider } />
				</AgentsManagerContextProvider>
			</PersistentRouter>
		</QueryClientProvider>
	);
}

function WritingOnlySetup( {
	provider,
}: {
	provider: LoadedProviders & { providerId: string };
} ): JSX.Element | null {
	const { site, agentConfig, setAgentConfig } = useAgentsManagerContext();

	useEffect( () => {
		const siteId = typeof site?.ID === 'number' ? site.ID : undefined;
		setAgentConfig(
			createWritingOnlyAgentConfig( {
				// Match the full wp-orchestrator path. Agenttic restores this from
				// sessionIdStorageKey or accepts the server-generated first ID.
				sessionId: '',
				siteId,
				toolProvider: provider.toolProvider,
				contextProvider: provider.contextProvider,
				providerId: provider.providerId,
			} )
		);
	}, [ provider, setAgentConfig, site?.ID ] );

	const emptyViewSuggestions = useMemo(
		() => provider.getEmptyViewSuggestions?.() ?? [],
		[ provider ]
	);

	if ( ! agentConfig ) {
		return null;
	}

	return <WritingOnlyDock provider={ provider } emptyViewSuggestions={ emptyViewSuggestions } />;
}

function WritingOnlyDock( {
	provider,
	emptyViewSuggestions,
}: {
	provider: LoadedProviders;
	emptyViewSuggestions: ReturnType< NonNullable< LoadedProviders[ 'getEmptyViewSuggestions' ] > >;
} ) {
	const { getActiveSessionId, resumeActiveChat, sectionName } = useAgentsManagerContext();
	const { setIsOpen, setIsDocked, setIsMinimized } = useDispatch( AGENTS_MANAGER_STORE );
	const {
		isOpen,
		isDocked: persistedDocked,
		isMinimized,
		floatingPosition,
	} = useSelect( ( select ) => {
		const store = select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect;
		return store.getAgentsManagerState();
	}, [] );
	const { isDocked, isSidebarOpen, dock, undock, openSidebar, closeSidebar, createAgentPortal } =
		useAgentLayoutManager( {
			defaultDocked: persistedDocked,
			defaultOpen: isOpen,
		} );

	const setOpenState = useCallback( ( open: boolean ) => setIsOpen( open ), [ setIsOpen ] );
	const handleClose = useCallback( () => {
		if ( isDocked ) {
			closeSidebar();
		}
		setOpenState( false );
	}, [ closeSidebar, isDocked, setOpenState ] );
	const openChat = useCallback( () => {
		if ( isMinimized ) {
			setIsMinimized( false );
		}
		if ( isDocked ) {
			openSidebar();
		}
		setOpenState( true );
	}, [ isDocked, isMinimized, openSidebar, setIsMinimized, setOpenState ] );

	const handleExpand = useCallback( () => openChat(), [ openChat ] );
	const chatIsOpen = isOpen && ! isMinimized;
	const handleExternalEntryClick = useCallback( () => {
		recordTracksEvent( 'calypso_admin_bar_agents_manager_ai_chat_clicked', {
			section: sectionName || 'wp-admin',
			action: chatIsOpen ? 'close' : 'open',
		} );
		if ( chatIsOpen ) {
			handleClose();
			return;
		}
		resumeActiveChat();
		openChat();
	}, [ chatIsOpen, handleClose, openChat, resumeActiveChat, sectionName ] );
	const hasAiChatEntry = useWritingAiChatEntryButton( handleExternalEntryClick );
	const chatIsVisible = isOpen || ! hasAiChatEntry;
	const setChatOpen = useCallback(
		( shouldOpen: boolean ) => {
			if ( typeof shouldOpen !== 'boolean' ) {
				return;
			}
			if ( shouldOpen ) {
				openChat();
			} else {
				handleClose();
			}
		},
		[ handleClose, openChat ]
	);
	const setChatDocked = useCallback(
		( shouldDock: boolean ) => {
			if ( typeof shouldDock !== 'boolean' ) {
				return;
			}
			if ( shouldDock ) {
				dock();
			} else {
				undock();
			}
			setIsDocked( shouldDock );
		},
		[ dock, setIsDocked, undock ]
	);
	const getChatState = useCallback(
		() => Promise.resolve( { isOpen, isDocked, floatingPosition } ),
		[ floatingPosition, isDocked, isOpen ]
	);
	const isChatVisible = useCallback( () => chatIsOpen, [ chatIsOpen ] );

	// Expose only shell controls. Page/Site Editor actions, generic provider
	// context, and route navigation do not belong in the writing-only entry.
	useRegisterCustomActions( {
		getChatState,
		getSessionId: getActiveSessionId,
		setChatOpen,
		setChatDocked,
		isChatVisible,
		isReady: true,
	} );
	useEffect( () => {
		window.dispatchEvent( new CustomEvent( 'agents-manager-ready' ) );
	}, [] );

	return (
		<>
			<EditorAiChatButton onClose={ handleClose } onOpenChat={ openChat } />
			{ chatIsVisible &&
				createAgentPortal(
					<OrchestratorChat
						emptyViewSuggestions={ emptyViewSuggestions }
						isDocked={ isDocked }
						isOpen={ chatIsOpen }
						suggestionsVisible={ isDocked ? isSidebarOpen : chatIsOpen }
						onClose={ handleClose }
						onExpand={ handleExpand }
						chatHeaderOptions={ EMPTY_HEADER_OPTIONS }
						markdownComponents={ provider.markdownComponents ?? {} }
						markdownExtensions={ provider.markdownExtensions ?? {} }
						isCompactMode={ false }
						useNavigationContinuation={ provider.useNavigationContinuation }
						useProviderAbilitiesSetup={ provider.useAbilitiesSetup }
						useSuggestions={ provider.useSuggestions }
						getChatComponent={ provider.getChatComponent }
						useCheckpoint={ provider.useCheckpoint }
						capabilities={ provider.capabilities }
						useChatNotice={ provider.useChatNotice }
						groupWritingSuggestions
						hasAiChatEntry={ hasAiChatEntry }
						onHasMessagesChange={ NOOP }
					/>
				) }
		</>
	);
}
