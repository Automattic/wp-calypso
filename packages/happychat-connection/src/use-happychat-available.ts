import apiFetch from '@wordpress/api-fetch';
import { useQuery } from 'react-query';

interface HappychatAvailableResponse {
	available: boolean;
	env: boolean;
}

export function useHappychatAvailable( enabled = true ) {
	return useQuery< HappychatAvailableResponse >(
		`happychat-available-${ Math.floor( Date.now() / 1000 ) }`,
		() =>
			apiFetch( {
				mode: 'cors',
				method: 'GET',
				credentials: 'omit',
				url: 'https://public-api.wordpress.com/wpcom/v2/happychat/availability',
			} ),
		{
			refetchOnWindowFocus: false,
			keepPreviousData: false,
			enabled,
		}
	);
}

export default useHappychatAvailable;
