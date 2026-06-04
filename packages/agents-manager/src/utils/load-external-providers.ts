// global.d.ts declares ambient globals (e.g. agentsManagerData) that are injected server-side.
// Ambient declaration files cannot be `import`ed; a triple-slash reference is required to ensure
// the global is visible when TypeScript resolves this file via the import graph rather than the
// tsconfig include list (e.g. during sandbox / CI builds).
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../global.d.ts" />
/**
 * External Provider Loading Utility
 *
 * Loads external agent providers registered via the agents_manager_agent_providers
 * PHP filter. Each provider module should export toolProvider and/or contextProvider.
 */

import { getAgentManager, UIMessage } from '@automattic/agenttic-client';
import { isReaderChatAgent } from './is-reader-chat-agent';
import { useReaderFollowupSuggestions } from './reader-followup-hook';
import type { ImageUploadHook } from '../hooks/use-image-upload';
import type { ToolProvider, ContextProvider, Suggestion, BigSkyMessage } from '../types';
import type { UseAgentChatReturn } from '@automattic/agenttic-client';
import type { MarkdownComponents, MarkdownExtensions } from '@automattic/agenttic-ui';

/**
 * Check if the unified experience flag is set via agentsManagerData.
 *
 * This is used on wp-admin environments (Atomic, Garden, Simple sites) where
 * the flag is injected server-side by Jetpack's Agents Manager.
 * @returns The useUnifiedExperience value, or undefined if not available.
 */
export function getUseUnifiedExperienceFromInlineData(): boolean | undefined {
	if ( typeof agentsManagerData !== 'undefined' ) {
		return agentsManagerData?.useUnifiedExperience;
	}
	return undefined;
}

/**
 * Hook that resumes the conversation after a full page navigation
 * (e.g., `wp-admin/navigate`) by sending a tool result.
 */
export type NavigationContinuationHook = ( props: {
	isProcessing: boolean;
	sendToolResult: ( params: {
		toolCallId: string;
		toolId: string;
		message: string;
		sessionId: string;
	} ) => Promise< void >;
	sessionId: string;
	pathname: string;
} ) => void;

/**
 * Abilities setup hook type - for registering hook-based abilities that utilize React
 * context. Invoked after custom actions registration with Big Sky's AI store. Receives
 * action handlers that will be used for agent and chat interaction.
 */
export type AbilitiesSetupHook = ( actions: {
	addMessage: ( message: BigSkyMessage ) => void;
	clearMessages: () => void;
	clearSuggestions: UseAgentChatReturn[ 'clearSuggestions' ];
	getAgentManager: typeof getAgentManager;
	isProcessing?: boolean;
	setIsThinking: ( isThinking: boolean ) => void;
	deleteMarkedMessages: ( messages: Record< 'id', string >[] ) => void;
	getSessionId: () => string | undefined;
	setIsBuildingSite: ( isBuildingSite: boolean ) => void;
	setThinkingMessage: ( message: string | null ) => void;
} ) => void;

/**
 * Suggestions hook type - for providing dynamic suggestions based on context
 * (e.g., selected block in editor). Returns an array of suggestions.
 */
export type UseSuggestionsHook = (
	maxSuggestions?: number,
	options?: { suggestionsVisible?: boolean }
) => {
	suggestions: Suggestion[];
} | void;

export type SiteBuildUtils = {
	hasSiteBuildMessages: ( messages: UIMessage[] ) => boolean;
	groupSiteBuildMessages: ( messages: UIMessage[], thinkingMessage: string | null ) => UIMessage[];
};

/**
 * Supported chat component types for agent messages.
 */
type ChatComponentType =
	| 'button-picker'
	| 'font-picker'
	| 'color-picker'
	| 'pattern-picker'
	| 'chat-suggestions'
	| 'next-step-button';

/**
 * Get a chat component by type for rendering in agent messages.
 * @param type - The type of chat component to get
 * @param context - Optional source tool metadata for source-aware component lookup
 * @returns The React component for the specified type, or `null` if unknown
 */
export type GetChatComponentContext = {
	toolId?: string;
};
export type GetChatComponent = (
	type: ChatComponentType | string,
	context?: GetChatComponentContext
) => React.ComponentType< unknown > | null;

/**
 * Checkpoint return type - for saving and restoring editor state so that AI actions can be undone.
 */
