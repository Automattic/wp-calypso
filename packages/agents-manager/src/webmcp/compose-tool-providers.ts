import { findAbilityByName } from '../abilities/ability-name';
import type { Ability } from '../abilities/types';
import type { ToolProvider } from '../extension-types';

type ProvidedAbility = {
	ability: Ability;
	provider: ToolProvider;
};

/**
 * Merges the sources first-wins by ability name: the first source to list an
 * ability defines it and executes it, mirroring the rule of the chat provider
 * chain. The owner is resolved live on every call, so a source that arrives
 * later or changes its list takes effect without re-registration. A source
 * that fails to load is reported and skipped, so the others keep serving.
 */
export function mergeToolProviders(
	getProviders: () => ToolProvider[],
	onError: ( error: unknown ) => void
): ToolProvider {
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
		executeAbility: async ( name, input ) => {
			const merged = await collect();
			const ability = findAbilityByName(
				[ ...merged.values() ].map( ( entry ) => entry.ability ),
				name
			);
			const owner = ability && merged.get( ability.name )?.provider;
			if ( ! owner ) {
				throw new Error( `No tool provider handles the ability: ${ name }` );
			}

			return owner.executeAbility( name, input );
		},
	};
}
