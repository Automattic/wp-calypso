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
	monitor_active?: boolean;
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

interface MonitorSettingVariables {
	retryFlag?: boolean;
}

export function useCreateMonitorSettingsMutation( siteSlug: SiteSlug, queryOptions = {} ) {
	const MAX_RETRIES = 3;
	let retryCount = 0;

	const isMonitorNotActive = ( data: UpdateMonitorSettingsCreate ) => {
		return data?.settings && data?.settings?.monitor_active === false;
	};

	const mutation = useMutation( {
		mutationFn: ( params: MonitorSettingVariables ) =>
			wpcomRequest( {
				path: `/sites/${ siteSlug }/jetpack-monitor-settings`,
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				body: params,
			} ) as Promise< UpdateMonitorSettingsCreate >,
		...queryOptions,
		onSuccess: ( data, variables ) => {
			const { retryFlag } = variables;
			if ( retryFlag && isMonitorNotActive( data ) ) {
				if ( retryCount < MAX_RETRIES ) {
					// Increment the retry count
					retryCount += 1;
					// Retry the mutation if the monitor is not active
					setTimeout( () => mutation.mutate( variables ), 3000 ); // Delay of 3 seconds
				} else {
					// Throw an error when maximum retry count is reached
					throw new Error( 'Maximum retry count reached. Monitor is still not active.' );
				}
			}
			return data;
		},
	} );

	const { mutate } = mutation;
	const createMonitorSettings = useCallback(
		( params: object, retryFlag: boolean ) => mutate( { ...params, retryFlag } ),
		[ mutate ]
	);

	return { createMonitorSettings, ...mutation };
}
