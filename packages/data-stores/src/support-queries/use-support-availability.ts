import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { OtherSupportAvailability, HappyChatAvailability } from './types';

type ResponseType< T extends 'CHAT' | 'OTHER' > = T extends 'CHAT'
	? HappyChatAvailability
	: OtherSupportAvailability;

interface APIResponse< T extends 'CHAT' | 'OTHER' > {
	get_availability: ResponseType< T >;
}

export function useSupportAvailability< SUPPORT_TYPE extends 'CHAT' | 'OTHER' >(
	supportType: SUPPORT_TYPE,
	enabled = true
) {
	return useQuery< ResponseType< SUPPORT_TYPE >, typeof Error >(
		supportType === 'OTHER' ? 'otherSupportAvailability' : 'chatSupportAvailability',
		async () =>
			await wpcomRequest< APIResponse< SUPPORT_TYPE > >( {
				path:
					supportType === 'OTHER'
						? 'help-center/support-availability'
						: 'help-center/chat-availability',
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
			} ).then( ( response ) => response?.get_availability ),
		{
			enabled,
			refetchOnWindowFocus: false,
			keepPreviousData: true,
		}
	);
}
