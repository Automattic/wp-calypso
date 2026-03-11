/**
 * Headless Agent Initializer
 *
 * Creates the wp-orchestrator agent without rendering any UI.
 * Used for contexts like Media Library where Image Studio needs the agent
 * but the full Agents Manager dock UI isn't displayed.
 */

import { useAgentChat } from '@automattic/agenttic-client';
import { useEffect, useState, useRef } from '@wordpress/element';
import { createAgentConfig, getAgentConfig } from '../utils/agent-config';
import { getSessionId } from '../utils/agent-session';
import { loadExternalProviders, type LoadedProviders } from '../utils/load-external-providers';
import type { AgentConfigOverrides } from '../utils/agent-config';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';
import type { HelpCenterSite } from '@automattic/data-stores';

export interface HeadlessAgentInitializerProps {
	/** The selected site object. */
	site?: HelpCenterSite | null;
	/** The current route path. */
	currentRoute?: string;
	/** Optional explicit agent configuration overrides. */
	agentConfig?: AgentConfigOverrides;
}

/**
 * Headless component that initializes the agent without rendering UI.
 * Once mounted, it creates the wp-orchestrator agent which can then be
 * used by other components (like Image Studio) via the shared agentManager singleton.
 */
export default function HeadlessAgentInitializer( {
	site = null,
	currentRoute,
	agentConfig,
}: HeadlessAgentInitializerProps ): JSX.Element | null {
	const [ resolvedAgentConfig, setResolvedAgentConfig ] = useState< UseAgentChatConfig | null >(
		null
	);
	const loadedProvidersRef = useRef< LoadedProviders | null >( null );
	const { agentId, version, botSlug } = getAgentConfig( agentConfig );

	const sessionId = getSessionId( agentId );

	useEffect( () => {
		async function initializeAgent(): Promise< void > {
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
				environment: 'wp-admin',
				agentId,
				version,
				botSlug,
			} );

			setResolvedAgentConfig( config );
		}

		initializeAgent();
	}, [ agentId, version, botSlug, currentRoute, sessionId, site?.ID ] );

	if ( ! resolvedAgentConfig ) {
		return null;
	}

	return <AgentInitializerInner agentConfig={ resolvedAgentConfig } />;
}

/**
 * Inner component that uses the agent chat hook.
 * Separated to ensure useAgentChat is only called with a valid config.
 */
function AgentInitializerInner( { agentConfig }: { agentConfig: UseAgentChatConfig } ): null {
	// Initialize the agent (this creates it in agentManager)
	useAgentChat( agentConfig );

	return null;
}
