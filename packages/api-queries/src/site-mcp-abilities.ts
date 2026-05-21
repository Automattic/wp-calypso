import { updateSiteMcpAbilities } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { userSettingsQuery } from './me-settings';
import { queryClient } from './query-client';
import type {
	McpSiteOverride,
	SiteMcpAbilitiesUpdateRequest,
	UserSettings,
} from '@automattic/api-core';

export const siteMcpAbilitiesMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( data: SiteMcpAbilitiesUpdateRequest ) => updateSiteMcpAbilities( siteId, data ),
		onSuccess: ( _data, variables ) => {
			queryClient.setQueryData< UserSettings >( userSettingsQuery().queryKey, ( oldData ) => {
				if ( ! oldData?.mcp_abilities ) {
					return oldData;
				}

				const sites = oldData.mcp_abilities.sites ?? [];
				const siteIndex = sites.findIndex( ( site ) => site.blog_id === siteId );
				const nextSite: McpSiteOverride = {
					...( siteIndex >= 0 ? sites[ siteIndex ] : { blog_id: siteId } ),
				};

				if ( Object.prototype.hasOwnProperty.call( variables, 'site_level_enabled' ) ) {
					nextSite.site_level_enabled = variables.site_level_enabled;
				}

				if ( Object.prototype.hasOwnProperty.call( variables, 'abilities' ) ) {
					nextSite.abilities = variables.abilities ?? {};
				}

				const nextSites =
					siteIndex >= 0
						? sites.map( ( site, index ) => ( index === siteIndex ? nextSite : site ) )
						: [ ...sites, nextSite ];

				return {
					...oldData,
					mcp_abilities: {
						...oldData.mcp_abilities,
						sites: nextSites,
					},
				};
			} );
			queryClient.invalidateQueries( { queryKey: userSettingsQuery().queryKey } );
		},
	} );
