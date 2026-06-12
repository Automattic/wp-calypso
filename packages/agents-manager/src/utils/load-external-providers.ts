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
import {
	abilityNameAliases,
	findAbilityClaimant,
	normalizeAbilityName,
	resolveEffectiveAgentId,
	resolveProviderComposition,
	type ProviderCompositionManifest,
	type ProviderCompositionPolicy,
	type ResolvedProviderManifest,
} from './provider-composition';
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
 * Supported built-in chat component types for agent messages.
 */
export type BuiltInChatComponentType =
	| 'button-picker'
	| 'font-picker'
	| 'color-picker'
	| 'pattern-picker'
	| 'chat-suggestions'
	| 'next-step-button';

export type ChatComponentType = BuiltInChatComponentType | ( string & {} );

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

function findCheckpointOwner(
	checkpoints: UseCheckpointReturn[],
	checkpointId: string
): UseCheckpointReturn | undefined {
	return checkpoints.find( ( checkpoint ) => checkpoint.hasCheckpoint( checkpointId ) );
}

function mergeCheckpointApis(
	primary: UseCheckpointReturn,
	checkpoints: UseCheckpointReturn[]
): UseCheckpointReturn {
	return {
		...primary,
		hasCheckpoint: ( checkpointId ) => !! findCheckpointOwner( checkpoints, checkpointId ),
		restoreCheckpoint: async ( checkpointId ) => {
			const owner = findCheckpointOwner( checkpoints, checkpointId );
			await ( owner ?? primary ).restoreCheckpoint( checkpointId );
		},
		clearCheckpoint: ( checkpointId ) => {
			for ( const checkpoint of checkpoints ) {
				checkpoint.clearCheckpoint( checkpointId );
			}
		},
	};
}

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
	compositionManifest?: ProviderCompositionManifest;
}

type AbilityProviderEntry = {
	provider: ToolProvider;
	abilityName: string;
};
type ProviderAbilities = Awaited< ReturnType< ToolProvider[ 'getAbilities' ] > >;

type ProviderClientContext = ReturnType< ContextProvider[ 'getClientContext' ] >;
type ToolProviderEntry = {
	toolProvider: ToolProvider;
	manifest: ResolvedProviderManifest;
};
type ContextProviderEntry = {
	contextProvider: ContextProvider;
	manifest: ResolvedProviderManifest;
};
type ChatComponentProviderEntry = {
	getChatComponent: GetChatComponent;
	manifest: ResolvedProviderManifest;
};

function mergeContextEntries(
	firstEntries?: ProviderClientContext[ 'contextEntries' ],
	secondEntries?: ProviderClientContext[ 'contextEntries' ]
): ProviderClientContext[ 'contextEntries' ] | undefined {
	const entries = [ ...( firstEntries || [] ), ...( secondEntries || [] ) ];
	if ( entries.length === 0 ) {
		return undefined;
	}

	const merged = [];
	const seenIds = new Set< string >();
	for ( const entry of entries ) {
		if ( entry?.id && seenIds.has( entry.id ) ) {
			continue;
		}
		if ( entry?.id ) {
			seenIds.add( entry.id );
		}
		merged.push( entry );
	}
	return merged;
}

function isEmptyContextValue( value: unknown ): boolean {
	return value === undefined || value === null || value === '';
}

function isPlainRecord( value: unknown ): value is Record< string, unknown > {
	return !! value && typeof value === 'object' && ! Array.isArray( value );
}

function mergeClientContexts(
	firstContext: ProviderClientContext,
	secondContext: ProviderClientContext
): ProviderClientContext {
	const merged = { ...firstContext };

	for ( const [ key, value ] of Object.entries( secondContext ) ) {
		if ( key === 'contextEntries' ) {
			continue;
		}

		const existing = merged[ key ];
		if (
			[ 'constructorArguments', 'currentScreen', 'siteEditorActions' ].includes( key ) &&
			isPlainRecord( existing ) &&
			isPlainRecord( value )
		) {
			merged[ key ] = { ...value, ...existing };
			continue;
		}

		if ( isEmptyContextValue( existing ) && ! isEmptyContextValue( value ) ) {
			merged[ key ] = value;
		}
	}

	const contextEntries = mergeContextEntries(
		firstContext.contextEntries,
		secondContext.contextEntries
	);
	if ( contextEntries ) {
		merged.contextEntries = contextEntries;
	}

	return merged;
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
		getClientContext: () =>
			contextProviders
				.map( ( contextProvider ) => contextProvider.getClientContext() )
				.reduce( mergeClientContexts ),
	};
}

