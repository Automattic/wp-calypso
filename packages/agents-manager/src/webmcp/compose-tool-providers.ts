import { findAbilityByName } from '../abilities/ability-name';
import type { Ability } from '../abilities/types';
import type { ToolProvider } from '../extension-types';

/**
 * Wraps a provider that may not exist yet. The merged provider chain loads
 * after the first render, so it is read live instead of captured once.
 */
export function deferToolProvider( getToolProvider: () => ToolProvider | undefined ): ToolProvider {
	return {
		getAbilities: async () => ( await getToolProvider()?.getAbilities() ) ?? [],
		executeAbility: async ( name, input ) => {
			const toolProvider = getToolProvider();
			if ( ! toolProvider ) {
				throw new Error( `No tool provider is loaded to run the ability: ${ name }` );
			}

			return toolProvider.executeAbility( name, input );
		},
	};
}

/**
 * The first provider to list an ability owns it, for its definition and its
 * execution alike, matching the precedence rule of the merged provider chain.
 */
export function mergeToolProviders( providers: ToolProvider[] ): ToolProvider {
	return {
		getAbilities: async () => {
			const merged = new Map< string, Ability >();
			const results = await Promise.all( providers.map( ( provider ) => provider.getAbilities() ) );

			for ( const abilities of results ) {
				for ( const ability of abilities ) {
					if ( ! merged.has( ability.name ) ) {
						merged.set( ability.name, ability );
					}
				}
			}

			return [ ...merged.values() ];
		},
		executeAbility: async ( name, input ) => {
			for ( const provider of providers ) {
				if ( findAbilityByName( await provider.getAbilities(), name ) ) {
					return provider.executeAbility( name, input );
				}
			}

			throw new Error( `No tool provider handles the ability: ${ name }` );
		},
	};
}
