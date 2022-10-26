import apiFetch from '@wordpress/api-fetch';
import { useQuery } from 'react-query';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { OtherSupportAvailability, HappyChatAvailability } from './types';

type ResponseType< T extends 'CHAT' | 'OTHER' > = T extends 'CHAT'
	? HappyChatAvailability
	: OtherSupportAvailability;

interface APIFetchOptions {
	global: boolean;
	path: string;
}

export function useSupportAvailability< SUPPORT_TYPE extends 'CHAT' | 'OTHER' >(
	supportType: SUPPORT_TYPE,
	enabled = true
) {
	return useQuery< ResponseType< SUPPORT_TYPE >, typeof Error >(
		supportType === 'OTHER' ? 'otherSupportAvailability' : 'chatSupportAvailability',
		async () =>
			canAccessWpcomApis()
				? await wpcomRequest( {
						path: `help/eligibility/${ supportType === 'OTHER' ? 'all' : 'chat' }/mine`,
						apiNamespace: 'wpcom/v2/',
						apiVersion: '2',
				  } )
				: await apiFetch( {
						path: `help-center/support-availability/${ supportType === 'OTHER' ? 'all' : 'chat' }`,
						global: true,
				  } as APIFetchOptions ),
		{
			enabled,
			refetchOnWindowFocus: false,
			keepPreviousData: true,
		}
	);
}