export type UseCheckpointReturn = {
	getLastEditorState: () => unknown;
	setCheckpoint: ( id: string, keys?: string[] ) => void;
	addCheckpointKeys: ( id: string, keys: string[] ) => void;
	restoreCheckpoint: ( id: string ) => Promise< void >;
	addNewPageToCheckpoint: ( pageId: string ) => void;
	addPageRenameToCheckpoint: ( pageId: string, oldTitle: string, newTitle: string ) => void;
	addPageRemovalToCheckpoint: (
		pageId: string,
		pageTitle: string,
		options?: { shouldRestoreNavigation?: boolean }
	) => void;
	getLatestUserMessageId: () => string | undefined;
	clearCheckpoint: ( userMessageId: string ) => void;
	hasCheckpoint: ( id: string ) => boolean;
};

/** Hook that returns checkpoint utilities for the current editor session. */
export type UseCheckpointHook = () => UseCheckpointReturn;

export type { ImageUploadHook };

/** Optional flags providers can declare to opt into AM chat-dock features. */
export interface ProviderCapabilities {
	/** Adds the "Split screen sidebar" chat-header menu item when true. */
	supportsSplitScreen?: boolean;
}

/**
 * OR-merge a provider's `capabilities` into the running map. Works on both
 * plain objects and lazy Proxies (probed by direct key access, not iteration).
 */
export function mergeCapabilitiesInto( merged: ProviderCapabilities, capabilities: unknown ): void {
	if ( ! capabilities || typeof capabilities !== 'object' ) {
		return;
	}
	const caps = capabilities as ProviderCapabilities;
	// Strict `=== true` because `capabilities` arrives as `unknown` from
	// runtime-imported modules; a stray `'false'` string would otherwise opt in.
	if ( caps.supportsSplitScreen === true ) {
		merged.supportsSplitScreen = true;
	}
}

export interface LoadedProviders {
	toolProvider?: ToolProvider;
	contextProvider?: ContextProvider;
	/** Function to get empty view suggestions. Called when component is ready. */
	getEmptyViewSuggestions?: () => Suggestion[];
	markdownComponents?: MarkdownComponents;
	markdownExtensions?: MarkdownExtensions;
	useNavigationContinuation?: NavigationContinuationHook;
	useAbilitiesSetup?: AbilitiesSetupHook;
	useSuggestions?: UseSuggestionsHook;
	getChatComponent?: GetChatComponent;
	siteBuildUtils?: SiteBuildUtils;
	useImageUpload?: ImageUploadHook;
	useCheckpoint?: UseCheckpointHook;
	capabilities?: ProviderCapabilities;
}

type AbilityProviderEntry = {
	provider: ToolProvider;
	abilityName: string;
};

const BIG_SKY_SHOW_COMPONENT_ABILITY = 'big-sky/show-component';
const BIG_SKY_SHOW_COMPONENT_AGENTTIC_TOOL_ID = 'big-sky-show-component';
const BIG_SKY_SHOW_COMPONENT_TOOL_ID = 'big_sky__show_component';

function getProviderAgentMessage( result: unknown ): string | undefined {
	if ( ! result || typeof result !== 'object' ) {
		return undefined;
	}

	const agentMessage = ( result as { agentMessage?: unknown } ).agentMessage;
	if ( typeof agentMessage === 'string' && agentMessage.trim() ) {
		return agentMessage;
	}

	const nestedResult = ( result as { result?: unknown } ).result;
	if ( ! nestedResult || typeof nestedResult !== 'object' ) {
		return undefined;
	}

	const nestedAgentMessage = ( nestedResult as { agentMessage?: unknown } ).agentMessage;
	return typeof nestedAgentMessage === 'string' && nestedAgentMessage.trim()
		? nestedAgentMessage
		: undefined;
}

function normalizeProviderResult( result: unknown ): unknown {
	const message = getProviderAgentMessage( result );
	if ( ! message || ! result || typeof result !== 'object' ) {
		return result;
	}

	if ( ( result as { agentMessage?: unknown } ).agentMessage === message ) {
		return result;
	}

	return {
		...( result as Record< string, unknown > ),
		agentMessage: message,
	};
}

function addProviderCallbackToAbility( ability: unknown, entry: AbilityProviderEntry ): unknown {
	if ( ! ability || typeof ability !== 'object' ) {
		return ability;
	}

	const abilityWithCallback = { ...( ability as Record< string, unknown > ) };
	const existingCallback =
		typeof abilityWithCallback.callback === 'function' ? abilityWithCallback.callback : undefined;
	Object.defineProperty( abilityWithCallback, 'callback', {
		value: async ( args: unknown ) => {
			const result = existingCallback
				? await existingCallback( args )
				: await entry.provider.executeAbility( entry.abilityName, args );
			return normalizeProviderResult( result );
		},
		enumerable: false,
	} );
	return abilityWithCallback;
}

