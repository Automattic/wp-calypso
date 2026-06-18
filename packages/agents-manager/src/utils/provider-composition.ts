// global.d.ts declares ambient globals (e.g. agentsManagerData) that are injected server-side.
// Ambient declaration files cannot be `import`ed; a triple-slash reference is required to ensure
// the global is visible when TypeScript resolves this file via the import graph rather than the
// tsconfig include list (e.g. during sandbox / CI builds).
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../global.d.ts" />

import { ORCHESTRATOR_AGENT_ID } from '../constants';

/**
 * Provider composition policy.
 *
 * Hosts serve unclaimed work. Guests contribute only their claimed ability
 * namespaces, chat-component types, and client-context keys.
 */

export interface ProviderCompositionClaims {
	/** Ability name namespaces, e.g. `jetpack_ai` claims `jetpack_ai__show_component`. */
	abilities?: string[];
	/** Exact chat-component types, e.g. `title-picker`. */
	components?: string[];
	/** Exact client-context keys, e.g. `titleSuggestionCount`. */
	context?: string[];
}

export interface ProviderCompositionManifest {
	providerId: string;
	role: 'host' | 'guest';
	/** Guests only activate for these agents. Omitted means every agent. */
	supportedAgentIds?: string[];
	claims?: ProviderCompositionClaims;
}

/** A manifest after parsing, with `claims` always present. */
export type ResolvedProviderManifest = Omit< ProviderCompositionManifest, 'claims' > & {
	claims: Required< ProviderCompositionClaims >;
};

export type ComposedProviderEntry< Module > = {
	module: Module;
	providerIndex: number;
	manifest: ResolvedProviderManifest;
};

export interface ProviderCompositionPolicy< Module = unknown > {
	/** Providers that survived resolution, in registration order. */
	providers: Array< ComposedProviderEntry< Module > >;
	/** Guests with validated, non-overlapping claims. */
	guests: Array< ComposedProviderEntry< Module > >;
	/** Human-readable reasons for anything dropped or coerced. */
	notices: string[];
}

type ProviderCompositionModule = {
	compositionManifest?: unknown;
};

