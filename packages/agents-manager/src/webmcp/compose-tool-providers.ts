import type { ToolProvider } from '../extension-types';
import type { Ability } from '@wordpress/abilities';

type ProvidedAbility = {
	ability: Ability;
	provider: ToolProvider;
};

export type WebMcpToolProvider = {
	/** Keyed by original ability name, before exposure and collision filtering. */
	getSnapshot: () => Promise< ReadonlyMap< string, ProvidedAbility > >;
};

/**
 * Merges the sources first-wins by ability name: the first source to list an
 * ability defines it and executes it. Each snapshot includes every winning
 * definition and its owner so validation and dispatch cannot select different sources.
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

	return { getSnapshot: collect };
}
