import { executeAbility, getAbilities, store as abilitiesStore } from '@wordpress/abilities';
import { subscribe } from '@wordpress/data';
import type { ToolProvider } from '../extension-types';

/**
 * Adds the `@wordpress/abilities` registry as a source, so a plugin that isn't a provider can
 * still expose a flagged ability. The provider wins a name clash: its path runs the canvas guard.
 */
export function withRegistryAbilities( toolProvider: ToolProvider ): ToolProvider {
	return {
		getAbilities: async () => {
			const abilities = await toolProvider.getAbilities();
			const providerNames = new Set( abilities.map( ( ability ) => ability.name ) );

			return [
				...abilities,
				...getAbilities().filter( ( ability ) => ! providerNames.has( ability.name ) ),
			];
		},
		executeAbility: async ( name, input ) => {
			const abilities = await toolProvider.getAbilities();

			if ( abilities.some( ( ability ) => ability.name === name ) ) {
				return toolProvider.executeAbility( name, input );
			}

			return executeAbility( name, input );
		},
	};
}

export function subscribeToRegistryAbilities( listener: () => void ): () => void {
	return subscribe( listener, abilitiesStore );
}
