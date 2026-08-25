import { keepPreviousData, useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis, isCookieAuthMissing } from 'wpcom-proxy-request';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { SupportStatus } from '../types';

// Bump me to invalidate the cache.
const VERSION = 3;

export const SUPPORT_STATUS_QUERY_KEY = [ 'support-status', VERSION ];

interface APIFetchOptions {
	global: boolean;
	path: string;
}

export function useSupportStatus( enabled = true ) {
	const { currentUser } = useHelpCenterContext();

	return useQuery< SupportStatus, Error >( {
		queryKey: SUPPORT_STATUS_QUERY_KEY,
		queryFn: async () =>
			canAccessWpcomApis()
				? await wpcomRequest( { path: '/help/support-status', apiNamespace: 'wpcom/v2' } )
				: await apiFetch( { path: 'help-center/support-status', global: true } as APIFetchOptions ),
		enabled: enabled && !! currentUser?.ID && ! isCookieAuthMissing(),
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
		staleTime: 180000, // 3mins.
	} );
}
