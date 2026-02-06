/**
 * Agent Configuration Utilities
 *
 * Shared utilities for creating agent configurations used by both
 * the full Agents Manager UI and headless mode.
 */

import { createCalypsoAuthProvider } from '../auth/calypso-auth-provider';
import { ORCHESTRATOR_AGENT_ID, ORCHESTRATOR_AGENT_URL } from '../constants';
import { SESSION_STORAGE_KEY } from './agent-session';
import type { ContextEntry, ToolProvider, ContextProvider } from '../extension-types';
import type { UseAgentChatConfig, Ability as AgenticAbility } from '@automattic/agenttic-client';

export interface CreateAgentConfigOptions {
	sessionId: string;
	siteId?: number;
	currentRoute?: string;
	toolProvider?: ToolProvider;
	contextProvider?: ContextProvider;
	environment?: 'calypso' | 'wp-admin';
}

/**
 * Resolve context entries by calling `getData()` closures.
 *
 * Takes context entries with optional `getData()` closures and resolves them
 * by calling `getData()` to populate the `data` field. The `getData` function
 * is removed from the resolved entries.
 *
 * This allows fetching live data as needed.
 */
export function resolveContextEntries( entries: ContextEntry[] ): ContextEntry[] {
	return entries.map( ( entry ) => {
		if ( ! entry.getData ) {
			return entry;
		}

		const { getData, ...entryWithoutGetData } = entry;

		try {
			const data = getData();
			return { ...entryWithoutGetData, data };
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( `[AgentsManager] Failed to resolve context entry "${ entry.id }":`, error );
			return entryWithoutGetData;
		}
	} );
}

/**
 * Wrap a tool provider to filter out null annotation values.
 *
 * WordPress Abilities API uses `null` for missing annotations,
 * but `agenttic-client` expects `undefined`.
 */
function wrapToolProvider( toolProvider: ToolProvider ): UseAgentChatConfig[ 'toolProvider' ] {
	return {
		...toolProvider,
		getAbilities: async (): Promise< AgenticAbility[] > => {
			const abilities = await toolProvider.getAbilities();
			return abilities.map( ( ability ) => ( {
				...ability,
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

/**
 * Create a context provider that resolves context entries.
 */
function createWrappedContextProvider(
	contextProvider: ContextProvider
): UseAgentChatConfig[ 'contextProvider' ] {
	return {
		getClientContext: () => {
			const pluginContext = contextProvider.getClientContext();

			if ( pluginContext.contextEntries?.length ) {
				return {
					...pluginContext,
					contextEntries: resolveContextEntries( pluginContext.contextEntries ),
				};
			}

			return pluginContext;
		},
	};
}

/**
 * Create a default context provider for environments without a plugin context.
 */
function createDefaultContextProvider(
	currentRoute: string | undefined,
	environment: string
): UseAgentChatConfig[ 'contextProvider' ] {
	return {
		getClientContext: () => ( {
			url: window.location.href,
			pathname: currentRoute || window.location.pathname,
			search: window.location.search,
			environment,
		} ),
	};
}

/**
 * Create a complete agent configuration.
 *
 * Used by both the full Agents Manager UI and headless mode to ensure
 * consistent configuration.
 */
export function createAgentConfig( options: CreateAgentConfigOptions ): UseAgentChatConfig {
	const {
		sessionId,
		siteId,
		currentRoute,
		toolProvider,
		contextProvider,
		environment = 'calypso',
	} = options;

	const config: UseAgentChatConfig = {
		agentId: ORCHESTRATOR_AGENT_ID,
		agentUrl: ORCHESTRATOR_AGENT_URL,
		sessionId,
		sessionIdStorageKey: SESSION_STORAGE_KEY,
		authProvider: createCalypsoAuthProvider( siteId ),
		enableStreaming: true,
	};

	if ( toolProvider ) {
		config.toolProvider = wrapToolProvider( toolProvider );
	}

	if ( contextProvider ) {
		config.contextProvider = createWrappedContextProvider( contextProvider );
	} else {
		config.contextProvider = createDefaultContextProvider( currentRoute, environment );
	}

	return config;
}
