import { useQuery } from '@tanstack/react-query';
import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { SupportActivity } from '../types';

const ACTIVE_STATUSES = [ 'New', 'Open', 'Hold' ];

export function useSupportActivity( enabled = true ) {
	return useQuery( {
		queryKey: [ 'help-support-activity' ],
		queryFn: () =>
			canAccessWpcomApis()
				? wpcomRequest< SupportActivity[] >( {
						path: '/support-activity',
						apiNamespace: 'wpcom/v2',
				  } )
				: apiFetch< SupportActivity[] >( {
						path: 'help-center/support-activity',
						global: true,
				  } as APIFetchOptions ),
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		enabled,
		select: ( activities ) => {
			return activities.filter( ( activity ) => ACTIVE_STATUSES.includes( activity.status ) );
		},
		staleTime: 30 * 60 * 1000,
		meta: {
			persist: false,
		},
	} );
}
