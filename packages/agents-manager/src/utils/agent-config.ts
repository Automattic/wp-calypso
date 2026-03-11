/**
 * Agent Configuration Utilities
 *
 * Shared utilities for creating agent configurations and reading
 * agent overrides from URL parameters. Used by both the full
 * Agents Manager UI and headless mode.
 */

import { createCalypsoAuthProvider } from '../auth/calypso-auth-provider';
import { ORCHESTRATOR_AGENT_ID, ORCHESTRATOR_AGENT_URL } from '../constants';
import { getSessionStorageKey } from './agent-session';
import { canConnectToZendesk } from './can-connect-to-zendesk';
import type { ContextEntry, ToolProvider, ContextProvider } from '../extension-types';
import type { UseAgentChatConfig, Ability as AgenticAbility } from '@automattic/agenttic-client';

export interface CreateAgentConfigOptions {
	sessionId: string;
	siteId?: number;
	currentRoute?: string;
	toolProvider?: ToolProvider;
	contextProvider?: ContextProvider;
	environment?: 'calypso' | 'wp-admin';
	/** Override the agent ID (e.g., from query string). Defaults to ORCHESTRATOR_AGENT_ID. */
	agentId?: string;
	/** Override the agent version (e.g., from query string). Passed via constructorArguments. */
	version?: string;
	/** Override bot slug (e.g., for workflow agent configurations). */
	botSlug?: string;
}

export interface AgentConfigOverrides {
	/** Explicit agent ID to use (for example `workflow`). */
	agentId?: string;
	/** Optional constructor argument version. */
	version?: string;
	/** Optional constructor argument slug for workflow bot selection. */
	botSlug?: string;
}

/**
 * Resolve context entries by calling their `getData()` closures
 * to populate the `data` field.
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
async function createWrappedContextProvider(
	contextProvider: ContextProvider,
	environment: string,
	version?: string,
	botSlug?: string
): Promise< UseAgentChatConfig[ 'contextProvider' ] > {
	const canAccessZendesk = await canConnectToZendesk();
	return {
		getClientContext: () => {
			const pluginContext = contextProvider.getClientContext();

			const resolvedContext = pluginContext.contextEntries?.length
				? {
						...pluginContext,
						contextEntries: resolveContextEntries( pluginContext.contextEntries ),
				  }
				: pluginContext;

			const fallbackContext = {
				url: window.location.href,
				pathname: window.location.pathname,
				search: window.location.search,
				environment,
			};

			return {
				...fallbackContext,
				...resolvedContext,
				can_access_zendesk: canAccessZendesk,
				constructorArguments: {
					...( resolvedContext.constructorArguments || {} ),
					...( version && { version } ),
					...( botSlug && { slug: botSlug } ),
				},
			};
		},
	};
}

/**
 * Create a default context provider for environments without a plugin context.
 */
async function createDefaultContextProvider(
	currentRoute: string | undefined,
	environment: string,
	version?: string,
	botSlug?: string
): Promise< UseAgentChatConfig[ 'contextProvider' ] > {
	const canAccessZendesk = await canConnectToZendesk();
	return {
		getClientContext: () => ( {
			url: window.location.href,
			pathname: currentRoute || window.location.pathname,
			search: window.location.search,
			can_access_zendesk: canAccessZendesk,
			environment,
			// TODO: Remove once agenttic-client supports top-level constructorArguments
			...( ( version || botSlug ) && {
				constructorArguments: {
					...( version && { version } ),
					...( botSlug && { slug: botSlug } ),
				},
			} ),
		} ),
	};
}

/**
 * Create a complete agent configuration.
 *
 * Used by both the full Agents Manager UI and headless mode to ensure
 * consistent configuration.
 */
export async function createAgentConfig(
	options: CreateAgentConfigOptions
): Promise< UseAgentChatConfig > {
	const {
		sessionId,
		siteId,
		currentRoute,
		toolProvider,
		contextProvider,
		environment = 'calypso',
		agentId = ORCHESTRATOR_AGENT_ID,
		version,
		botSlug,
	} = options;

	const config: UseAgentChatConfig = {
		agentId,
		agentUrl: ORCHESTRATOR_AGENT_URL,
		sessionId,
		sessionIdStorageKey: getSessionStorageKey( agentId ),
		authProvider: createCalypsoAuthProvider( siteId ),
		enableStreaming: true,
	};

	if ( toolProvider ) {
		config.toolProvider = wrapToolProvider( toolProvider );
	}

	if ( contextProvider ) {
		config.contextProvider = await createWrappedContextProvider(
			contextProvider,
			environment,
			version,
			botSlug
		);
	} else {
		config.contextProvider = await createDefaultContextProvider(
			currentRoute,
			environment,
			version,
			botSlug
		);
	}

	return config;
}

/**
 * Resolve agent config from explicit overrides, query string, and defaults.
 * Priority: explicit overrides > query params > defaults.
 *
 * Query parameters:
 * - `agent`: Override the agent ID (e.g., ?agent=wpcom-workflow-support_chat)
 * - `version`: Override the agent version (e.g., ?version=1.0.25)
 * - `slug` or `bot`: Override workflow/configurable bot slug
 */
export function getAgentConfig( overrides: AgentConfigOverrides = {} ): {
	agentId: string;
	version?: string;
	botSlug?: string;
} {
	const urlSearchParams = new URLSearchParams( window.location.search );
	const agentIdParam = urlSearchParams.get( 'agent' );
	const versionParam = urlSearchParams.get( 'version' );
	const botSlugParam = urlSearchParams.get( 'slug' ) || urlSearchParams.get( 'bot' );

	return {
		agentId: overrides.agentId || agentIdParam || ORCHESTRATOR_AGENT_ID,
		version: overrides.version || versionParam || undefined,
		botSlug: overrides.botSlug || botSlugParam || undefined,
	};
}
