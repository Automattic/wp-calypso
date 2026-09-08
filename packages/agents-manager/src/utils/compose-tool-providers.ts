import { findAbilityByName } from '../abilities/ability-name';
import type { Ability } from '../abilities/types';
import type { ToolProvider } from '../extension-types';

type ProvidedAbility = {
	ability: Ability;
	provider: ToolProvider;
};

/**
 * Resolves definitions and their owners together, first provider wins. Callers
 * can report failed sources while keeping abilities from the remaining ones.
 */
export async function collectToolProviderAbilities(
	providers: ToolProvider[],
	onError?: ( error: unknown ) => void
): Promise< Map< string, ProvidedAbility > > {
	const results = await Promise.all(
		providers.map( async ( provider ) => {
			try {
				return await provider.getAbilities();
			} catch ( error ) {
				if ( ! onError ) {
					throw error;
				}
				onError( error );
				return [];
			}
		} )
	);
	const merged = new Map< string, ProvidedAbility >();
	results.forEach( ( abilities, index ) => {
		for ( const ability of abilities ) {
			if ( ! merged.has( ability.name ) ) {
				merged.set( ability.name, { ability, provider: providers[ index ] } );
			}
		}
	} );
	return merged;
}

/**
 * Chat resolves providers live on every turn, including abilities registered
 * after the providers loaded. WebMCP instead retains the collected owner for
 * each browser registration.
 */
export function mergeToolProviders(
	providers: ToolProvider[],
	onError?: ( error: unknown ) => void
): ToolProvider {
	return {
		getAbilities: async () =>
			[ ...( await collectToolProviderAbilities( providers, onError ) ).values() ].map(
				( { ability } ) => ability
			),
		executeAbility: async ( name, input ) => {
			const abilities = await collectToolProviderAbilities( providers, onError );
			for ( const { ability, provider } of abilities.values() ) {
				if ( findAbilityByName( [ ability ], name ) ) {
					return provider.executeAbility( name, input );
				}
			}
			throw new Error( `No provider handled ability: ${ name }` );
		},
	};
}
