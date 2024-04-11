import { UseQueryResult, useMutation, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
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

export function useCreateMonitorSettingsMutation( siteSlug: SiteSlug, queryOptions = {} ) {
	const MAX_RETRIES = 3;
	const isMonitorNotActiveErrorMsg = 'Monitor is not active.';

	const isMonitorActive = ( data: UpdateMonitorSettingsCreate ) => {
		return data?.settings && data?.settings?.monitor_active === true;
	};

	const isMonitorNotActiveError = ( error: Error ) => {
		return error.message === isMonitorNotActiveErrorMsg;
	};

	const mutation = useMutation( {
		mutationFn: async ( params: object ) => {
			const response: UpdateMonitorSettingsCreate = await wpcomRequest( {
				path: `/sites/${ siteSlug }/jetpack-monitor-settings`,
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				body: params,
			} );
			if ( ! isMonitorActive( response ) ) {
				throw new Error( isMonitorNotActiveErrorMsg );
			}
			return response;
		},
		...queryOptions,
		retry: ( failureCount, error ) => {
			if ( isMonitorNotActiveError( error ) ) {
				if ( failureCount < MAX_RETRIES ) {
					return true;
				}
				recordTracksEvent( 'calypso_scheduled_updates_retry_monitor_settings_failed', {
					site_slug: siteSlug,
				} );
			}
			return false;
		},
		retryDelay: 3000,
	} );

	const { mutate } = mutation;
	const createMonitorSettings = useCallback( ( params: object ) => mutate( params ), [ mutate ] );

	return { createMonitorSettings, ...mutation };
}
