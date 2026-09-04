import { executeAbility, getAbilities } from '@wordpress/abilities';
import { findAbilityByName } from '../abilities/ability-name';
import { withCanvasGuard } from '../utils/canvas-guard';
import type { Ability } from '../abilities/types';
import type { ToolProvider } from '../extension-types';

/**
 * Serves the `core/abilities` registry behind the merged provider chain.
 *
 * Chain definitions come first and win by name: an ability the chain executes
 * keeps the schema its executor expects, and the chain's own guards stay in
 * front of it. Everything else the page registered executes through the
 * registry, which runs the ability's permission callback and schema
 * validation, under the same canvas guard the chain applies.
 */
export function createRegistryToolProvider(
	getToolProvider: () => ToolProvider | undefined
): ToolProvider {
	const registry = withCanvasGuard( {
		getAbilities: async () => getAbilities(),
		executeAbility: ( name: string, input: unknown ) => {
			const ability = findAbilityByName( getAbilities(), name );
			return executeAbility( ability?.name ?? name, input );
		},
	} );

	const getChainAbilities = async (): Promise< Ability[] > =>
		( await getToolProvider()?.getAbilities() ) ?? [];

	return {
		getAbilities: async () => {
			const chainAbilities = await getChainAbilities();
			const claimed = new Set( chainAbilities.map( ( ability ) => ability.name ) );
			const registryAbilities = await registry.getAbilities();

			return [
				...chainAbilities,
				...registryAbilities.filter( ( ability ) => ! claimed.has( ability.name ) ),
			];
		},
		executeAbility: async ( name, input ) => {
			const chain = getToolProvider();
			if ( chain && findAbilityByName( await chain.getAbilities(), name ) ) {
				return chain.executeAbility( name, input );
			}

			return registry.executeAbility( name, input );
		},
	};
}
