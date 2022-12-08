import apiFetch from '@wordpress/api-fetch';
import { useQuery } from 'react-query';

interface HappychatAvailableResponse {
	available: boolean;
	proxied: boolean;
}

export function useHappychatAvailable( enabled = true ) {
	return useQuery< HappychatAvailableResponse >(
		`happychat-available-${ Math.floor( Date.now() / 1000 ) }`,
		() =>
			apiFetch( {
				mode: 'cors',
				method: 'GET',
				parse: false,
				credentials: 'omit',
				url: `https://public-api.wordpress.com/wpcom/v2/happychat/availability?cache_buster=${ Date.now() }`,
			} ).then( ( response: any ) => {
				return response.json().then( ( body: { available: boolean } ) => {
					const proxied = response?.url === 'https://happychat-io-staging.go-vip.co/_availability';
					return { available: body.available, proxied };
				} );
			} ),
		{
			refetchOnWindowFocus: false,
			keepPreviousData: false,
			enabled,
		}
	);
}

export default useHappychatAvailable;
