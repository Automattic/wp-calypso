import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { OtherSupportAvailability, HappyChatAvailability } from './types';

type ResponseType< T extends 'CHAT' | 'OTHER' > = T extends 'CHAT'
	? HappyChatAvailability
	: OtherSupportAvailability;

export function useSupportAvailability< SUPPORT_TYPE extends 'CHAT' | 'OTHER' >(
	supportType: SUPPORT_TYPE
) {
	const isSimpleSite = window.location.host.endsWith( '.wordpress.com' );
	return useQuery< ResponseType< SUPPORT_TYPE >, typeof Error >(
		supportType === 'OTHER' ? 'otherSupportAvailability' : 'chatSupportAvailability',
		async () =>
			await wpcomRequest( {
				path: supportType === 'OTHER' ? '/help/tickets/all/mine' : '/help/olark/mine',
				apiVersion: '1.1',
			} ),
		{
			enabled: isSimpleSite,
			refetchOnWindowFocus: false,
			keepPreviousData: true,
		}
	);
}
