/**
 * Agenttic config for the Free Simple writing lane. This deliberately omits
 * the full manager's Site Editor actions, Zendesk access, and external context.
 */
import { createCalypsoAuthProvider } from '../auth/calypso-auth-provider';
import { ORCHESTRATOR_AGENT_ID, ORCHESTRATOR_AGENT_URL } from '../constants';
import { getSessionStorageKey } from './agent-session';
import type { ContextProvider, ToolProvider } from '../extension-types';
import type { Ability as AgenticAbility, UseAgentChatConfig } from '@automattic/agenttic-client';

interface Options {
	sessionId: string;
	siteId?: number;
	providerId: string;
	toolProvider?: ToolProvider;
	contextProvider?: ContextProvider;
}

function wrapToolProvider( toolProvider: ToolProvider ): UseAgentChatConfig[ 'toolProvider' ] {
	return {
		...toolProvider,
		getAbilities: async (): Promise< AgenticAbility[] > => {
			const abilities = await toolProvider.getAbilities();
			return abilities.map( ( ability ) => ( {
				...ability,
				// Agenttic annotations reject null values accepted by the WP abilities registry.
				meta: ability.meta?.annotations
					? {
							...ability.meta,
							annotations: Object.fromEntries(
								Object.entries( ability.meta.annotations ).filter(
									( [ , value ] ) => value !== null
								)
							),
					  }
					: ability.meta,
			} ) ) as AgenticAbility[];
		},
	};
}

export function createWritingOnlyAgentConfig( options: Options ): UseAgentChatConfig {
	const agentId = ORCHESTRATOR_AGENT_ID;
	const config: UseAgentChatConfig = {
		agentId,
		agentUrl: ORCHESTRATOR_AGENT_URL,
		sessionId: options.sessionId,
		sessionIdStorageKey: getSessionStorageKey( agentId ),
		authProvider: createCalypsoAuthProvider( options.siteId, { logWpcomJwtFailure: true } ),
		enableStreaming: true,
		contextProvider: {
			getClientContext: () => {
				const providerContext = options.contextProvider?.getClientContext() ?? {
					url: window.location.href,
					pathname: window.location.pathname,
					search: window.location.search,
					environment: 'gutenberg',
				};

				return {
					...providerContext,
					can_access_zendesk: false,
					currentScreen: providerContext.currentScreen ?? { url: window.location.href },
					...( options.siteId &&
						! providerContext.selectedSiteId && { selectedSiteId: options.siteId } ),
					loadedProviderIds: [ options.providerId ],
				};
			},
		},
	};

	if ( options.toolProvider ) {
		config.toolProvider = wrapToolProvider( options.toolProvider );
	}

	return config;
}
