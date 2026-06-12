/**
 * Provider Merge Policies
 *
 * Pure helpers that combine the exports of multiple external agent providers
 * (tool abilities, client context, suggestions, checkpoints, capabilities)
 * into the single merged shape consumed by the chat runtime. Loading and
 * host/guest composition live in `load-external-providers.ts`; the manifest
 * claim rules live in `provider-composition.ts`.
 */

import type {
	ProviderCapabilities,
	UseCheckpointReturn,
	UseSuggestionsHook,
} from './load-external-providers';
import type { ToolProvider, ContextProvider } from '../types';

export type ProviderClientContext = ReturnType< ContextProvider[ 'getClientContext' ] >;

export type AbilityProviderEntry = {
	provider: ToolProvider;
	abilityName: string;
};

// Context keys whose record values are shallow-merged across providers,
// instead of the default first-non-empty-value-wins rule. These hold
// per-provider registrations (constructor args, screen state, editor actions)
// that must combine rather than shadow each other.
const SHALLOW_MERGED_CONTEXT_KEYS = new Set( [
	'constructorArguments',
	'currentScreen',
	'siteEditorActions',
] );

/** Drop entries whose `id` was already seen, keeping the first occurrence. Entries without an `id` are always kept. */
export function dedupeById< T extends { id?: string } >( entries: T[] ): T[] {
	const merged: T[] = [];
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

/**
 * Collapse a list of provider exports into one: zero entries means the export
 * is absent, a single entry passes through untouched, and multiple entries are
 * combined with the given merge policy.
 */
export function mergeMany< T >( items: T[], combine: ( items: T[] ) => T ): T | undefined {
	if ( items.length === 0 ) {
		return undefined;
	}
	return items.length === 1 ? items[ 0 ] : combine( items );
}

function mergeContextEntries(
	firstEntries?: ProviderClientContext[ 'contextEntries' ],
	secondEntries?: ProviderClientContext[ 'contextEntries' ]
): ProviderClientContext[ 'contextEntries' ] | undefined {
	const entries = [ ...( firstEntries || [] ), ...( secondEntries || [] ) ];
	return entries.length ? dedupeById( entries ) : undefined;
}

function isEmptyContextValue( value: unknown ): boolean {
	return value === undefined || value === null || value === '';
}

function isPlainRecord( value: unknown ): value is Record< string, unknown > {
	return !! value && typeof value === 'object' && ! Array.isArray( value );
}

/**
 * Shallow-merge two record values, with the first value's keys taking
 * precedence. Returns undefined when either side is not a plain record,
 * signalling the caller to fall back to the default merge rule.
 */
function shallowMergeFirstWins(
	firstValue: unknown,
	secondValue: unknown
): Record< string, unknown > | undefined {
	if ( ! isPlainRecord( firstValue ) || ! isPlainRecord( secondValue ) ) {
		return undefined;
	}
	return { ...secondValue, ...firstValue };
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
		if ( SHALLOW_MERGED_CONTEXT_KEYS.has( key ) ) {
			const shallowMerged = shallowMergeFirstWins( existing, value );
			if ( shallowMerged ) {
				merged[ key ] = shallowMerged;
				continue;
			}
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
	return mergeMany( contextProviders, ( providers ) => ( {
		getClientContext: () =>
			providers
				.map( ( contextProvider ) => contextProvider.getClientContext() )
				.reduce( mergeClientContexts ),
	} ) );
}

/**
 * Apply a guest's contribution to the merged client context: claimed keys
 * override the host outright, `contextEntries` are id-deduped additions, and
 * everything else the guest returns is ignored. Hosts own the rest of the
 * context; a guest that needs a key considered must claim it.
 */
export function applyGuestClaimedContext(
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

function findCheckpointOwner(
	checkpoints: UseCheckpointReturn[],
	checkpointId: string
): UseCheckpointReturn | undefined {
	return checkpoints.find( ( checkpoint ) => checkpoint.hasCheckpoint( checkpointId ) );
}

export function mergeCheckpointApis(
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

export function addProviderCallbackToAbility(
	ability: unknown,
	entry: AbilityProviderEntry
): unknown {
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
	return mergeMany(
		hooks,
		( allHooks ): UseSuggestionsHook =>
			( maxSuggestions, options ) => {
				const suggestions = allHooks.flatMap(
					( hook ) => hook( maxSuggestions, options )?.suggestions ?? []
				);
				return { suggestions: dedupeById( suggestions ) };
			}
	);
}