/**
 * Apply a guest's contribution to the merged client context: claimed keys
 * override the host outright, `contextEntries` are id-deduped additions, and
 * everything else the guest returns is ignored. Hosts own the rest of the
 * context; a guest that needs a key considered must claim it.
 */
function applyGuestClaimedContext(
	merged: ProviderClientContext,
	guestContext: ProviderClientContext,
	claimedContextKeys: string[]
): ProviderClientContext {
	const next = { ...merged };
	for ( const key of claimedContextKeys ) {
		if ( key === 'contextEntries' ) {
			continue;
		}

		const value = guestContext[ key ];
		if ( ! isEmptyContextValue( value ) ) {
			next[ key ] = value;
		}
	}

	const contextEntries = mergeContextEntries( next.contextEntries, guestContext.contextEntries );
	if ( contextEntries ) {
		next.contextEntries = contextEntries;
	}
	return next;
}

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
 * @param effectiveAgentId The resolved agent id from `useAgentConfig`. Guest
 * manifests are gated against this; when omitted, the loader falls back to
 * the synchronous parts of the same resolution chain.
 * @returns Promise resolving to merged providers or empty object if none found.
 */
export async function loadExternalProviders(
	effectiveAgentId?: string
): Promise< LoadedProviders > {
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
	const lastGoodProviderAbilities = new Map< ToolProvider, ProviderAbilities >();

	// Collect exports that need to be merged across all providers.
	const allToolProviders: ToolProviderEntry[] = [];
	const allContextProviders: ContextProviderEntry[] = [];
	const allGetChatComponents: ChatComponentProviderEntry[] = [];
	const allAbilitiesSetups: AbilitiesSetupHook[] = [];
	const allUseSuggestions: UseSuggestionsHook[] = [];
	const allGetEmptyViewSuggestions: ( () => Suggestion[] )[] = [];
	const allUseCheckpoints: Array< {
		hook: UseCheckpointHook;
		manifest: ResolvedProviderManifest;
	} > = [];
	// Routing drops are logged once per (provider, ability) so the per-call
	// abilities refresh cannot spam the console.
	const loggedAbilityRoutingDrops = new Set< string >();

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

	const policy = resolveProviderComposition(
		loadedModules,
		resolveEffectiveAgentId( effectiveAgentId )
	) as ProviderCompositionPolicy< LoadedProviders >;
	for ( const notice of policy.notices ) {
		// eslint-disable-next-line no-console
		console.warn( notice );
	}
	const guests = policy.guests;

	// Claims are immutable after load, so memoize name -> claimant.
	const abilityClaimantCache = new Map< string, ( typeof guests )[ number ] | undefined >();
	const getAbilityClaimant = ( abilityName: string ) => {
		if ( ! abilityClaimantCache.has( abilityName ) ) {
			abilityClaimantCache.set( abilityName, findAbilityClaimant( guests, abilityName ) );
		}
		return abilityClaimantCache.get( abilityName );
	};
	const warnRoutingDropOnce = ( dropKey: string, message: string ) => {
		if ( loggedAbilityRoutingDrops.has( dropKey ) ) {
			return;
		}
		loggedAbilityRoutingDrops.add( dropKey );
		// eslint-disable-next-line no-console
		console.warn( message );
	};

	for ( const providerEntry of policy.providers ) {
		const module = providerEntry.module;
		const manifest = providerEntry.manifest;

		if ( module.toolProvider ) {
			allToolProviders.push( {
				toolProvider: module.toolProvider,
				manifest,
			} );
		}
		if ( module.contextProvider ) {
			allContextProviders.push( {
				contextProvider: module.contextProvider,
				manifest,
			} );
		}
		if ( module.getChatComponent ) {
			allGetChatComponents.push( {
				getChatComponent: module.getChatComponent,
				manifest,
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

		if ( module.useCheckpoint ) {
			allUseCheckpoints.push( { hook: module.useCheckpoint, manifest } );
		}

		mergeCapabilitiesInto( mergedCapabilities, module.capabilities );
	}

	// For singleton exports, host wins before guest; registration order breaks ties.
	const singletonProviderOrder = [
		...policy.providers.filter( ( entry ) => entry.manifest.role === 'host' ),
		...policy.providers.filter( ( entry ) => entry.manifest.role === 'guest' ),
	];
	for ( const { module } of singletonProviderOrder ) {
		mergedMarkdownComponents ??= module.markdownComponents;
		mergedMarkdownExtensions ??= module.markdownExtensions;
		mergedNavigationContinuation ??= module.useNavigationContinuation;
		mergedSiteBuildUtils ??= module.siteBuildUtils;
		mergedImageUpload ??= module.useImageUpload;
	}

	// Run all checkpoint hooks so providers can register module-level snapshot
	// APIs, then route Undo actions to whichever provider owns the checkpoint id.
	if ( allUseCheckpoints.length === 1 ) {
		mergedUseCheckpoint = allUseCheckpoints[ 0 ].hook;
	} else if ( allUseCheckpoints.length > 1 ) {
		const primary =
			allUseCheckpoints.find( ( entry ) => entry.manifest.role === 'host' ) ??
			allUseCheckpoints[ 0 ];
		mergedUseCheckpoint = () => {
			let primaryReturn: UseCheckpointReturn | undefined;
			const checkpointReturns: UseCheckpointReturn[] = [];
			for ( const entry of allUseCheckpoints ) {
				const hookReturn = entry.hook();
				checkpointReturns.push( hookReturn );
				if ( entry === primary ) {
					primaryReturn = hookReturn;
				}
			}
			return mergeCheckpointApis( primaryReturn as UseCheckpointReturn, checkpointReturns );
		};
	}

	// Guest claims own matching abilities; hosts keep first-provider-wins for the rest.
	const refreshProviderAbilities = async () => {
		const allAbilityResults = await Promise.all(
			allToolProviders.map( async ( entry ) => {
				try {
					const abilities = await entry.toolProvider.getAbilities();
					if ( ! Array.isArray( abilities ) ) {
						// eslint-disable-next-line no-console
						console.warn( '[AgentsManager] Provider returned invalid abilities; expected array.' );
						return lastGoodProviderAbilities.get( entry.toolProvider ) ?? [];
					}
					lastGoodProviderAbilities.set( entry.toolProvider, abilities );
					return abilities;
				} catch ( error ) {
					// eslint-disable-next-line no-console
					console.warn( '[AgentsManager] Failed to load abilities from provider:', error );
					return lastGoodProviderAbilities.get( entry.toolProvider ) ?? [];
				}
			} )
		);
		const nextAbilityProviderMap = new Map< string, AbilityProviderEntry >();
		const seenAbilities = new Map< string, unknown >();

		for ( let i = 0; i < allToolProviders.length; i++ ) {
			const providerEntry = allToolProviders[ i ];
			for ( const ability of allAbilityResults[ i ] ) {
				if ( ! ability || typeof ability.name !== 'string' ) {
					continue;
				}

				const claimant = getAbilityClaimant( ability.name );
				if ( providerEntry.manifest.role === 'guest' ) {
					if ( claimant?.manifest !== providerEntry.manifest ) {
						// Guest providers can expose broad runtime abilities, but only
						// manifest-claimed names participate in composition.
						continue;
					}
				} else if ( claimant ) {
					warnRoutingDropOnce(
						`host:${ providerEntry.manifest.providerId }:${ ability.name }`,
						`[AgentsManager] Host ability "${ ability.name }" suppressed: namespace claimed by guest "${ claimant.manifest.providerId }".`
					);
					continue;
				}

				// Unclaimed names keep the legacy first-provider-wins rule.
				const normalized = normalizeAbilityName( ability.name );
				const aliases = abilityNameAliases( ability.name );
				let existingEntry: AbilityProviderEntry | undefined;
				for ( const alias of aliases ) {
					existingEntry = nextAbilityProviderMap.get( alias );
					if ( existingEntry ) {
						break;
					}
				}
				const entry = existingEntry ?? {
					provider: providerEntry.toolProvider,
					abilityName: ability.name,
				};
				for ( const alias of aliases ) {
					if ( ! nextAbilityProviderMap.has( alias ) ) {
						nextAbilityProviderMap.set( alias, entry );
					}
				}
				if ( ! existingEntry ) {
					seenAbilities.set( normalized, addProviderCallbackToAbility( ability, entry ) );
				}
			}
		}

		abilityProviderMap.clear();
		for ( const [ key, entry ] of nextAbilityProviderMap ) {
			abilityProviderMap.set( key, entry );
		}

		return [ ...seenAbilities.values() ] as Awaited< ReturnType< ToolProvider[ 'getAbilities' ] > >;
	};

	if ( allToolProviders.length > 0 ) {
		mergedToolProvider = {
			getAbilities: refreshProviderAbilities,
			executeAbility: async ( name: string, args: unknown ) => {
				// Setup hooks can register provider abilities after module import.
				await refreshProviderAbilities();
				const entry = abilityProviderMap.get( name );
				// Check claims on the canonical name when the map knows it.
				const claimant = getAbilityClaimant( entry?.abilityName ?? name );
				if ( entry ) {
					return entry.provider.executeAbility( entry.abilityName, args );
				}
				// Late-registered guest tools can execute before they appear in getAbilities().
				const claimantToolProvider = claimant?.module.toolProvider;
				if ( claimantToolProvider ) {
					return claimantToolProvider.executeAbility( name, args );
				}
				throw new Error( `No provider handled ability: ${ name }` );
			},
		};
	}

	// Hosts form the base context; guests add claimed keys and contextEntries.
	const hostMergedContextProvider = mergeContextProviders(
		allContextProviders
			.filter( ( entry ) => entry.manifest.role === 'host' )
			.map( ( entry ) => entry.contextProvider )
	);
	const guestContextProviders = allContextProviders.filter(
		( entry ) => entry.manifest.role === 'guest'
	);
	const mergedContextProvider: ContextProvider | undefined = guestContextProviders.length
		? {
				getClientContext: () =>
					guestContextProviders.reduce(
						( merged, entry ) =>
							applyGuestClaimedContext(
								merged,
								entry.contextProvider.getClientContext(),
								entry.manifest.claims.context
							),
						hostMergedContextProvider
							? { ...hostMergedContextProvider.getClientContext() }
							: ( {} as ProviderClientContext )
					),
		  }
		: hostMergedContextProvider;

	// Guest-claimed component types override host components.
	const componentClaimants = new Map< string, GetChatComponent >();
	for ( const guest of guests ) {
		const guestGetChatComponent = guest.module.getChatComponent;
		if ( ! guestGetChatComponent ) {
			continue;
		}
		for ( const type of guest.manifest.claims.components ) {
			componentClaimants.set( type, guestGetChatComponent );
		}
	}
	if ( allGetChatComponents.length === 1 ) {
		mergedGetChatComponent = allGetChatComponents[ 0 ].getChatComponent;
	} else if ( allGetChatComponents.length > 1 ) {
		mergedGetChatComponent = ( ( type: string ) => {
			const claimed = componentClaimants.get( type )?.( type );
			if ( claimed ) {
				return claimed;
			}
			for ( const entry of allGetChatComponents ) {
				if ( entry.manifest.role !== 'host' ) {
					continue;
				}
				const result = entry.getChatComponent( type );
				if ( result ) {
					return result;
				}
			}
			return null;
		} ) as GetChatComponent;
	}

	// Every provider's setup hook runs.
	if ( allAbilitiesSetups.length === 1 ) {
		mergedAbilitiesSetup = allAbilitiesSetups[ 0 ];
	} else if ( allAbilitiesSetups.length > 1 ) {
		mergedAbilitiesSetup = ( ( actions ) => {
			for ( const fn of allAbilitiesSetups ) {
				fn( actions );
			}
		} ) as AbilitiesSetupHook;
	}

	const mergedUseSuggestions = mergeUseSuggestionsHooks( allUseSuggestions );

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
