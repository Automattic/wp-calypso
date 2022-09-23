import { useQuery } from 'react-query';
import { buildConnectionForCheckingAvailability } from './connection';
import { HappychatAuth } from './types';
import useHappychatAuth from './use-happychat-auth';

type HCAvailability = { available?: boolean; status?: string };

const key = Date.now();

function getHCAvailabilityAndStatus( dataAuth: HappychatAuth ) {
	return new Promise< HCAvailability >( ( resolve ) => {
		const result: HCAvailability = {};
		const connection = buildConnectionForCheckingAvailability( {
			receiveAccept: ( receivedAvailability ) => {
				result.available = receivedAvailability;

				if ( Object.keys( result ).length === 2 ) {
					resolve( result );
					// close connection after we get accept and status
					connection.openSocket?.then( ( socket ) => socket.close() );
				}
			},
			receiveStatus( status ) {
				result.status = status;

				if ( Object.keys( result ).length === 2 ) {
					resolve( result );
					// close connection after we get accept and status
					connection.openSocket?.then( ( socket ) => socket.close() );
				}
			},
			receiveUnauthorized: () => {
				resolve( { available: false, status: 'new' } );
			},
		} );
		connection.init( ( value: unknown ) => value, Promise.resolve( dataAuth ) );
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