export function normalizeAbilityName( name: string ): string {
	return name.replace( /\//g, '__' ).replace( /-/g, '_' );
}

/** Whether an ability name belongs to a claimed namespace. */
export function abilityMatchesClaim( claimedNamespace: string, abilityName: string ): boolean {
	const namespace = normalizeAbilityName( claimedNamespace );
	const name = normalizeAbilityName( abilityName );
	if ( name === namespace ) {
		return true;
	}
	if ( name.includes( '__' ) ) {
		return name.startsWith( `${ namespace }__` );
	}
	return name.startsWith( `${ namespace }_` );
}

/** The guest whose ability claims cover the given name, if any. */
export function findAbilityClaimant< Module >(
	guests: Array< ComposedProviderEntry< Module > >,
	abilityName: string
): ComposedProviderEntry< Module > | undefined {
	let bestGuest: ComposedProviderEntry< Module > | undefined;
	let bestNamespaceLength = -1;
	for ( const guest of guests ) {
		for ( const namespace of guest.manifest.claims.abilities ) {
			const normalizedLength = normalizeAbilityName( namespace ).length;
			if (
				normalizedLength > bestNamespaceLength &&
				abilityMatchesClaim( namespace, abilityName )
			) {
				bestGuest = guest;
				bestNamespaceLength = normalizedLength;
			}
		}
	}
	return bestGuest;
}

function stringArrayOrEmpty( value: unknown ): string[] {
	return Array.isArray( value )
		? [ ...new Set( value.filter( ( item ): item is string => typeof item === 'string' ) ) ]
		: [];
}

function parseCompositionManifest( manifest: unknown ): ResolvedProviderManifest | undefined {
	if ( ! manifest || typeof manifest !== 'object' || Array.isArray( manifest ) ) {
		return undefined;
	}

	const candidate = manifest as Record< string, unknown >;
	if ( typeof candidate.providerId !== 'string' || ! candidate.providerId ) {
		return undefined;
	}
	if ( candidate.role !== 'host' && candidate.role !== 'guest' ) {
		return undefined;
	}

	const claimCandidate =
		candidate.claims && typeof candidate.claims === 'object' && ! Array.isArray( candidate.claims )
			? ( candidate.claims as Record< string, unknown > )
			: {};

	return {
		providerId: candidate.providerId,
		role: candidate.role === 'host' ? 'host' : 'guest',
		supportedAgentIds: Array.isArray( candidate.supportedAgentIds )
			? stringArrayOrEmpty( candidate.supportedAgentIds )
			: undefined,
		claims: {
			abilities: stringArrayOrEmpty( claimCandidate.abilities ),
			components: stringArrayOrEmpty( claimCandidate.components ),
			context: stringArrayOrEmpty( claimCandidate.context ),
		},
	};
}

function synthesizeHostManifest( providerIndex: number ): ResolvedProviderManifest {
	return {
		providerId: `provider-${ providerIndex }`,
		role: 'host',
		claims: { abilities: [], components: [], context: [] },
	};
}

function namespacesOverlap( firstNamespace: string, secondNamespace: string ): boolean {
	const first = normalizeAbilityName( firstNamespace );
	const second = normalizeAbilityName( secondNamespace );
	return (
		first === second || first.startsWith( `${ second }__` ) || second.startsWith( `${ first }__` )
	);
}

function findClaimConflict(
	first: ResolvedProviderManifest,
	second: ResolvedProviderManifest
): string | undefined {
	for ( const a of first.claims.abilities ) {
		for ( const b of second.claims.abilities ) {
			if ( namespacesOverlap( a, b ) ) {
				return `ability namespace "${ b }"`;
			}
		}
	}
	const component = second.claims.components.find( ( type ) =>
		first.claims.components.includes( type )
	);
	if ( component ) {
		return `component type "${ component }"`;
	}
	const contextKey = second.claims.context.find( ( key ) => first.claims.context.includes( key ) );
	if ( contextKey ) {
		return `context key "${ contextKey }"`;
	}
	return undefined;
}

/** Synchronous agent-id overrides shared with `useAgentConfig`. */
export function getAgentIdOverride(): string | undefined {
	const agentIdParam =
		typeof window !== 'undefined'
			? new URLSearchParams( window.location.search ).get( 'agent' )
			: null;
	if ( agentIdParam ) {
		return agentIdParam;
	}
	if ( typeof agentsManagerData === 'undefined' ) {
		return undefined;
	}
	return typeof agentsManagerData?.agentId === 'string' ? agentsManagerData.agentId : undefined;
}

/** The agent id guest gating should compare against. */
export function resolveEffectiveAgentId( knownAgentId?: string ): string {
	return knownAgentId || getAgentIdOverride() || ORCHESTRATOR_AGENT_ID;
}

/** Raw, normalized, and flattened spellings for an ability name. */
export function abilityNameAliases( name: string ): string[] {
	return [ ...new Set( [ name, normalizeAbilityName( name ), name.replace( /\//g, '-' ) ] ) ];
}

/** Resolve the composition policy from provider declarations alone. */
export function resolveProviderComposition< Module extends ProviderCompositionModule >(
	loadedModules: Array< Module | null >,
	agentId: string | undefined
): ProviderCompositionPolicy< Module > {
	const notices: string[] = [];
	const entries: Array< ComposedProviderEntry< Module > > = [];

	loadedModules.forEach( ( module, providerIndex ) => {
		if ( ! module ) {
			return;
		}
		const explicit = parseCompositionManifest( module.compositionManifest );
		if ( ! explicit && module.compositionManifest !== undefined ) {
			notices.push(
				`[AgentsManager] Provider ${ providerIndex } exported a malformed compositionManifest; treating it as a host.`
			);
		}
		entries.push( {
			module,
			providerIndex,
			manifest: explicit ?? synthesizeHostManifest( providerIndex ),
		} );
	} );

	// Guests only activate for agents they support.
	const active = entries.filter( ( entry ) => {
		const manifest = entry.manifest;
		if ( manifest.role !== 'guest' || ! manifest.supportedAgentIds ) {
			return true;
		}
		const supported = !! agentId && manifest.supportedAgentIds.includes( agentId );
		if ( ! supported ) {
			notices.push(
				`[AgentsManager] Guest provider "${ manifest.providerId }" does not support agent "${
					agentId ?? 'unknown'
				}"; provider skipped.`
			);
		}
		return supported;
	} );

	// Drop later guests with overlapping claims so ownership stays unambiguous.
	const guests: Array< ComposedProviderEntry< Module > > = [];
	const droppedIndexes = new Set< number >();
	for ( const entry of active ) {
		if ( entry.manifest.role !== 'guest' ) {
			continue;
		}
		let conflictNotice: string | undefined;
		for ( const accepted of guests ) {
			const conflict = findClaimConflict( accepted.manifest, entry.manifest );
			if ( conflict ) {
				conflictNotice = `[AgentsManager] Guest provider "${ entry.manifest.providerId }" claims ${ conflict } already claimed by "${ accepted.manifest.providerId }"; provider skipped.`;
				break;
			}
		}
		if ( conflictNotice ) {
			notices.push( conflictNotice );
			droppedIndexes.add( entry.providerIndex );
		} else {
			guests.push( entry );
		}
	}

	let providers = active.filter( ( entry ) => ! droppedIndexes.has( entry.providerIndex ) );

	// With no host, treat guests as a host pool so guest-only surfaces still work.
	if ( guests.length > 0 && ! providers.some( ( entry ) => entry.manifest.role === 'host' ) ) {
		if ( providers.length > 1 ) {
			notices.push(
				`[AgentsManager] No host provider present; treating ${ providers.length } guest providers as hosts with the legacy merge.`
			);
		}
		providers = providers.map( ( entry ) => ( {
			...entry,
			manifest: { ...entry.manifest, role: 'host' as const },
		} ) );
		return { providers, guests: [], notices };
	}

	return { providers, guests, notices };
}
