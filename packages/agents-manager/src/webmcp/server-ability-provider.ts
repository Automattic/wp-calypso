import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { findAbilityByName } from '../abilities/ability-name';
import { shouldExposeWebMcpAbility } from './exposure';
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

/**
 * Serves the site's REST abilities that pass the exposure policy, so a
 * `meta.public` read or a `meta.webmcp.public` write surfaces without a
 * client-side allowlist entry. Execution stays on the REST route: GET for
 * read-only abilities, POST with a JSON body for mutating ones. The list is
 * fetched once per page, and a failed request is retried on the next read.
 */
export function createServerAbilityProvider(): ToolProvider {
	let abilitiesPromise: Promise< Ability[] > | undefined;
	let didWarn = false;

	const fetchAbilities = (): Promise< Ability[] > => {
		if ( ! abilitiesPromise ) {
			abilitiesPromise = apiFetch< Ability[] >( {
				path: addQueryArgs( ABILITIES_ENDPOINT, { context: 'edit', per_page: -1, webmcp: 1 } ),
			} )
				.then( ( abilities ) =>
					abilities.map( markServerRegistered ).filter( shouldExposeWebMcpAbility )
				)
				.catch( ( error ) => {
					abilitiesPromise = undefined;
					throw error;
				} );
		}

		return abilitiesPromise;
	};

	const getAbilities = async (): Promise< Ability[] > => {
		try {
			const abilities = await fetchAbilities();
			didWarn = false;
			return abilities;
		} catch ( error ) {
			if ( ! didWarn ) {
				// eslint-disable-next-line no-console
				console.warn( '[AgentsManager] Failed to load WebMCP server abilities:', error );
				didWarn = true;
			}
			return [];
		}
	};

	return {
		getAbilities,
		executeAbility: async ( name, input ) => {
			const ability = findAbilityByName( await getAbilities(), name );
			if ( ! ability ) {
				throw new Error( `WebMCP server ability is unavailable: ${ name }` );
			}

			const path = `${ ABILITIES_ENDPOINT }/${ ability.name }/run`;
			if ( ability.meta?.annotations?.readonly !== true ) {
				return apiFetch( {
					method: 'POST',
					path: addQueryArgs( path, { webmcp: 1 } ),
					data: { input },
				} );
			}

			return apiFetch( { method: 'GET', path: addQueryArgs( path, { input, webmcp: 1 } ) } );
		},
	};
}
