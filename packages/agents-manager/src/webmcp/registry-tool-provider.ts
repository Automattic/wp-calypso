import { executeAbility, getAbilities } from '@wordpress/abilities';
import { findAbilityByName } from '../abilities/ability-name';
import { withCanvasGuard } from '../utils/canvas-guard';
import type { ToolProvider } from '../extension-types';

/**
 * Serves the `core/abilities` registry: everything the page registered,
 * whichever plugin did it. Execution runs through the registry, which applies
 * the ability's permission callback and schema validation, under the same
 * canvas guard as the merged provider chain.
 */
export function createRegistryToolProvider(): ToolProvider {
	return withCanvasGuard( {
		getAbilities: async () => getAbilities(),
		executeAbility: ( name: string, input: unknown ) =>
			executeAbility( findAbilityByName( getAbilities(), name )?.name ?? name, input ),
	} );
}
