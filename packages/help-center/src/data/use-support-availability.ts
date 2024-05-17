import { keepPreviousData, useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { OtherSupportAvailability, EmailSupportStatus } from '../types';

type ResponseType< T extends 'OTHER' | 'EMAIL' > = T extends 'EMAIL'
	? EmailSupportStatus
	: OtherSupportAvailability;

interface APIFetchOptions {
	global: boolean;
	path: string;
}

export function useSupportAvailability< SUPPORT_TYPE extends 'OTHER' | 'EMAIL' >(
	supportType: SUPPORT_TYPE,
	enabled = true
) {
	return useQuery< ResponseType< SUPPORT_TYPE >, typeof Error >( {
		queryKey: [ 'support-availability', supportType ],
		queryFn: async () =>
			canAccessWpcomApis()
				? await wpcomRequest( {
						path: `help/eligibility/${
							supportType === 'OTHER' ? 'all' : supportType.toLocaleLowerCase()
						}/mine`,
						apiNamespace: 'wpcom/v2/',
						apiVersion: '2',
				  } )
				: await apiFetch( {
						path: `help-center/support-availability/${
							supportType === 'OTHER' ? 'all' : supportType.toLocaleLowerCase()
						}`,
						global: true,
				  } as APIFetchOptions ),
		enabled,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
		staleTime: 6 * 60 * 60 * 1000, // 6 hours
	} );
}
