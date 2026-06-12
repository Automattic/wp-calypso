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
import { getExternalContextEntries } from './external-context';
import { isReaderChatAgent } from './is-reader-chat-agent';
import { getClientConstructorArguments, getSiteEditorActions } from './site-editor-context';
import type { ContextEntry, ToolProvider, ContextProvider } from '../extension-types';
import type { UseAgentChatConfig, Ability as AgenticAbility } from '@automattic/agenttic-client';

export interface CreateAgentConfigOptions {
	sessionId: string;
	siteId?: number;
	currentRoute?: string;
	toolProvider?: ToolProvider;
	contextProvider?: ContextProvider;
	environment?: string;
	/** Override the agent ID (e.g., from query string). Defaults to ORCHESTRATOR_AGENT_ID. */
	agentId?: string;
	/** Override the agent version (e.g., from query string). Passed via constructorArguments. */
	version?: string;
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

function getContextSiteEditorActions(
	siteEditorActions: unknown
): Record< string, string | number | boolean | null > {
	if ( typeof siteEditorActions !== 'object' || siteEditorActions === null ) {
		return {};
	}

	return siteEditorActions as Record< string, string | number | boolean | null >;
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

async function canAccessZendeskForAgent( agentId?: string ): Promise< boolean > {
	if ( isReaderChatAgent( agentId ) ) {
		return false;
	}

	return canConnectToZendesk();
}

function normalizeSiteId( siteId: unknown ): number | undefined {
	const numericSiteId = Number( siteId );
	return Number.isFinite( numericSiteId ) && numericSiteId > 0 ? numericSiteId : undefined;
}

/**
 * Create a context provider that resolves context entries.
 */
async function createWrappedContextProvider(
	contextProvider: ContextProvider,
	siteId?: number,
	agentId?: string,
	version?: string,
	environment?: string,
	currentRoute?: string
): Promise< UseAgentChatConfig[ 'contextProvider' ] > {
	const canAccessZendesk = await canAccessZendeskForAgent( agentId );
	return {
		getClientContext: () => {
			const resolvedSiteId = normalizeSiteId( siteId );
			const pluginContext = contextProvider.getClientContext();

			let resolvedContext = pluginContext.contextEntries?.length
				? {
						...pluginContext,
						contextEntries: resolveContextEntries( pluginContext.contextEntries ),
				  }
				: pluginContext;

			const externalEntries = getExternalContextEntries();
			const siteEditorActions = getSiteEditorActions();
			const mergedSiteEditorActions = {
				...getContextSiteEditorActions( resolvedContext.siteEditorActions ),
				...siteEditorActions,
			};
			if ( externalEntries.length ) {
				resolvedContext = {
					...resolvedContext,
					contextEntries: [
						...( resolvedContext.contextEntries || [] ),
						...resolveContextEntries( externalEntries ),
					],
				};
			}

			return {
				...resolvedContext,
				can_access_zendesk: canAccessZendesk,
				currentScreen: resolvedContext.currentScreen || {
					url: window.location.href,
				},
				...( resolvedSiteId &&
					! resolvedContext.selectedSiteId && { selectedSiteId: resolvedSiteId } ),
				...( Object.keys( mergedSiteEditorActions ).length > 0 && {
					siteEditorActions: mergedSiteEditorActions,
				} ),
				constructorArguments: {
					...( resolvedContext.constructorArguments || {} ),
					...getClientConstructorArguments( environment, currentRoute ),
					...( version && { version } ),
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
	siteId?: number,
	agentId?: string,
	version?: string
): Promise< UseAgentChatConfig[ 'contextProvider' ] > {
	const canAccessZendesk = await canAccessZendeskForAgent( agentId );
	return {
		getClientContext: () => {
			// Hosts that don't have a plugin context (e.g. reader-chat on a
			// blog frontend) can still surface page metadata by assigning it
			// to `window.agentsManagerData`. Pick up `currentPost`, `siteName`,
			// and `siteUrl` here so the orchestrator knows which post the
			// reader is viewing without every host wiring its own provider.
			const hostData = isReaderChatAgent( agentId )
				? ( window as unknown as { agentsManagerData?: Record< string, unknown > } )
						.agentsManagerData ?? {}
				: {};
			const resolvedSiteId = normalizeSiteId( siteId ?? hostData.siteId );
			const siteEditorActions = getSiteEditorActions();

			const externalEntries = getExternalContextEntries();
			const contextEntries = externalEntries.length
				? resolveContextEntries( externalEntries )
				: undefined;
			const constructorArguments = {
				...getClientConstructorArguments( environment, currentRoute ),
				...( version && { version } ),
			};

			return {
				url: window.location.href,
				pathname: currentRoute || window.location.pathname,
				search: window.location.search,
				can_access_zendesk: canAccessZendesk,
				environment,
				// Match Odie's context shape so the server can read current_screen.url
				currentScreen: { url: window.location.href },
				...( resolvedSiteId && { selectedSiteId: resolvedSiteId } ),
				...( Object.keys( siteEditorActions ).length > 0 && { siteEditorActions } ),
				...( hostData.currentPost ? { currentPost: hostData.currentPost } : {} ),
				...( hostData.siteName ? { siteName: hostData.siteName } : {} ),
				...( hostData.siteUrl ? { siteUrl: hostData.siteUrl } : {} ),
				...( contextEntries ? { contextEntries } : {} ),
				// TODO: Remove once agenttic-client supports top-level constructorArguments
				...( Object.keys( constructorArguments ).length && { constructorArguments } ),
			};
		},
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
	} = options;

	const config: UseAgentChatConfig = {
		agentId,
		agentUrl: ORCHESTRATOR_AGENT_URL,
		sessionId,
		sessionIdStorageKey: getSessionStorageKey( agentId ),
		authProvider: createCalypsoAuthProvider( siteId, {
			logWpcomJwtFailure: ! isReaderChatAgent( agentId ),
		} ),
		enableStreaming: true,
	};

	if ( toolProvider ) {
		config.toolProvider = wrapToolProvider( toolProvider );
	}

	if ( contextProvider ) {
		config.contextProvider = await createWrappedContextProvider(
			contextProvider,
			siteId,
			agentId,
			version,
			environment,
			currentRoute
		);
	} else {
		config.contextProvider = await createDefaultContextProvider(
			currentRoute,
			environment,
			siteId,
			agentId,
			version
		);
	}

	return config;
}
