import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { EmailSupportAvailability, HappyChatAvailability } from './types';

type ResponseType< T extends 'CHAT' | 'EMAIL' > = T extends 'CHAT'
	? HappyChatAvailability
	: EmailSupportAvailability;

export function useSupportAvailability< SUPPORT_TYPE extends 'CHAT' | 'EMAIL' >(
	supportType: SUPPORT_TYPE
) {
	return useQuery< ResponseType< SUPPORT_TYPE >, typeof Error >(
		supportType === 'EMAIL' ? 'emailSupportAvailability' : 'chatSupportAvailability',
		async () =>
			await wpcomRequest( {
				path: supportType === 'EMAIL' ? '/help/tickets/kayako/mine' : '/help/olark/mine',
				apiVersion: '1.1',
			} ),
		{
			refetchOnWindowFocus: false,
			keepPreviousData: true,
		}
	);
}
