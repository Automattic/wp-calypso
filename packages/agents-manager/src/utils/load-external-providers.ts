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
import { getAgentsManagerInlineData } from './get-agents-manager-inline-data';
import { isReaderChatAgent } from './is-reader-chat-agent';
import { useReaderFollowupSuggestions } from './reader-followup-hook';
import type { ImageUploadHook } from '../hooks/use-image-upload';
import type {
	ToolProvider,
	ContextProvider,
	ClientContextType,
	ContextEntry,
	Suggestion,
	BigSkyMessage,
} from '../types';
import type { UseAgentChatReturn } from '@automattic/agenttic-client';
import type { MarkdownComponents, MarkdownExtensions } from '@automattic/agenttic-ui';
import type { ReactNode } from 'react';

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
	/** Whether contextual suggestions replace, rather than extend, the empty-view suggestions. */
	replaceEmptyViewSuggestions?: boolean;
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
 * @returns The React component for the specified type, or `null` if unknown
 */
export type GetChatComponent = ( type: ChatComponentType ) => React.ComponentType< unknown > | null;

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
	/** Adds Agenttic's built-in regenerate action to agent messages when true. */
	supportsRegenerateAction?: boolean;
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
	if ( caps.supportsRegenerateAction === true ) {
		merged.supportsRegenerateAction = true;
	}
}

export interface LoadedProviders {
	/** Optional stable provider identifier exported by a provider module. */
	providerId?: string;
	/** Stable IDs for the provider modules that were successfully loaded. */
	providerIds?: string[];
	toolProvider?: ToolProvider;
	contextProvider?: ContextProvider;
	/** Function to get empty view suggestions. Called when component is ready. */
	getEmptyViewSuggestions?: () => Suggestion[];
	/**
	 * Opt out of the built-in empty-view default suggestions ("Getting started
	 * with WordPress" etc.) for this provider's surfaces. When any loaded
	 * provider sets this to `true`, `useEmptyViewSuggestions` returns `[]`
	 * instead of the defaults whenever it would otherwise fall back to them.
	 * Provider-specific `getEmptyViewSuggestions` still wins when it returns
	 * non-empty filtered suggestions.
	 */
	suppressEmptyViewDefaults?: boolean;
	markdownComponents?: MarkdownComponents;
	markdownExtensions?: MarkdownExtensions;
	useNavigationContinuation?: NavigationContinuationHook;
	useAbilitiesSetup?: AbilitiesSetupHook;
	useSuggestions?: UseSuggestionsHook;
	getChatComponent?: GetChatComponent;
	siteBuildUtils?: SiteBuildUtils;
	useImageUpload?: ImageUploadHook;
	useCheckpoint?: UseCheckpointHook;
	/**
	 * Streamed task-update callback, forwarded to useAgentChat's `onTaskUpdate`.
	 * Lets a provider react to streamed tool-argument deltas as they arrive — e.g.
	 * paint streamed page-design block markup into the editor. First-write-wins
	 * across providers (a singleton: the delta stream must be processed once, not
	 * fanned out to every provider).
	 */
	onTaskUpdate?: ( update: unknown ) => void | Promise< void >;
	capabilities?: ProviderCapabilities;
}

type LoadedProviderModule = {
	module: LoadedProviders;
	providerId?: string;
};

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
		const results = hooks.map( ( hook ) => hook( maxSuggestions, options ) );
		const replaceEmptyViewSuggestions = results.some(
			( result ) => result?.replaceEmptyViewSuggestions === true
		);

		for ( const result of results ) {
			if ( ! result || ( replaceEmptyViewSuggestions && ! result.replaceEmptyViewSuggestions ) ) {
				continue;
			}
			const suggestions = result.suggestions ?? [];
			for ( const s of suggestions ) {
				if ( ! seenIds.has( s.id ) ) {
					seenIds.add( s.id );
					combined.push( s );
				}
			}
		}
		return {
			suggestions: combined,
			...( replaceEmptyViewSuggestions && { replaceEmptyViewSuggestions: true } ),
		};
	};
}

function isRecord( value: unknown ): value is Record< string, unknown > {
	return typeof value === 'object' && value !== null;
}

function getValidProviderId( providerId: unknown ): string | undefined {
	if ( typeof providerId !== 'string' ) {
		return undefined;
	}

	const trimmedProviderId = providerId.trim();
	return trimmedProviderId ? trimmedProviderId : undefined;
}

function getProviderEntryId( providerEntry: string | LoadedProviders ): string | undefined {
	if ( ! isRecord( providerEntry ) ) {
		return undefined;
	}

	return getValidProviderId( providerEntry.providerId );
}