export function mergeUseSuggestionsHooks(
	hooks: UseSuggestionsHook[]
): UseSuggestionsHook | undefined {
	if ( hooks.length === 0 ) {
		return undefined;
	}

	if ( hooks.length === 1 ) {
		return hooks[ 0 ];
	}

	return ( maxSuggestions?: number, options?: { suggestionsVisible?: boolean } ) => {
		const combined: Suggestion[] = [];
		const seenIds = new Set< string >();
		for ( const hook of hooks ) {
			const suggestions = hook( maxSuggestions, options )?.suggestions ?? [];
			for ( const s of suggestions ) {
				if ( ! seenIds.has( s.id ) ) {
					seenIds.add( s.id );
					combined.push( s );
				}
			}
		}
		return { suggestions: combined };
	};
}

/**
 * Load external agent providers from agentsManagerData.agentProviders.
 *
 * Providers can be dynamically imported using WordPress's script module
 * system. Modules should export { toolProvider, contextProvider }.
 *
 * Alternatively, an already-loaded provider object can be passed in.
 *
 * Both shapes feed the same downstream merge: any of `toolProvider`,
 * `contextProvider`, `getChatComponent`, `useSuggestions`, etc. are picked
 * up from each entry and merged across all entries.
 * @returns Promise resolving to merged providers or empty object if none found.
 */
