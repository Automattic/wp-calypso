import config, { isCalypsoLive } from '@automattic/calypso-config';
import apiFetch from '@wordpress/api-fetch';
import { useQuery } from 'react-query';

type HCAvailability = { available?: boolean; status?: string; env?: 'staging' | 'production' };

const key = Date.now();

const isNonProdEnv =
	[ 'stage', 'development', 'horizon' ].includes( config( 'env_id' ) ) || isCalypsoLive();

function getHCAvailability() {
	const url = isNonProdEnv
		? 'https://happychat-io-staging.go-vip.co/_availability'
		: 'https://happychat.io/_availability';
	return new Promise< HCAvailability >( ( resolve ) => {
		apiFetch( {
			mode: 'cors',
			method: 'GET',
			credentials: 'omit',
			url: `${ url }?${ Date.now() }`,
		} ).then( ( response: any ) => {
			resolve( {
				env: isNonProdEnv ? 'staging' : 'production',
				available: response?.available,
			} );
		} );
	} );
}

/**
 * Sends a request to Happychat availability endpoint to check if chat is available.
 * By default, it caches the answer for 10 minutes or until page refresh.
 *
 * @param enabled on/off switch
 * @param staleTime time in ms to cache the result
 * @returns
 */
export function useHappychatAvailable( enabled = true, staleTime = 10 * 60 * 1000 ) {
	return useQuery( 'happychat-available' + key, () => getHCAvailability(), {
		enabled,
		staleTime,
	} );
}

export default useHappychatAvailable;
