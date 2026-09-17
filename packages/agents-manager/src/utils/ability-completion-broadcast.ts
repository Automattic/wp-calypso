/**
 * Announces every ability's completion on the merged provider.
 *
 * Installed on both dispatch paths, for the reason `canvas-guard` gives:
 * agenttic-client calls an ability's own `callback` when it has one and only
 * falls back to the provider's `executeAbility` when it does not, so a wrapper
 * on one path alone is inert for every ability that takes the other.
 *
 * Every ability, deliberately, rather than a curated list of the ones that
 * write. A listener that needs to know whether anything changed can ask the
 * editor once the event arrives; a list here would have to be kept in step with
 * abilities in two codebases as they migrate, and a missed entry would fail
 * silently.
 */
import { broadcastAbilityCompleted } from './agent-activity-events';
import type { Ability } from '../abilities/types';
import type { ToolProvider } from '../types';

/**
 * Whether an ability answered that it did not do what it was asked.
 *
 * Reads both the `AbilityResult` envelope and the bare form, as `canvas-guard`
 * does, since the provider contract types both paths as `Promise< any >`.
 * @param result Whatever the ability answered.
 * @returns Whether it reported failure.
 */
function reportsFailure( result: unknown ): boolean {
	const answer = result as { success?: unknown; result?: { success?: unknown } } | undefined;

	return false === ( answer?.result?.success ?? answer?.success );
}

/**
 * Run one ability and announce its completion, however it ends.
 * @param name     The ability name, in either form.
 * @param dispatch Runs the ability itself.
 * @returns Whatever the ability answered.
 */
async function dispatchAndBroadcast(
	name: string,
	dispatch: () => Promise< unknown >
): Promise< unknown > {
	let result: unknown;

	try {
		result = await dispatch();
	} catch ( error ) {
		// Announced, not swallowed: the caller still sees the failure.
		broadcastAbilityCompleted( { name, ok: false } );
		throw error;
	}

	broadcastAbilityCompleted( { name, ok: ! reportsFailure( result ) } );

	return result;
}

/**
 * Put the announcement on an ability's own callback.
 * @param ability The ability as its provider registered it.
 * @returns The ability, with an announcing callback when it has one.
 */
function announceAbilityCallback( ability: Ability ): Ability {
	const { callback } = ability;

	if ( ! callback ) {
		return ability;
	}

	return {
		...ability,
		callback: ( input ) => dispatchAndBroadcast( ability.name, async () => callback( input ) ),
	};
}

/**
 * Announce every ability's completion, whichever path dispatches it.
 * @param toolProvider The merged tool provider, if any.
 * @returns The wrapped provider, or undefined when there is nothing to wrap.
 */
export function withAbilityCompletionBroadcast(
	toolProvider: ToolProvider | undefined
): ToolProvider | undefined {
	if ( ! toolProvider ) {
		return undefined;
	}

	return {
		getAbilities: async () => ( await toolProvider.getAbilities() ).map( announceAbilityCallback ),
		executeAbility: ( name: string, args: unknown ) =>
			dispatchAndBroadcast( name, async () => toolProvider.executeAbility( name, args ) ),
	};
}
