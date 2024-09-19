import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import type { ScheduledUpdatesNotificationSettings } from './use-scheduled-updates-notification-settings-query';
import type { SiteSlug } from 'calypso/types';

export type CreateRequestParams = {
	success: boolean;
	failure: boolean;
};

export function useScheduledUpdatesNotificationSettingsMutation(
	siteSlug: SiteSlug,
	queryOptions = {}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation( {
		mutationKey: [ 'scheduled-updates-notification-settings', siteSlug ],
		mutationFn: ( params: ScheduledUpdatesNotificationSettings ) =>
			wpcomRequest( {
				path: `/sites/${ siteSlug }/scheduled-updates/notifications`,
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				body: params,
			} ),
		onMutate: async ( params: ScheduledUpdatesNotificationSettings ) => {
			// cancel in-flight queries because we don't want them to overwrite our optimistic update.
			await queryClient.cancelQueries( {
				queryKey: [ 'scheduled-updates-notification-settings', siteSlug ],
			} );

			// Optimistically update the cache.
			const prevSettings: ScheduledUpdatesNotificationSettings = queryClient.getQueryData( [
				'scheduled-updates-notification-settings',
				siteSlug,
			] ) || { success: false, failure: false };

			queryClient.setQueryData( [ 'scheduled-updates-notification-settings', siteSlug ], params );

			return { prevSettings };
		},
		onError: ( _err, _params, context ) =>
			// Set previous value on error.
			queryClient.setQueryData(
				[ 'scheduled-updates-notification-settings', siteSlug ],
				context?.prevSettings
			),
		...queryOptions,
	} );

	const { mutate } = mutation;
	const updateNotificationSettings = useCallback(
		( params: CreateRequestParams ) => mutate( params ),
		[ mutate ]
	);

	return { updateNotificationSettings, ...mutation };
}
