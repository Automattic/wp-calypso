import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { isWebMcpServerAbilityName } from './contracts';
import type { ToolProvider } from '../extension-types';
import type { Ability } from '@wordpress/abilities';

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

export function createWebMcpToolProvider( toolProvider: ToolProvider ): ToolProvider {
	let serverAbilitiesPromise: Promise< Ability[] > | undefined;
	let didWarnAboutServerAbilities = false;

	const getServerAbilities = (): Promise< Ability[] > => {
		if ( ! serverAbilitiesPromise ) {
			serverAbilitiesPromise = apiFetch< Ability[] >( {
				path: addQueryArgs( '/wp-abilities/v1/abilities', {
					context: 'edit',
					per_page: -1,
					webmcp: 1,
				} ),
			} )
				.then( ( abilities ) =>
					abilities
						.filter( ( ability ) => isWebMcpServerAbilityName( ability.name ) )
						.map( markServerRegistered )
				)
				.catch( ( error ) => {
					serverAbilitiesPromise = undefined;
					throw error;
				} );
		}

		return serverAbilitiesPromise;
	};

	return {
		getAbilities: async () => {
			const abilities = await toolProvider.getAbilities();
			let serverAbilities: Ability[] = [];

			try {
				serverAbilities = await getServerAbilities();
				didWarnAboutServerAbilities = false;
			} catch ( error ) {
				if ( ! didWarnAboutServerAbilities ) {
					// eslint-disable-next-line no-console
					console.warn( '[AgentsManager] Failed to load WebMCP server abilities:', error );
					didWarnAboutServerAbilities = true;
				}
			}

			const serverNames = new Set( serverAbilities.map( ( ability ) => ability.name ) );

			return [
				...abilities.filter( ( ability ) => ! serverNames.has( ability.name ) ),
				...serverAbilities,
			];
		},
		executeAbility: async ( name, input ) => {
			if ( ! isWebMcpServerAbilityName( name ) ) {
				return toolProvider.executeAbility( name, input );
			}

			const ability = ( await getServerAbilities() ).find( ( item ) => item.name === name );
			if ( ! ability ) {
				throw new Error( `WebMCP server ability is unavailable: ${ name }` );
			}

			if ( ability.meta?.annotations?.readonly !== true ) {
				throw new Error( `WebMCP runs only read-only server abilities: ${ name }` );
			}

			return apiFetch( {
				method: 'GET',
				path: addQueryArgs( `/wp-abilities/v1/abilities/${ name }/run`, {
					input,
					webmcp: 1,
				} ),
			} );
		},
	};
}
