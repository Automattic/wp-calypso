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

const isMonitorActive = ( data: UpdateMonitorSettingsCreate ) => {
	return data?.settings && data?.settings?.monitor_active === true;
};

const isMonitorNotActiveError = ( error: Error ) => {
	return error.message === 'Monitor is not active.';
};

const createMonitorSettingsMutateFn = async ( siteSlug: string, params: object ) => {
	const response: UpdateMonitorSettingsCreate = await wpcomRequest( {
		path: `/sites/${ siteSlug }/jetpack-monitor-settings`,
		apiNamespace: 'wpcom/v2',
		method: 'POST',
		body: params,
	} );
	if ( ! isMonitorActive( response ) ) {
		throw new Error( 'Monitor is not active.' );
	}
	return response;
};

const createMonitorSettingsRetryFn =
	( siteSlug?: string ) => ( failureCount: number, error: Error ) => {
		const MAX_RETRIES = 3;

		if ( isMonitorNotActiveError( error ) ) {
			if ( failureCount < MAX_RETRIES ) {
				return true;
			}
			if ( siteSlug ) {
				recordTracksEvent( 'calypso_scheduled_updates_retry_monitor_settings_failed', {
					site_slug: siteSlug,
				} );
			} else {
				recordTracksEvent( 'calypso_scheduled_updates_batch_retry_monitor_settings_failed' );
			}
		}
		return false;
	};

export function useCreateMonitorSettingsMutation( siteSlug: SiteSlug, queryOptions = {} ) {
	const mutation = useMutation( {
		mutationFn: async ( params: object ) => createMonitorSettingsMutateFn( siteSlug, params ),
		...queryOptions,
		retry: createMonitorSettingsRetryFn( siteSlug ),
		retryDelay: 3000,
	} );

	const { mutate } = mutation;
	const createMonitorSettings = useCallback( ( params: object ) => mutate( params ), [ mutate ] );

	return { createMonitorSettings, ...mutation };
}

export function useBatchCreateMonitorSettingsMutation( queryOptions = {} ) {
	const mutation = useMutation( {
		mutationKey: [ 'batch-create-monitor-settings' ],
		mutationFn: async ( params: { [ siteSlug: string ]: object } ) => {
			const results = await Promise.all(
				Object.keys( params ).map( async ( siteSlug ) => {
					try {
						const response = await createMonitorSettingsMutateFn( siteSlug, params[ siteSlug ] );
						return { siteSlug, response, error: null };
					} catch ( error ) {
						throw { siteSlug, error };
					}
				} )
			);

			// check if any of the requests failed
			const failedRequests = results.filter( ( result ) => result?.error );
			if ( failedRequests.length ) {
				throw failedRequests;
			}
		},
		...queryOptions,
		retry: createMonitorSettingsRetryFn(),
		retryDelay: 3000,
	} );

	const { mutate } = mutation;
	const createMonitorSettings = useCallback(
		( params: { [ siteSlug: string ]: object } ) => mutate( params ),
		[ mutate ]
	);

	return { createMonitorSettings, ...mutation };
}
