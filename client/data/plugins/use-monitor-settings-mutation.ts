import { UseQueryResult, useMutation, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteSlug } from 'calypso/types';

export type UpdateMonitorURLOptions = {
	status_down_webhook_url: string;
};

export type UpdateMonitorURL = {
	monitor_url: string;
	check_interval: number;
	options: UpdateMonitorURLOptions;
};

export type UpdateMonitorSettings = {
	wp_note_notifications?: boolean;
	email_notifications?: boolean;
	sms_notifications?: boolean;
	jetmon_defer_status_down_minutes?: number;
	urls?: UpdateMonitorURL[];
};

export type UpdateMonitorSettingsCreate = {
	success: boolean;
	settings: UpdateMonitorSettings;
};

export const useMonitorSettingsQuery = (
	siteSlug: SiteSlug
): UseQueryResult< UpdateMonitorSettings > => {
	return useQuery( {
		queryKey: [ 'monitor-settings', siteSlug ],
		queryFn: () =>
			wpcomRequest< { [ key: string ]: Partial< UpdateMonitorSettings > } >( {
				path: `/sites/${ siteSlug }/jetpack-monitor-settings`,
				apiNamespace: 'wpcom/v2',
				method: 'GET',
			} ),
		meta: {
			persist: false,
		},
		enabled: !! siteSlug,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};

export function useCreateMonitorSettingsMutation( siteSlug: SiteSlug, queryOptions = {} ) {
	const mutation = useMutation( {
		mutationFn: ( params: object ) =>
			wpcomRequest( {
				path: `/sites/${ siteSlug }/jetpack-monitor-settings`,
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				body: params,
			} ),
		...queryOptions,
	} );

	const { mutate } = mutation;
	const createMonitorSettings = useCallback( ( params: object ) => mutate( params ), [ mutate ] );

	return { createMonitorSettings, ...mutation };
}
