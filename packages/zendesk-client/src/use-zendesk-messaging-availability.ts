/**
 * External dependencies
 */
import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
/**
 * Internal dependencies
 */
import type { APIFetchOptions, MessagingAvailability, MessagingGroup } from './types';

export function useZendeskMessagingAvailability( group: MessagingGroup, enabled = true ) {
	return useQuery< MessagingAvailability >( {
		queryKey: [ 'zendeskMessagingAvailability', group ],
		queryFn: () => {
			const currentEnvironment = config( 'env_id' );
			const params = {
				group: group as string,
				environment: currentEnvironment === 'development' ? 'development' : 'production',
			};
			const wpcomParams = new URLSearchParams( params );

			return canAccessWpcomApis()
				? wpcomRequest< MessagingAvailability >( {
						path: '/help/support-status/messaging',
						apiNamespace: 'wpcom/v2',
						query: wpcomParams.toString(),
						method: 'GET',
				  } )
				: apiFetch< MessagingAvailability >( {
						path: addQueryArgs( '/help-center/support-status/messaging', params ),
						method: 'GET',
						global: true,
				  } as APIFetchOptions );
		},
		staleTime: 60 * 1000, // 1 minute
		meta: {
			persist: false,
		},
		enabled,
	} );
}
