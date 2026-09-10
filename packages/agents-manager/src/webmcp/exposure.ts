import { normalizeAbilityName } from '../abilities/ability-name';
import { isRecord } from '../utils/is-record';
import {
	APPLY_BLOCK_EDITS_ABILITY_NAME,
	GET_BLOCK_TREE_ABILITY_NAME,
	SHOW_TEMPLATE_ABILITY_NAME,
	isWebMcpMutatingServerAbilityName,
	isWebMcpServerAbilityName,
} from './ability-names';
import type { Ability } from '../abilities/types';

/**
 * Transitional allowlist for client abilities that carry no exposure flag yet.
 * Execution remains behind the merged provider's permission checks and canvas
 * guard.
 */
export const WEBMCP_EDITOR_ABILITY_ALLOWLIST = new Set( [
	APPLY_BLOCK_EDITS_ABILITY_NAME,
	GET_BLOCK_TREE_ABILITY_NAME,
	SHOW_TEMPLATE_ABILITY_NAME,
] );

export type WebMcpExposure = 'public' | 'private' | 'unset';

export type AbilityProvenance = 'client' | 'server';

/**
 * Reads the channel-specific `meta.webmcp.public` flag, mirroring how the MCP
 * adapter reads `meta.mcp.public`: an explicit boolean wins in both directions,
 * and a malformed `meta.webmcp` value fails closed.
 */
export function getWebMcpChannelExposure( ability: Ability ): WebMcpExposure {
	const channel: unknown = ability.meta?.webmcp;

	if ( channel === undefined || channel === null ) {
		return 'unset';
	}

	if ( ! isRecord( channel ) ) {
		return 'private';
	}

	if ( channel.public === true ) {
		return 'public';
	}

	if ( channel.public === false ) {
		return 'private';
	}

	return 'unset';
}

/**
 * Reads the channel-specific `meta.webmcp.consequential` hint. Only an explicit
 * `true` counts; anything else, including malformed meta, leaves it unset.
 */
export function isWebMcpConsequential( ability: Ability ): boolean {
	const channel: unknown = ability.meta?.webmcp;

	return isRecord( channel ) && channel.consequential === true;
}

/**
 * Server provenance wins over a client marker, so a REST-backed ability that
 * also carries a client annotation keeps its server execution path.
 */
export function getAbilityProvenance( ability: Ability ): AbilityProvenance | undefined {
	const annotations = ability.meta?.annotations;

	if ( annotations?.serverRegistered === true ) {
		return 'server';
	}

	if ( annotations?.clientRegistered === true || typeof ability.callback === 'function' ) {
		return 'client';
	}

	return undefined;
}

function isReadonly( ability: Ability ): boolean {
	return ability.meta?.annotations?.readonly === true;
}

function isAllowlisted( ability: Ability, provenance: AbilityProvenance ): boolean {
	if ( provenance === 'server' ) {
		return (
			isWebMcpServerAbilityName( ability.name ) &&
			( isReadonly( ability ) || isWebMcpMutatingServerAbilityName( ability.name ) )
		);
	}

	return WEBMCP_EDITOR_ABILITY_ALLOWLIST.has( ability.name );
}

/**
 * Exposure policy, most specific first:
 *
 * 1. `meta.webmcp.public` opts in or out explicitly, for reads and writes alike.
 * 2. `meta.public` (WordPress 7.1) opts in read-only abilities only. Writes need
 *    the channel flag. It is never an opt-out: WordPress stores `public: false`
 *    on every ability that did not set it.
 * 3. Otherwise the transitional allowlists decide.
 *
 * Every path also requires a known provenance.
 */
export function shouldExposeWebMcpAbility( ability: Ability ): boolean {
	const channel = getWebMcpChannelExposure( ability );
	if ( channel === 'private' ) {
		return false;
	}

	const provenance = getAbilityProvenance( ability );
	if ( ! provenance ) {
		return false;
	}

	if ( channel === 'public' ) {
		return true;
	}

	if ( ability.meta?.public === true && isReadonly( ability ) ) {
		return true;
	}

	return isAllowlisted( ability, provenance );
}

export type ExposedAbilities = {
	/** Keyed by ability name, in candidate order. */
	exposed: Map< string, Ability >;
	/** Keyed by the tool name that several exposable abilities would share. */
	collisions: Map< string, Ability[] >;
};

/**
 * Applies the exposure policy and resolves tool-name collisions. The `/` to
 * `__` and `-` to `_` mapping is not injective: a doubled dash and a segment
 * boundary both land on `__`. Two abilities on one tool name would silently
 * overwrite each other, so neither is exposed.
 */
export function selectExposedAbilities( abilities: Ability[] ): ExposedAbilities {
	const candidatesByToolName = new Map< string, Ability[] >();
	for ( const ability of abilities ) {
		if ( ! shouldExposeWebMcpAbility( ability ) ) {
			continue;
		}

		const toolName = normalizeAbilityName( ability.name );
		candidatesByToolName.set( toolName, [
			...( candidatesByToolName.get( toolName ) ?? [] ),
			ability,
		] );
	}

	const exposed = new Map< string, Ability >();
	const collisions = new Map< string, Ability[] >();
	for ( const [ toolName, candidates ] of candidatesByToolName ) {
		if ( candidates.length === 1 ) {
			exposed.set( candidates[ 0 ].name, candidates[ 0 ] );
		} else {
			collisions.set( toolName, candidates );
		}
	}

	return { exposed, collisions };
}
