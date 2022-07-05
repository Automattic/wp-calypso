import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { OtherSupportAvailability, HappyChatAvailability } from './types';

type ResponseType< T extends 'CHAT' | 'OTHER' > = T extends 'CHAT'
	? HappyChatAvailability
	: OtherSupportAvailability;

export function useSupportAvailability< SUPPORT_TYPE extends 'CHAT' | 'OTHER' >(
	supportType: SUPPORT_TYPE,
	enabled = true
) {
	return useQuery< ResponseType< SUPPORT_TYPE >, typeof Error >(
		supportType === 'OTHER' ? 'otherSupportAvailability' : 'chatSupportAvailability',
		async () =>
			await wpcomRequest( {
				path: `help-center/support-availability/${ supportType === 'OTHER' ? 'all' : 'chat' }`,
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
			} ),
		{
			enabled,
			refetchOnWindowFocus: false,
			keepPreviousData: true,
		}
	);
}
