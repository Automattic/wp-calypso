import apiFetch from '@wordpress/api-fetch';
import { useQuery } from 'react-query';
import { HappychatAuth } from './types';
import useHappychatAuth from './use-happychat-auth';

type HCAvailability = { available?: boolean; status?: string; env?: 'staging' | 'production' };

const key = Date.now();

function getHCAvailabilityAndStatus( dataAuth: HappychatAuth ) {
	const result: HCAvailability = {};
	return new Promise< HCAvailability >( ( resolve ) => {
		apiFetch( {
			mode: 'cors',
			method: 'GET',
			credentials: 'omit',
			url: dataAuth.availability_url,
		} ).then( ( response ) => {
			result.env = response?.env;
			result.available = response?.available;
			result.status = dataAuth.is_existing_session ? 'assigned' : 'new';
			resolve( result );
		} );
	} );
}

/**
 * Opens a socket connection to Happychat to check if it's available and if the user has an active session.
 * By default, it caches the answer for 10 minutes or until page refresh.
 *
 * @param enabled on/off switch
 * @param staleTime time in ms to cache the result
 * @returns
 */
export function useHappychatAvailable( enabled = true, staleTime = 10 * 60 * 1000 ) {
	const { data: dataAuth, isLoading: isLoadingAuth } = useHappychatAuth();

	return useQuery(
		'happychat-available' + key,
		() => getHCAvailabilityAndStatus( dataAuth as HappychatAuth ),
		{
			enabled: ! isLoadingAuth && !! dataAuth && enabled,
			staleTime,
		}
	);
}

export default useHappychatAvailable;
