import {
	fetchSitePremiumAnalyticsSettings,
	fetchSiteSettings,
	updateSiteSettings,
} from '@automattic/api-core';
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
		meta: { statId: 'site-settings-update' },
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

export const sitePremiumAnalyticsEnabledQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'premium-analytics-enabled' ],
		queryFn: () => fetchSitePremiumAnalyticsSettings( siteId ),
		// Picked here rather than in queryFn: TanStack Query rejects `undefined` data, and a site
		// that never registered the setting answers exactly that.
		select: ( settings ) => settings.jetpack_premium_analytics_enabled,
		// Switching the dashboard off happens in wp-admin, so a stored `true` would keep linking to a
		// page the site no longer serves until the refetch lands.
		meta: { persist: false },
	} );
