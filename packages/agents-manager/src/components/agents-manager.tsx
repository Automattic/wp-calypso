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
import { useEmptyViewSuggestions } from '../hooks/use-empty-view-suggestions';
import { AGENTS_MANAGER_STORE } from '../stores';
import { createAgentConfig, getAgentConfig } from '../utils/agent-config';
import { getSessionId, clearSessionId } from '../utils/agent-session';
import { loadExternalProviders, type LoadedProviders } from '../utils/load-external-providers';
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
	/** Called when the agent is closed. */
	handleClose?: () => void;
}

const queryClient = new QueryClient();

export default function AgentsManager( {
	sectionName,
	currentUser,
	site,
	currentRoute,
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

	return (
		<AgentsManagerContextProvider value={ { sectionName, currentUser, site, currentRoute } }>
			<QueryClientProvider client={ queryClient }>
				<PersistentRouter>
					<AgentSetup />
				</PersistentRouter>
			</QueryClientProvider>
		</AgentsManagerContextProvider>
	);
}

// Separate component that uses hooks within `PersistentRouter` context
function AgentSetup(): JSX.Element | null {
	const { site, currentRoute, agentConfig, setAgentConfig } = useAgentsManagerContext();
	const loadedProvidersRef = useRef< LoadedProviders | null >( null );
	const navigate = useNavigate();
	const { pathname, state } = useLocation();

	const isChatRoute = pathname.startsWith( '/chat' );
	const isNewChat = isChatRoute && !! state?.isNewChat;
	const routeSessionId = isChatRoute && state?.sessionId;
	// Read agent/version overrides from browser URL (?agent=, ?version=).
	// PersistentRouter (memory router) does not track window.location.search.
	const { agentId, version } = getAgentConfig();
	const sessionId = isNewChat ? '' : routeSessionId || getSessionId( agentId );

	useEffect( () => {
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
	}, [ agentId, version, currentRoute, isNewChat, navigate, sessionId, setAgentConfig, site?.ID ] );

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
			useImageUpload={ loadedProviders.useImageUpload }
			useCheckpoint={ loadedProviders.useCheckpoint }
		/>
	);
}
