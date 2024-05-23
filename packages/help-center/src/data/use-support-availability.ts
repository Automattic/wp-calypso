import { keepPreviousData, useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { ChatAvailability } from '../types';

// Bump me to invalidate the cache.
const VERSION = 2;

interface APIFetchOptions {
	global: boolean;
	path: string;
}

export function useSupportAvailability( enabled = true ) {
	return useQuery< ChatAvailability, Error >( {
		queryKey: [ 'support-availability', VERSION ],
		queryFn: async () =>
			canAccessWpcomApis()
				? await wpcomRequest( {
						path: `help/eligibility/chat/mine`,
						apiNamespace: 'wpcom/v2/',
						apiVersion: '2',
				  } )
				: await apiFetch( {
						path: `help-center/support-availability/chat`,
						global: true,
				  } as APIFetchOptions ),
		enabled,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
		staleTime: 6 * 60 * 60 * 1000, // 6 hours
	} );
}
