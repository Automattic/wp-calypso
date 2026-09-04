import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { shouldExposeWebMcpAbility } from './exposure';
import type { Ability } from '../abilities/types';
import type { ToolProvider } from '../extension-types';

type CreateWebMcpToolProviderOptions = {
	shouldExposeAbility?: ( ability: Ability ) => boolean;
};

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
 * Bridges the site's REST abilities into the WebMCP provider chain.
 *
 * The response goes through the same exposure policy as client abilities, so
 * a `meta.public` read or a `meta.webmcp.public` write surfaces without a
 * client-side allowlist entry. A REST definition replaces any same-named copy
 * the chain advertises, and its execution stays on the REST route: GET for
 * read-only abilities, POST with a JSON body for mutating ones.
 */
export function createWebMcpToolProvider(
	toolProvider: ToolProvider,
	{ shouldExposeAbility = shouldExposeWebMcpAbility }: CreateWebMcpToolProviderOptions = {}
): ToolProvider {
	let serverAbilitiesPromise: Promise< Ability[] > | undefined;
	let didWarnAboutServerAbilities = false;

	const fetchServerAbilities = (): Promise< Ability[] > => {
		if ( ! serverAbilitiesPromise ) {
			serverAbilitiesPromise = apiFetch< Ability[] >( {
				path: addQueryArgs( '/wp-abilities/v1/abilities', {
					context: 'edit',
					per_page: -1,
					webmcp: 1,
				} ),
			} )
				.then( ( abilities ) =>
					abilities.map( markServerRegistered ).filter( shouldExposeAbility )
				)
				.catch( ( error ) => {
					serverAbilitiesPromise = undefined;
					throw error;
				} );
		}

		return serverAbilitiesPromise;
	};

	const getServerAbilities = async (): Promise< Ability[] > => {
		try {
			const abilities = await fetchServerAbilities();
			didWarnAboutServerAbilities = false;
			return abilities;
		} catch ( error ) {
			if ( ! didWarnAboutServerAbilities ) {
				// eslint-disable-next-line no-console
				console.warn( '[AgentsManager] Failed to load WebMCP server abilities:', error );
				didWarnAboutServerAbilities = true;
			}
			return [];
		}
	};

	return {
		getAbilities: async () => {
			const abilities = await toolProvider.getAbilities();
			const serverAbilities = await getServerAbilities();
			const serverNames = new Set( serverAbilities.map( ( ability ) => ability.name ) );

			return [
				...abilities.filter( ( ability ) => ! serverNames.has( ability.name ) ),
				...serverAbilities,
			];
		},
		executeAbility: async ( name, input ) => {
			const ability = ( await getServerAbilities() ).find( ( item ) => item.name === name );
			if ( ! ability ) {
				return toolProvider.executeAbility( name, input );
			}

			if ( ability.meta?.annotations?.readonly !== true ) {
				return apiFetch( {
					method: 'POST',
					path: addQueryArgs( `/wp-abilities/v1/abilities/${ name }/run`, {
						webmcp: 1,
					} ),
					data: { input },
				} );
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