function addProviderId( providerIds: string[], providerId?: string ): void {
	if ( ! providerId || providerIds.includes( providerId ) ) {
		return;
	}

	providerIds.push( providerId );
}

function mergeContextEntries(
	firstEntries: ContextEntry[] | undefined,
	nextEntries: ContextEntry[] | undefined
): ContextEntry[] | undefined {
	const entries = [ ...( firstEntries || [] ) ];
	const seenIds = new Set( entries.map( ( entry ) => entry.id ) );

	for ( const entry of nextEntries || [] ) {
		if ( seenIds.has( entry.id ) ) {
			continue;
		}
		seenIds.add( entry.id );
		entries.push( entry );
	}

	return entries.length ? entries : undefined;
}

function getConstructorArguments(
	context: ClientContextType
): Record< string, unknown > | undefined {
	const constructorArguments = context.constructorArguments;
	return isRecord( constructorArguments ) ? constructorArguments : undefined;
}

function mergeClientContexts( contexts: ClientContextType[] ): ClientContextType {
	const [ firstContext, ...remainingContexts ] = contexts;
	let mergedContext = { ...firstContext };

	for ( const context of remainingContexts ) {
		const contextEntries = mergeContextEntries(
			mergedContext.contextEntries,
			context.contextEntries
		);
		const constructorArguments = {
			...( getConstructorArguments( context ) || {} ),
			...( getConstructorArguments( mergedContext ) || {} ),
		};

		mergedContext = {
			...context,
			...mergedContext,
			...( contextEntries && { contextEntries } ),
			...( Object.keys( constructorArguments ).length > 0 && { constructorArguments } ),
		};
	}

	return mergedContext;
}

function getFallbackClientContext(): ClientContextType {
	const location =
		typeof window !== 'undefined' ? window.location : { href: '', pathname: '', search: '' };

	return {
		url: location.href,
		pathname: location.pathname,
		search: location.search,
		environment: 'wp-admin',
	};
}

export function mergeContextProviders(
	contextProviders: ContextProvider[]
): ContextProvider | undefined {
	if ( contextProviders.length === 0 ) {
		return undefined;
	}

	if ( contextProviders.length === 1 ) {
		return contextProviders[ 0 ];
	}

	return {
		getClientContext: () => {
			const contexts: ClientContextType[] = [];

			for ( const contextProvider of contextProviders ) {
				try {
					contexts.push( contextProvider.getClientContext() );
				} catch ( error ) {
					// eslint-disable-next-line no-console
					console.warn( '[AgentsManager] Failed to load context from provider:', error );
				}
			}

			return contexts.length ? mergeClientContexts( contexts ) : getFallbackClientContext();
		},
	};
}

function isPlainMarkdownFallback( value: unknown, componentName: string ): boolean {
	return isRecord( value ) && value.type === componentName;
}

function composeMarkdownCodeComponents( components: unknown[] ): unknown {
	const callableComponents = components.filter(
		( component ): component is ( props: Record< string, unknown > ) => ReactNode =>
			typeof component === 'function'
	);

	if ( callableComponents.length !== components.length ) {
		return components[ 0 ];
	}

	return ( props: Record< string, unknown > ) => {
		let firstFallback: ReactNode | undefined;

		for ( const component of callableComponents ) {
			const result = component( props );
			if ( ! isPlainMarkdownFallback( result, 'code' ) ) {
				return result;
			}

			if ( firstFallback === undefined ) {
				firstFallback = result;
			}
		}

		return firstFallback ?? null;
	};
}

export function mergeMarkdownComponentsFromProviders(
	componentGroups: MarkdownComponents[]
): MarkdownComponents | undefined {
	if ( componentGroups.length === 0 ) {
		return undefined;
	}

	if ( componentGroups.length === 1 ) {
		return componentGroups[ 0 ];
	}

	const componentsByName = new Map< string, unknown[] >();
	for ( const components of componentGroups ) {
		for ( const [ name, component ] of Object.entries( components ) ) {
			const existing = componentsByName.get( name ) || [];
			existing.push( component );
			componentsByName.set( name, existing );
		}
	}

	const mergedComponents: Record< string, unknown > = {};
	for ( const [ name, components ] of componentsByName ) {
		mergedComponents[ name ] =
			name === 'code' && components.length > 1
				? composeMarkdownCodeComponents( components )
				: components[ 0 ];
	}

	return mergedComponents as MarkdownComponents;
}

