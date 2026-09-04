import {
	APPLY_BLOCK_EDITS_ABILITY_NAME,
	GET_BLOCK_TREE_ABILITY_NAME,
	SHOW_TEMPLATE_ABILITY_NAME,
	WEBMCP_SERVER_ABILITY_NAMES,
	isWebMcpMutatingServerAbilityName,
} from './contracts';
import type { Ability } from '../abilities/types';

/**
 * Transitional allowlists for abilities that carry no exposure flag yet.
 * Execution remains behind the merged provider's permission checks and canvas
 * guard.
 */
export const WEBMCP_EDITOR_ABILITY_ALLOWLIST = new Set( [
	APPLY_BLOCK_EDITS_ABILITY_NAME,
	GET_BLOCK_TREE_ABILITY_NAME,
	SHOW_TEMPLATE_ABILITY_NAME,
] );

export const WEBMCP_SERVER_ABILITY_ALLOWLIST = new Set< string >( WEBMCP_SERVER_ABILITY_NAMES );

export type WebMcpExposure = 'public' | 'private' | 'unset';

export type AbilityProvenance = 'client' | 'server';

function isRecord( value: unknown ): value is Record< string, unknown > {
	return !! value && typeof value === 'object' && ! Array.isArray( value );
}

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
			WEBMCP_SERVER_ABILITY_ALLOWLIST.has( ability.name ) &&
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
