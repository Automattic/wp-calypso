/**
 * Headless Agent Initializer
 *
 * Creates the wp-orchestrator agent without rendering any UI.
 * Used for contexts like Media Library where Image Studio needs the agent
 * but the full Agents Manager dock UI isn't displayed.
 */

import { useAgentChat, getAgentManager } from '@automattic/agenttic-client';
import { useEffect, useState, useRef } from '@wordpress/element';
import { ORCHESTRATOR_AGENT_ID } from '../constants';
import { getSessionId } from '../utils/agent-session';
import { createAgentConfig } from '../utils/create-agent-config';
import { loadExternalProviders, type LoadedProviders } from '../utils/load-external-providers';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';
import type { HelpCenterSite } from '@automattic/data-stores';

export interface HeadlessAgentInitializerProps {
	/** The selected site object. */
	site?: HelpCenterSite | null;
	/** The current route path. */
	currentRoute?: string;
}

/**
 * Headless component that initializes the agent without rendering UI.
 * Once mounted, it creates the wp-orchestrator agent which can then be
 * used by other components (like Image Studio) via the shared agentManager singleton.
 */
export default function HeadlessAgentInitializer( {
	site = null,
	currentRoute,
}: HeadlessAgentInitializerProps ): JSX.Element | null {
	const [ agentConfig, setAgentConfig ] = useState< UseAgentChatConfig | null >( null );
	const loadedProvidersRef = useRef< LoadedProviders | null >( null );

	const sessionId = getSessionId();

	useEffect( () => {
		async function initializeAgent(): Promise< void > {
			// Load external providers (only once)
			let providers = loadedProvidersRef.current;
			if ( ! providers ) {
				providers = await loadExternalProviders();
				loadedProvidersRef.current = providers;
				// eslint-disable-next-line no-console
				console.log( '[HeadlessAgentInitializer] Loaded external providers' );
			}

			const siteId = typeof site?.ID === 'number' ? site.ID : undefined;

			const config = createAgentConfig( {
				sessionId,
				siteId,
				currentRoute,
				toolProvider: providers.toolProvider,
				contextProvider: providers.contextProvider,
				environment: 'wp-admin',
			} );

			setAgentConfig( config );
			// eslint-disable-next-line no-console
			console.log( '[HeadlessAgentInitializer] Agent config created' );
		}

		initializeAgent();
	}, [ currentRoute, sessionId, site?.ID ] );

	if ( ! agentConfig ) {
		return null;
	}

	return <AgentInitializerInner agentConfig={ agentConfig } />;
}

/**
 * Inner component that uses the agent chat hook.
 * Separated to ensure useAgentChat is only called with a valid config.
 */
function AgentInitializerInner( { agentConfig }: { agentConfig: UseAgentChatConfig } ): null {
	// Initialize the agent (this creates it in agentManager)
	useAgentChat( agentConfig );

	// Expose agentManager on window for cross-bundle access (e.g., Image Studio)
	useEffect( () => {
		const agentManager = getAgentManager();
		window.__agentManager = agentManager;
		// eslint-disable-next-line no-console
		console.log( '[HeadlessAgentInitializer] Agent initialized (headless mode)', {
			hasAgent: agentManager.hasAgent( ORCHESTRATOR_AGENT_ID ),
		} );
	}, [] );

	return null;
}