export async function loadExternalProviders(): Promise< LoadedProviders > {
	const agentProviders =
		typeof agentsManagerData !== 'undefined' ? agentsManagerData?.agentProviders || [] : [];

	// Only the public reader-chat entry registers the follow-up chip globals
	// (`window.__jetpackReaderFollowupChips` / `reader-chat-followups-updated`).
	// Register the bridge for every reader-chat agent variant that uses the
	// public reader-chat entry.
	const registerReaderFollowups =
		typeof window !== 'undefined' &&
		isReaderChatAgent(
			( window as unknown as { agentsManagerData?: { agentId?: string } } ).agentsManagerData
				?.agentId
		);

	if ( registerReaderFollowups ) {
		// Reader Chat runs on the public frontend and should not inherit editor providers
		// such as the Jetpack AI sidebar.
		return { useSuggestions: useReaderFollowupSuggestions };
	}

	if ( agentProviders.length === 0 ) {
		return {};
	}

	let mergedToolProvider: ToolProvider | undefined;
	let mergedContextProvider: ContextProvider | undefined;
	let mergedGetEmptyViewSuggestions: ( () => Suggestion[] ) | undefined;
	let mergedMarkdownComponents: MarkdownComponents | undefined;
	let mergedMarkdownExtensions: MarkdownExtensions | undefined;
	let mergedNavigationContinuation: NavigationContinuationHook | undefined;
	let mergedAbilitiesSetup: AbilitiesSetupHook | undefined;
	let mergedGetChatComponent: GetChatComponent | undefined;
	let mergedSiteBuildUtils: SiteBuildUtils | undefined;
	let mergedImageUpload: ImageUploadHook | undefined;
	let mergedUseCheckpoint: UseCheckpointHook | undefined;
	// OR-merged across all providers.
	const mergedCapabilities: ProviderCapabilities = {};
	const abilityProviderMap = new Map< string, AbilityProviderEntry >();

	// Collect exports that need to be merged across all providers.
	const allToolProviders: ToolProvider[] = [];
	const allGetChatComponents: Array< {
		getChatComponent: GetChatComponent;
		toolProvider?: ToolProvider;
	} > = [];
	const allAbilitiesSetups: AbilitiesSetupHook[] = [];
	const allUseSuggestions: UseSuggestionsHook[] = [];
	const allGetEmptyViewSuggestions: ( () => Suggestion[] )[] = [];

	// Load all providers in parallel to avoid serializing network/module fetches.
	// Results are processed in registration order to preserve first-write-wins semantics.
	const loadedModules = await Promise.all(
		agentProviders.map( async ( providerEntry ) => {
			if ( typeof providerEntry === 'object' && providerEntry !== null ) {
				return providerEntry;
			}

			try {
				// Dynamic import of registered script module
				// The webpackIgnore comment tells webpack not to bundle this - it's loaded at runtime
				const module = await import( /* webpackIgnore: true */ providerEntry );
				// eslint-disable-next-line no-console
				console.log( `[AgentsManager] Loaded provider "${ providerEntry }"` );
				return module;
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( `[AgentsManager] Failed to load provider "${ providerEntry }":`, error );
				return null;
			}
		} )
	);

	for ( const module of loadedModules ) {
		if ( ! module ) {
			continue;
		}

		// These exports are merged across all providers.
		if ( module.toolProvider ) {
			allToolProviders.push( module.toolProvider );
		}
		if ( module.getChatComponent ) {
			allGetChatComponents.push( {
				getChatComponent: module.getChatComponent,
				toolProvider: module.toolProvider,
			} );
		}
		if ( module.useAbilitiesSetup ) {
			allAbilitiesSetups.push( module.useAbilitiesSetup );
		}
		if ( module.useSuggestions ) {
			allUseSuggestions.push( module.useSuggestions );
		}
		if ( module.getEmptyViewSuggestions ) {
			allGetEmptyViewSuggestions.push( module.getEmptyViewSuggestions );
		}

		// First-write-wins for singleton exports.
		if ( module.contextProvider && ! mergedContextProvider ) {
			mergedContextProvider = module.contextProvider;
		}
		if ( module.markdownComponents && ! mergedMarkdownComponents ) {
			mergedMarkdownComponents = module.markdownComponents;
		}
		if ( module.markdownExtensions && ! mergedMarkdownExtensions ) {
			mergedMarkdownExtensions = module.markdownExtensions;
		}
		if ( module.useNavigationContinuation && ! mergedNavigationContinuation ) {
			mergedNavigationContinuation = module.useNavigationContinuation;
		}
		if ( module.siteBuildUtils && ! mergedSiteBuildUtils ) {
			mergedSiteBuildUtils = module.siteBuildUtils;
		}
		if ( module.useImageUpload && ! mergedImageUpload ) {
			mergedImageUpload = module.useImageUpload;
		}
		if ( module.useCheckpoint && ! mergedUseCheckpoint ) {
			mergedUseCheckpoint = module.useCheckpoint;
		}

		mergeCapabilitiesInto( mergedCapabilities, module.capabilities );
	}

	// Merge toolProviders: first-write-wins by ability name, matching the
	// resolution order of every other merged provider export (contextProvider,
	// getChatComponent, useSuggestions, etc). Providers are processed in the
	// order they were registered; earlier providers win on ability-name
	// collisions.
	const refreshProviderAbilities = async () => {
		abilityProviderMap.clear();

		const allAbilityResults = await Promise.all(
			allToolProviders.map( async ( tp ) => {
				try {
					const abilities = await tp.getAbilities();
					if ( ! Array.isArray( abilities ) ) {
						// eslint-disable-next-line no-console
						console.warn( '[AgentsManager] Provider returned invalid abilities; expected array.' );
						return [];
					}
					return abilities;
				} catch ( error ) {
					// eslint-disable-next-line no-console
					console.warn( '[AgentsManager] Failed to load abilities from provider:', error );
					return [];
				}
			} )
		);
		const seenAbilities = new Map< string, unknown >();
		// Normalize ability names: AM converts `/` → `__` and `-` → `_`
		// when routing tool calls. Index both raw and normalized forms
		// so executeAbility matches regardless of which form the caller uses.
		const normalize = ( name: string ) => name.replace( /\//g, '__' ).replace( /-/g, '_' );
		for ( let i = 0; i < allToolProviders.length; i++ ) {
			for ( const ability of allAbilityResults[ i ] ) {
				if ( ! ability || typeof ability.name !== 'string' ) {
					continue;
				}

				const normalized = normalize( ability.name );
				if ( ability.name === BIG_SKY_SHOW_COMPONENT_ABILITY ) {
					const entry = {
						provider: allToolProviders[ i ],
						abilityName: ability.name,
					};
					const abilityWithCallback = addProviderCallbackToAbility( ability, entry );
					abilityProviderMap.set( ability.name, entry );
					abilityProviderMap.set( BIG_SKY_SHOW_COMPONENT_AGENTTIC_TOOL_ID, entry );
					abilityProviderMap.set( BIG_SKY_SHOW_COMPONENT_TOOL_ID, entry );
					seenAbilities.set( BIG_SKY_SHOW_COMPONENT_TOOL_ID, abilityWithCallback );
					continue;
				}

				const existingEntry =
					abilityProviderMap.get( ability.name ) ?? abilityProviderMap.get( normalized );
				if ( existingEntry ) {
					if ( ! abilityProviderMap.has( ability.name ) ) {
						abilityProviderMap.set( ability.name, existingEntry );
					}
					if ( ! abilityProviderMap.has( normalized ) ) {
						abilityProviderMap.set( normalized, existingEntry );
					}
					continue;
				}

				const entry = {
					provider: allToolProviders[ i ],
					abilityName: ability.name,
				};
				abilityProviderMap.set( ability.name, entry );
				abilityProviderMap.set( normalized, entry );
				seenAbilities.set( normalized, addProviderCallbackToAbility( ability, entry ) );
			}
		}

		return [ ...seenAbilities.values() ] as Awaited< ReturnType< ToolProvider[ 'getAbilities' ] > >;
	};

	if ( allToolProviders.length > 0 ) {
		mergedToolProvider = {
			getAbilities: refreshProviderAbilities,
			executeAbility: async ( name: string, args: unknown ) => {
				// Rebuild at execution time because some provider abilities are
				// registered by setup hooks after the provider module is imported.
				await refreshProviderAbilities();
				const entry = abilityProviderMap.get( name );
				if ( entry ) {
					return entry.provider.executeAbility( entry.abilityName, args );
				}
				throw new Error( `No provider handled ability: ${ name }` );
			},
		};
	}

	// Merge getChatComponent: try each provider, return first non-null.
	if ( allGetChatComponents.length === 1 ) {
		mergedGetChatComponent = allGetChatComponents[ 0 ].getChatComponent;
	} else if ( allGetChatComponents.length > 1 ) {
		mergedGetChatComponent = ( ( type: string, context?: GetChatComponentContext ) => {
			const sourceProvider =
				typeof context?.toolId === 'string'
					? abilityProviderMap.get( context.toolId )?.provider
					: undefined;
			const sourceComponentResolver = sourceProvider
				? allGetChatComponents.find( ( entry ) => entry.toolProvider === sourceProvider )
				: undefined;

			if ( sourceComponentResolver ) {
				const result = sourceComponentResolver.getChatComponent( type, context );
				if ( result ) {
					return result;
				}
			}

			for ( const entry of allGetChatComponents ) {
				if ( entry === sourceComponentResolver ) {
					continue;
				}
				const result = entry.getChatComponent( type, context );
				if ( result ) {
					return result;
				}
			}
			return null;
		} ) as GetChatComponent;
	}

	// Merge useAbilitiesSetup: call ALL providers' hooks.
	if ( allAbilitiesSetups.length === 1 ) {
		mergedAbilitiesSetup = allAbilitiesSetups[ 0 ];
	} else if ( allAbilitiesSetups.length > 1 ) {
		mergedAbilitiesSetup = ( ( actions ) => {
			for ( const fn of allAbilitiesSetups ) {
				fn( actions );
			}
		} ) as AbilitiesSetupHook;
	}

	// Merge useSuggestions: combine from all providers, dedupe by id.
	const mergedUseSuggestions = mergeUseSuggestionsHooks( allUseSuggestions );

	// Merge getEmptyViewSuggestions: combine from all providers, dedupe by id.
	if ( allGetEmptyViewSuggestions.length === 1 ) {
		mergedGetEmptyViewSuggestions = allGetEmptyViewSuggestions[ 0 ];
	} else if ( allGetEmptyViewSuggestions.length > 1 ) {
		mergedGetEmptyViewSuggestions = () => {
			const combined: Suggestion[] = [];
			const seenIds = new Set< string >();
			for ( const fn of allGetEmptyViewSuggestions ) {
				for ( const s of fn() ) {
					if ( ! seenIds.has( s.id ) ) {
						seenIds.add( s.id );
						combined.push( s );
					}
				}
			}
			return combined;
		};
	}

	return {
		toolProvider: mergedToolProvider,
		contextProvider: mergedContextProvider,
		getEmptyViewSuggestions: mergedGetEmptyViewSuggestions,
		markdownComponents: mergedMarkdownComponents,
		markdownExtensions: mergedMarkdownExtensions,
		useNavigationContinuation: mergedNavigationContinuation,
		useAbilitiesSetup: mergedAbilitiesSetup,
		useSuggestions: mergedUseSuggestions,
		getChatComponent: mergedGetChatComponent,
		siteBuildUtils: mergedSiteBuildUtils,
		useImageUpload: mergedImageUpload,
		useCheckpoint: mergedUseCheckpoint,
		// Match peer fields: undefined when no provider opted in.
		capabilities: Object.keys( mergedCapabilities ).length ? mergedCapabilities : undefined,
	};
}
