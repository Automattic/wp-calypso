import apiFetch from '@wordpress/api-fetch';
import { useSelect } from '@wordpress/data';
import { useQuery } from 'react-query';
import { register } from '../user';
import { OtherSupportAvailability, HappyChatAvailability } from './types';

const USER_STORE = register( { client_id: '', client_secret: '' } );

type ResponseType< T extends 'CHAT' | 'OTHER' > = T extends 'CHAT'
	? HappyChatAvailability
	: OtherSupportAvailability;

export function useSupportAvailability< SUPPORT_TYPE extends 'CHAT' | 'OTHER' >(
	supportType: SUPPORT_TYPE
) {
	const user = useSelect( ( select ) => select( USER_STORE ).getCurrentUser(), [] );

	return useQuery< ResponseType< SUPPORT_TYPE >, typeof Error >(
		( supportType === 'OTHER' ? 'otherSupportAvailability' : 'chatSupportAvailability' ) +
			user?.ID ?? 'empty',
		async () => {
			return await apiFetch( {
				url: `https://public-api.wordpress.com/rest/v1.1/help/tickets/all/${ encodeURIComponent(
					user?.ID
				) }`,
				global: true,
				mode: 'cors',
				credentials: 'omit',
			} );
		},
		{
			refetchOnWindowFocus: false,
			keepPreviousData: true,
			enabled: !! user,
		}
	);
}
