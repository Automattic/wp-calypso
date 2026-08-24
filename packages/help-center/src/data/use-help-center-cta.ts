import { keepPreviousData, useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis, isCookieAuthMissing } from 'wpcom-proxy-request';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import type { HelpCenterCTAData } from '../types';

// Bump me to invalidate the cache.
const VERSION = 1;

interface APIFetchOptions {
	global: boolean;
	path: string;
}

export function useHelpCenterCTAQuery( enabled = true ) {
	const { currentUser } = useHelpCenterContext();

	return useQuery< HelpCenterCTAData | null, Error >( {
		queryKey: [ 'help-center-cta', VERSION ],
		queryFn: async () =>
			canAccessWpcomApis()
				? await wpcomRequest( { path: '/help/cta', apiNamespace: 'wpcom/v2' } )
				: await apiFetch( { path: 'help-center/cta', global: true } as APIFetchOptions ),
		enabled: enabled && !! currentUser?.ID && ! isCookieAuthMissing(),
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
		staleTime: 180000, // 3mins.
	} );
}
