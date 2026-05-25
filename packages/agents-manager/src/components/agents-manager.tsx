import { getAgentManager } from '@automattic/agenttic-client';
import {
	AgentsManagerSelect,
	type AgentsManagerSite,
	type CurrentUser,
} from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { useLocation, useNavigate } from 'react-router-dom';
import { AgentsManagerContextProvider, useAgentsManagerContext } from '../contexts';
import { useAgentConfig } from '../hooks/use-agent-config';
import { useEmptyViewSuggestions } from '../hooks/use-empty-view-suggestions';
import { AGENTS_MANAGER_STORE } from '../stores';
import { clearSessionId, getOrCreateSessionId } from '../utils/agent-session';
import { createAgentConfig } from '../utils/create-agent-config';
import { isReaderChatAgent } from '../utils/is-reader-chat-agent';
import {
	loadExternalProviders,
	type ImageUploadHook,
	type LoadedProviders,
} from '../utils/load-external-providers';
import AgentDock from './agent-dock';
import { PersistentRouter } from './persistent-router';

export interface AgentsManagerProps {
	/** The name of the current section (e.g., 'wp-admin', 'gutenberg'). */
	sectionName: string;
	/** The current user object. */
	currentUser?: CurrentUser;
	/** The selected site object. */
	site?: AgentsManagerSite | null;
	/** The current route path. */
	currentRoute?: string;
	/** The ID of the currently selected site, or undefined for non-site contexts. */
	currentSiteId?: number;
	/** Explicit agent ID for hosts that must not fall back to Unified Chat. */
	agentId?: string;
	/** Called when the agent is closed. */
	handleClose?: () => void;
	/** The hook for handling image uploads. */
	useImageUpload?: ImageUploadHook;
}

const queryClient = new QueryClient();

export default function AgentsManager( {
	sectionName,
	currentUser,
	site,
	currentRoute,
	currentSiteId,
	agentId,
	useImageUpload,
}: AgentsManagerProps ): JSX.Element | null {
	// Wait for the store to load before rendering PersistentRouter
	// This ensures router history is restored from persisted state
	const { hasLoaded: isStoreReady } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	if ( ! isStoreReady ) {
		return null;
	}

	const siteKey = currentSiteId ? String( currentSiteId ) : 'no-site';

	return (
		<AgentsManagerContextProvider
			value={ { sectionName, currentUser, site, siteKey, currentRoute } }
		>
			<QueryClientProvider client={ queryClient }>
				<PersistentRouter siteKey={ siteKey }>
					<AgentSetup agentId={ agentId } useImageUpload={ useImageUpload } />
				</PersistentRouter>
			</QueryClientProvider>
		</AgentsManagerContextProvider>
	);
}

// Separate component that uses hooks within `PersistentRouter` context
function AgentSetup( {
	agentId: hostAgentId,
	useImageUpload: fallbackUseImageUpload,
}: {
	agentId?: string;
	useImageUpload?: ImageUploadHook;
} ): JSX.Element | null {
	const { site, currentRoute, agentConfig, setAgentConfig } = useAgentsManagerContext();
	const loadedProvidersRef = useRef< LoadedProviders | null >( null );
	const navigate = useNavigate();
	const { pathname, state } = useLocation();

	// Detect new chat requests via `state.isNewChat` on the `/chat` route.
	const isNewChat = pathname.startsWith( '/chat' ) && !! state?.isNewChat;

	// Read agent/version overrides from browser URL (?agent=, ?version=).
	// PersistentRouter (memory router) does not track window.location.search.
	const { agentId, version, isLoading: isAgentConfigLoading } = useAgentConfig( hostAgentId );

	// Restore the session ID. Priority:
	//   1. Router state (calypso navigation carries sessionId on resume).
	//   2. localStorage (reader-chat on blog frontends, where there's no
	//      router state on fresh page loads). We persist client-side so
	//      the same session_id flows with every request.
	//   3. Generate a new client-side UUID, persist, and use it.
	// This is more robust than relying on agenttic-client's own sessionIdStorageKey
	// write — that fires after the server returns a sessionId, which can be
	// skipped if the response shape doesn't match what the client parses.
	const sessionId =
		( ! isNewChat && state?.sessionId ) ||
		( isReaderChatAgent( agentId ) ? getOrCreateSessionId( isNewChat, agentId ) : '' );

	useEffect( () => {
		// Wait for the agent config to stabilize before initializing.
		if ( isAgentConfigLoading ) {
			return;
		}

		async function initializeAgent(): Promise< void > {
			// Handle new chat: clear existing session and navigate to clean state
			if ( isNewChat ) {
				const agentManager = getAgentManager();

				if ( agentManager.hasAgent( agentId ) ) {
					// eslint-disable-next-line @typescript-eslint/await-thenable -- ensure abort completes before teardown
					await agentManager.abortCurrentRequest( agentId );
					agentManager.removeAgent( agentId );
				}

				// Clear stored session ID
				clearSessionId( agentId );
				// Clear route state to prevent repeated new chat initialization
				navigate( '/chat', { replace: true } );
				return;
			}

			// Load external providers (only once)
			let providers = loadedProvidersRef.current;
			if ( ! providers ) {
				providers = await loadExternalProviders();
				loadedProvidersRef.current = providers;
			}

			const siteId = typeof site?.ID === 'number' ? site.ID : undefined;

			const config = await createAgentConfig( {
				sessionId,
				siteId,
				currentRoute,
				toolProvider: providers.toolProvider,
				contextProvider: providers.contextProvider,
				environment: 'calypso',
				agentId,
				version,
			} );

			setAgentConfig( config );
		}

		initializeAgent();
	}, [
		agentId,
		currentRoute,
		isAgentConfigLoading,
		isNewChat,
		navigate,
		sessionId,
		setAgentConfig,
		site?.ID,
		hostAgentId,
		version,
	] );

	const loadedProviders = loadedProvidersRef.current;

	// Load empty view suggestions (handles Big Sky's theme-dependent suggestions)
	const emptyViewSuggestions = useEmptyViewSuggestions( { loadedProviders } );

	// Don't render until the setup is complete AND suggestions are ready
	if ( ! agentConfig || ! loadedProviders || emptyViewSuggestions === null ) {
		return null;
	}

	return (
		<AgentDock
			emptyViewSuggestions={ emptyViewSuggestions }
			markdownComponents={ loadedProviders.markdownComponents || {} }
			markdownExtensions={ loadedProviders.markdownExtensions || {} }
			useNavigationContinuation={ loadedProviders.useNavigationContinuation }
			useAbilitiesSetup={ loadedProviders.useAbilitiesSetup }
			useSuggestions={ loadedProviders.useSuggestions }
			getChatComponent={ loadedProviders.getChatComponent }
			siteBuildUtils={ loadedProviders.siteBuildUtils }
			useImageUpload={ loadedProviders.useImageUpload ?? fallbackUseImageUpload }
			useCheckpoint={ loadedProviders.useCheckpoint }
			capabilities={ loadedProviders.capabilities }
		/>
	);
}
