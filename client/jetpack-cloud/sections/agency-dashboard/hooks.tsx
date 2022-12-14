import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext } from 'react';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import useUpdateMonitorSettingsMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-update-monitor-settings-mutation';
import { errorNotice } from 'calypso/state/notices/actions';
import SitesOverviewContext from './sites-overview/context';
import type {
	Site,
	APIError,
	UpdateMonitorSettingsParams,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

export function useUpdateMonitorSettings(
	siteId: number
): [ ( params: object ) => void, boolean ] {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const { filter, search, currentPage } = useContext( SitesOverviewContext );
	const queryKey = [ 'jetpack-agency-dashboard-sites', search, currentPage, filter ];

	const updateMonitorSettings = useUpdateMonitorSettingsMutation( {
		onMutate: async () => {
			// Cancel any current refetches, so they don't overwrite our optimistic update
			await queryClient.cancelQueries( queryKey );

			// Snapshot the previous value
			const previousSites = queryClient.getQueryData( queryKey );

			// Optimistically update to the new value
			queryClient.setQueryData( queryKey, ( oldSites: any ) => {
				return {
					...oldSites,
					sites: oldSites?.sites.map( ( site: Site ) => {
						if ( site.blog_id === siteId ) {
							return {
								...site,
								monitor_active: ! site.monitor_active,
							};
						}
						return site;
					} ),
				};
			} );

			// Store previous settings in case of failure
			return { previousSites };
		},
		onError: ( error: APIError, options: any, context: any ) => {
			queryClient.setQueryData( queryKey, context?.previousSites );
			const errorMessage =
				error.message ??
				translate(
					'Sorry, something went wrong when trying to update monitor settings. Please try again.'
				);
			dispatch( errorNotice( errorMessage, { isPersistent: true } ) );
		},
		retry: ( errorCount ) => {
			return errorCount < 3;
		},
	} );

	const updateSettings = useCallback(
		( params: UpdateMonitorSettingsParams ) => {
			updateMonitorSettings.mutate( { siteId, params } );
		},
		[ siteId, updateMonitorSettings ]
	);

	return [ updateSettings, updateMonitorSettings.isLoading ];
}
