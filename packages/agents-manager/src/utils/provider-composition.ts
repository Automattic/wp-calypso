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
 * Agents Manager can load several AI providers at once (Big Sky / Dolly,
 * Jetpack AI Sidebar, future peers). Every provider resolves to a manifest:
 * providers that export `compositionManifest` declare what they own; providers
 * that do not are given a synthesised host manifest, which keeps the legacy
 * merge behaviour without a second code path.
 *
 * Roles:
 * - `host` — serves everything no guest claims. Multiple hosts keep the
 *   legacy first-registered-wins merge among themselves, and host context is
 *   the base the merged client context starts from.
 * - `guest` — contributes ONLY what its claims cover: ability name
 *   namespaces, chat-component types, and client-context keys. Hosts cannot
 *   serve names a guest has claimed, and a guest's unclaimed exports through
 *   those three channels are ignored.
 *
 * The policy is resolved once, before any abilities are fetched, from
 * declarations alone — so ownership of claimed work never depends on
 * registration order, render timing, or which spelling of a tool name a
 * caller uses. Conflicts (two guests claiming the same name) are configuration
 * errors: the later-registered guest is dropped, loudly.
 *
 * Hosts may additionally export `resolveOutgoingArgs( toolName, args )` (see
 * load-external-providers.ts): it runs over the args of every call that
 * crosses to a guest, letting a host translate its own vocabulary — such as
 * shortened block ids — into what guests expect.
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

/**
 * A manifest after parsing: the authored shape with `claims` guaranteed
 * present (empty arrays when omitted), so consumers never null-check them.
 * Providers that export no manifest resolve to a synthesised host manifest.
 */
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

/** Serializable snapshot written to `agentsManagerData` for debugging. */
export interface ProviderCompositionDebugSummary {
	guests: Array< {
		providerIndex: number;
		providerId: string;
		claims: ResolvedProviderManifest[ 'claims' ];
	} >;
}

type ProviderCompositionModule = {
	compositionManifest?: unknown;
};

export function normalizeAbilityName( name: string ): string {
	return name.replace( /\//g, '__' ).replace( /-/g, '_' );
}

/**
 * Whether an ability name belongs to a claimed namespace.
 *
 * Matching happens on normalized names. `/` normalizes to `__`, so the
 * namespace boundary is a double underscore: claim `jetpack_ai` matches
 * `jetpack_ai__show_component` but not the sibling namespace
 * `jetpack-ai-extras/tool` (which normalizes to `jetpack_ai_extras__tool`).
 * Agenttic tool ids flatten `/` to `-` (e.g. `big-sky-show-component`),
 * leaving no double underscore; those spellings fall back to a
 * single-underscore boundary, which is ambiguous across sibling namespaces
 * sharing a prefix — `findAbilityClaimant` mitigates with longest-match.
 */
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

/**
 * The guest whose ability claims cover the given name, if any. When several
 * guests match a hyphen-flattened spelling, the longest claimed namespace
 * wins, so `jetpack_ai_extras` beats `jetpack_ai` for `jetpack-ai-extras-tool`.
 */
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

/** The guest that claims the given chat-component type, if any. */
export function findComponentClaimant< Module >(
	guests: Array< ComposedProviderEntry< Module > >,
	componentType: string
): ComposedProviderEntry< Module > | undefined {
	return guests.find( ( guest ) => guest.manifest.claims.components.includes( componentType ) );
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

/**
 * The first claim two guests disagree about, as a human-readable string, or
 * undefined when their claims are disjoint.
 */
/**
 * Whether two claimed namespaces overlap: equal after normalization, or one
 * is a `/`-boundary (double-underscore) prefix of the other. Sibling
 * namespaces that merely share a hyphenated prefix (`wpcom` vs
 * `wpcom-workflow`) do not overlap.
 */
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

export function getAgentIdFromInlineData(): string | undefined {
	if ( typeof agentsManagerData === 'undefined' ) {
		return undefined;
	}
	return typeof agentsManagerData?.agentId === 'string' ? agentsManagerData.agentId : undefined;
}

/**
 * The agent id guest gating should compare against. Callers that already know
 * the effective agent (resolved by `useAgentConfig`'s full priority chain,
 * including the unified-experience toggle) pass it in; otherwise this mirrors
 * the synchronous parts of that chain: `?agent=` URL param, then inline data,
 * then the orchestrator default — never undefined, so a guest is not dropped
 * just because no override was set.
 */
export function resolveEffectiveAgentId( knownAgentId?: string ): string {
	if ( knownAgentId ) {
		return knownAgentId;
	}
	const agentIdParam =
		typeof window !== 'undefined'
			? new URLSearchParams( window.location.search ).get( 'agent' )
			: null;
	return agentIdParam || getAgentIdFromInlineData() || ORCHESTRATOR_AGENT_ID;
}

/**
 * Expose the active composition for debugging. Cleared (set to undefined)
 * when no guest is active, so a stale summary from an earlier resolution
 * cannot outlive the providers it described.
 */
export function writeProviderCompositionDebugSummary< Module >(
	policy: ProviderCompositionPolicy< Module >
): void {
	if ( typeof agentsManagerData === 'undefined' || ! agentsManagerData ) {
		return;
	}
	agentsManagerData.providerCompositionPolicy = policy.guests.length
		? {
				guests: policy.guests.map( ( guest ) => ( {
					providerIndex: guest.providerIndex,
					providerId: guest.manifest.providerId,
					claims: guest.manifest.claims,
				} ) ),
		  }
		: undefined;
}

/**
 * Resolve the composition policy from provider declarations alone.
 *
 * Pure with respect to its inputs: no provider code runs, no abilities are
 * fetched, and the result does not change after load. Dropped providers and
 * coercions are reported in `notices` for the caller to log.
 */
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

	// Overlapping guest claims are a configuration error: the later-registered
	// guest is dropped so ownership of every claimed name stays unambiguous.
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

	// With no host left to serve unclaimed work, claims have nothing to compose
	// against. Treat the remaining guests as a host pool so guest-only surfaces
	// (e.g. the Jetpack-only editor) keep working with the legacy merge. A lone
	// guest is the routine shape of those surfaces, so only multi-provider
	// coercion is noted.
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
