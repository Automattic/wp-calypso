import { findAbilityByName } from '../abilities/ability-name';
import type { Ability } from '../abilities/types';
import type { ToolProvider } from '../extension-types';

type ProvidedAbility = {
	ability: Ability;
	provider: ToolProvider;
};

export type WebMcpToolProvider = {
	getAbilities: ToolProvider[ 'getAbilities' ];
	resolveAbility: ( name: string ) => Promise< ProvidedAbility | undefined >;
};

/**
 * Merges the sources first-wins by ability name: the first source to list an
 * ability defines it and executes it. Resolution returns the definition and
 * owner together so validation and dispatch cannot select different sources.
 * Each call resolves live; failed sources are reported and skipped.
 */
export function mergeToolProviders(
	getProviders: () => ToolProvider[],
	onError: ( error: unknown ) => void
): WebMcpToolProvider {
	const collect = async (): Promise< Map< string, ProvidedAbility > > => {
		const providers = getProviders();
		const results = await Promise.all(
			providers.map( async ( provider ) => {
				try {
					return await provider.getAbilities();
				} catch ( error ) {
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
	};

	return {
		getAbilities: async () => [ ...( await collect() ).values() ].map( ( { ability } ) => ability ),
		resolveAbility: async ( name ) => {
			const merged = await collect();
			const ability = findAbilityByName(
				[ ...merged.values() ].map( ( entry ) => entry.ability ),
				name
			);
			return ability ? merged.get( ability.name ) : undefined;
		},
	};
}