export function mergeMarkdownExtensionsFromProviders(
	extensionGroups: MarkdownExtensions[]
): MarkdownExtensions | undefined {
	if ( extensionGroups.length === 0 ) {
		return undefined;
	}

	if ( extensionGroups.length === 1 ) {
		return extensionGroups[ 0 ];
	}

	return extensionGroups.reduce< MarkdownExtensions >(
		( merged, extensions ) => ( { ...extensions, ...merged } ),
		{}
	);
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
	const rawAgentProviders = getAgentsManagerInlineData()?.agentProviders;
	const agentProviders = Array.isArray( rawAgentProviders ) ? rawAgentProviders : [];

	// Only the public reader-chat entry registers the follow-up chip globals
	// (`window.__jetpackReaderFollowupChips` / `reader-chat-followups-updated`).
	// Register the bridge for every reader-chat agent variant that uses the
	// public reader-chat entry.
	const registerReaderFollowups = isReaderChatAgent( getAgentsManagerInlineData()?.agentId );

	if ( registerReaderFollowups ) {
		// Reader Chat runs on the public frontend and should not inherit editor providers
		// such as the Jetpack AI sidebar.
		return { useSuggestions: useReaderFollowupSuggestions };
	}

	if ( agentProviders.length === 0 ) {
		return {};
	}

	let mergedToolProvider: ToolProvider | undefined;
	let mergedGetEmptyViewSuggestions: ( () => Suggestion[] ) | undefined;
	let mergedNavigationContinuation: NavigationContinuationHook | undefined;
	let mergedAbilitiesSetup: AbilitiesSetupHook | undefined;
	let mergedGetChatComponent: GetChatComponent | undefined;
	let mergedSiteBuildUtils: SiteBuildUtils | undefined;
	let mergedImageUpload: ImageUploadHook | undefined;
	let mergedUseCheckpoint: UseCheckpointHook | undefined;
	let mergedOnTaskUpdate: LoadedProviders[ 'onTaskUpdate' ] | undefined;
	// OR-merged across all providers.
	const mergedCapabilities: ProviderCapabilities = {};
	let mergedSuppressEmptyViewDefaults = false;

	// Collect exports that need to be merged across all providers.
	const allToolProviders: ToolProvider[] = [];
	const allContextProviders: ContextProvider[] = [];
	const allMarkdownComponents: MarkdownComponents[] = [];
	const allMarkdownExtensions: MarkdownExtensions[] = [];
	const allGetChatComponents: GetChatComponent[] = [];
	const allAbilitiesSetups: AbilitiesSetupHook[] = [];
	const allUseSuggestions: UseSuggestionsHook[] = [];
	const allGetEmptyViewSuggestions: ( () => Suggestion[] )[] = [];
	const allProviderIds: string[] = [];

	// Load all providers in parallel to avoid serializing network/module fetches.
	// Results are processed in registration order to preserve first-write-wins semantics.
	const loadedModules = ( await Promise.all(
		agentProviders.map( async ( providerEntry ) => {
			// Already-loaded provider object: use it directly and read its own ID.
			if ( typeof providerEntry === 'object' && providerEntry !== null ) {
				return {
					module: providerEntry as LoadedProviders,
					providerId: getProviderEntryId( providerEntry ),
				};
			}

			try {
				// Dynamic import of registered script module
				// The webpackIgnore comment tells webpack not to bundle this - it's loaded at runtime
				const module = ( await import(
					/* webpackIgnore: true */ providerEntry
				) ) as LoadedProviders;
				// eslint-disable-next-line no-console
				console.log( `[AgentsManager] Loaded provider "${ providerEntry }"` );
				// The provider module is the source of truth for its own stable ID.
				return { module, providerId: getProviderEntryId( module ) };
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( `[AgentsManager] Failed to load provider "${ providerEntry }":`, error );
				return null;
			}
		} )
	) ) as ( LoadedProviderModule | null )[];

	for ( const loadedModule of loadedModules ) {
		if ( ! loadedModule ) {
			continue;
		}

		const { module, providerId } = loadedModule;
		addProviderId( allProviderIds, providerId );

		// These exports are merged across all providers.
		if ( module.toolProvider ) {
			allToolProviders.push( module.toolProvider );
		}
		if ( module.getChatComponent ) {
			allGetChatComponents.push( module.getChatComponent );
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
		if ( module.contextProvider ) {
			allContextProviders.push( module.contextProvider );
		}
		if ( module.markdownComponents ) {
			allMarkdownComponents.push( module.markdownComponents );
		}
		if ( module.markdownExtensions ) {
			allMarkdownExtensions.push( module.markdownExtensions );
		}

		// First-write-wins for singleton exports.
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
		if ( module.onTaskUpdate && ! mergedOnTaskUpdate ) {
			mergedOnTaskUpdate = module.onTaskUpdate;
		}

		mergeCapabilitiesInto( mergedCapabilities, module.capabilities );

		// Strict `=== true` because `module` arrives untyped from runtime
		// imports; a stray `'false'` string would otherwise opt in.
		if ( module.suppressEmptyViewDefaults === true ) {
			mergedSuppressEmptyViewDefaults = true;
		}
	}

	const mergedContextProvider = mergeContextProviders( allContextProviders );
	const mergedMarkdownComponents = mergeMarkdownComponentsFromProviders( allMarkdownComponents );
	const mergedMarkdownExtensions = mergeMarkdownExtensionsFromProviders( allMarkdownExtensions );

	// Merge toolProviders: first-write-wins by ability name, matching the
	// resolution order of colliding provider exports. Providers are processed
	// in the order they were registered; earlier providers win on collisions.
	if ( allToolProviders.length === 1 ) {
		mergedToolProvider = allToolProviders[ 0 ];
	} else if ( allToolProviders.length > 1 ) {
		// Normalize ability names: AM converts `/` → `__` and `-` → `_` when
		// routing tool calls, so we match on either the raw or normalized form.
		const normalize = ( name: string ) => name.replace( /\//g, '__' ).replace( /-/g, '_' );

		// Query providers live on each call rather than snapshotting at load.
		// agenttic-client calls getAbilities()/executeAbility() fresh every turn,
		// so abilities registered later stay visible. Big Sky, for one, registers
		// its editor abilities (big-sky/apply-block-edits and friends) from a
		// React effect that runs after loadExternalProviders(); a captured list
		// would freeze those out and the agent's calls would silently not dispatch.
		const collectAbilityResults = async () =>
			Promise.all(
				allToolProviders.map( async ( tp ) => {
					try {
						return await tp.getAbilities();
					} catch ( error ) {
						// eslint-disable-next-line no-console
						console.warn( '[AgentsManager] Failed to load abilities from provider:', error );
						return [];
					}
				} )
			);

		mergedToolProvider = {
			getAbilities: async () => {
				const results = await collectAbilityResults();
				// Dedupe by ability name; earlier providers win on collisions.
				const seenAbilities = new Map< string, ( typeof results )[ number ][ number ] >();
				for ( const abilities of results ) {
					for ( const ability of abilities ) {
						if ( ! seenAbilities.has( ability.name ) ) {
							seenAbilities.set( ability.name, ability );
						}
					}
				}
				return [ ...seenAbilities.values() ];
			},
			executeAbility: async ( name: string, args: unknown ) => {
				// Resolve the owning provider live, in registration order, so the
				// earliest provider that currently exposes the ability handles it.
				const results = await collectAbilityResults();
				for ( let i = 0; i < allToolProviders.length; i++ ) {
					const owns = results[ i ].some(
						( ability ) => ability.name === name || normalize( ability.name ) === name
					);
					if ( owns ) {
						return allToolProviders[ i ].executeAbility( name, args );
					}
				}
				throw new Error( `No provider handled ability: ${ name }` );
			},
		};
	}

	// Merge getChatComponent: try each provider, return first non-null.
	if ( allGetChatComponents.length === 1 ) {
		mergedGetChatComponent = allGetChatComponents[ 0 ];
	} else if ( allGetChatComponents.length > 1 ) {
		mergedGetChatComponent = ( ( type: string ) => {
			for ( const fn of allGetChatComponents ) {
				const result = fn( type as ChatComponentType );
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
		providerIds: allProviderIds.length ? allProviderIds : undefined,
		useNavigationContinuation: mergedNavigationContinuation,
		useAbilitiesSetup: mergedAbilitiesSetup,
		onTaskUpdate: mergedOnTaskUpdate,
		useSuggestions: mergedUseSuggestions,
		getChatComponent: mergedGetChatComponent,
		siteBuildUtils: mergedSiteBuildUtils,
		useImageUpload: mergedImageUpload,
		useCheckpoint: mergedUseCheckpoint,
		// Match peer fields: undefined when no provider opted in.
		capabilities: Object.keys( mergedCapabilities ).length ? mergedCapabilities : undefined,
		suppressEmptyViewDefaults: mergedSuppressEmptyViewDefaults ? true : undefined,
	};
}
