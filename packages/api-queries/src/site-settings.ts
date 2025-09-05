import { fetchSiteSettings, updateSiteSettings } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';
import type { SiteSettings } from '@automattic/api-core';

export const siteSettingsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'settings' ],
		queryFn: () => fetchSiteSettings( siteId ),
	} );

export const siteSettingsMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( data: Partial< SiteSettings > ) => updateSiteSettings( siteId, data ),
		onSuccess: ( newData ) => {
			queryClient.setQueryData( siteSettingsQuery( siteId ).queryKey, ( oldData ) => {
				if ( ! oldData ) {
					return oldData;
				}

				// If we're updating MCP abilities, preserve the full objects
				if ( 'mcp_abilities' in newData && oldData.mcp_abilities ) {
					// Transform the simplified response back to full objects
					const updatedAbilities = { ...oldData.mcp_abilities };
					// Check if newData.mcp_abilities has the expected structure for updates
					if ( newData.mcp_abilities && typeof newData.mcp_abilities === 'object' ) {
						Object.entries( newData.mcp_abilities ).forEach( ( [ abilityId, enabled ] ) => {
							if ( updatedAbilities[ abilityId ] && typeof enabled === 'number' ) {
								updatedAbilities[ abilityId ] = {
									...updatedAbilities[ abilityId ],
									enabled: enabled === 1,
								};
							}
						} );
					}

					return {
						...oldData,
						...newData,
						mcp_abilities: updatedAbilities,
					};
				}

				return {
					...oldData,
					...newData,
				};
			} );
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
		},
	} );
