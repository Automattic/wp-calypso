import { useQuery } from 'react-query';
import { buildConnectionForCheckingAvailability } from './connection';
import { HappychatAuth } from './types';
import useHappychatAuth from './use-happychat-auth';

const key = Date.now();

type HCAvailability = { available?: boolean; status?: string };

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

export function useHappychatAvailable( enabled = true ) {
	const { data: dataAuth, isLoading: isLoadingAuth } = useHappychatAuth();

	return useQuery(
		'happychat-available' + key,
		() => getHCAvailabilityAndStatus( dataAuth as HappychatAuth ),
		{
			enabled: ! isLoadingAuth && !! dataAuth && enabled,
			staleTime: Infinity,
		}
	);
}

export default useHappychatAvailable;
