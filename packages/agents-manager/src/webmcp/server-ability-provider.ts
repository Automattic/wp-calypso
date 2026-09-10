import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { findAbilityByName } from '../abilities/ability-name';
import type { Ability } from '../abilities/types';
import type { ToolProvider } from '../extension-types';

const ABILITIES_ENDPOINT = '/wp-abilities/v1/abilities';

function markServerRegistered( ability: Ability ): Ability {
	return {
		...ability,
		meta: {
			...ability.meta,
			annotations: {
				...ability.meta?.annotations,
				serverRegistered: true,
			},
		},
	};
}

function getAbilityRequestMethod( ability: Ability ): 'GET' | 'POST' | 'DELETE' {
	const annotations = ability.meta?.annotations;
	if ( annotations?.readonly === true ) {
		return 'GET';
	}
	return annotations?.destructive === true && annotations?.idempotent === true ? 'DELETE' : 'POST';
}

/**
 * Fetches REST definitions once per mount, preserving opt-outs for precedence
 * resolution. Failed discovery is left uncached so the mount can retry it.
 */
export function createServerAbilityProvider(): ToolProvider {
	let abilitiesPromise: Promise< Ability[] > | undefined;

	const getAbilities = (): Promise< Ability[] > => {
		if ( ! abilitiesPromise ) {
			abilitiesPromise = apiFetch< Ability[] >( {
				path: addQueryArgs( ABILITIES_ENDPOINT, { context: 'edit', per_page: -1, webmcp: 1 } ),
			} )
				.then( ( abilities ) => abilities.map( markServerRegistered ) )
				.catch( ( error ) => {
					abilitiesPromise = undefined;
					throw error;
				} );
		}

		return abilitiesPromise;
	};

	return {
		getAbilities,
		executeAbility: async ( name, input ) => {
			const ability = findAbilityByName( await getAbilities(), name );
			if ( ! ability ) {
				throw new Error( `WebMCP server ability is unavailable: ${ name }` );
			}

			const path = `${ ABILITIES_ENDPOINT }/${ ability.name }/run`;
			const method = getAbilityRequestMethod( ability );
			if ( method === 'POST' ) {
				return apiFetch( {
					method: 'POST',
					path: addQueryArgs( path, { webmcp: 1 } ),
					data: { input },
				} );
			}

			return apiFetch( { method, path: addQueryArgs( path, { input, webmcp: 1 } ) } );
		},
	};
}
