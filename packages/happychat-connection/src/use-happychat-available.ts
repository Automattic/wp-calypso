import { useEffect, useState } from 'react';
import { buildConnectionForCheckingAvailability } from './connection';
import useHappychatAuth from './use-happychat-auth';

export function useHappychatAvailable() {
	const [ available, setIsAvailable ] = useState< boolean | undefined >( undefined );
	const { data: dataAuth, isLoading: isLoadingAuth } = useHappychatAuth();

	useEffect( () => {
		if ( ! isLoadingAuth && dataAuth ) {
			const connection = buildConnectionForCheckingAvailability( {
				receiveAccept: ( receivedAvailability ) => {
					setIsAvailable( receivedAvailability );
				},
				receiveUnauthorized: () => {
					setIsAvailable( false );
				},
			} );
			connection.init( ( value: unknown ) => value, Promise.resolve( dataAuth ) );
		}
	}, [ dataAuth, isLoadingAuth ] );

	return { available: Boolean( available ), isLoading: available === undefined };
}

export default useHappychatAvailable;
