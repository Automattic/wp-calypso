import { useEffect, useState } from 'react';
import buildConnection from './connection';
import useHappychatAuth from './use-happychat-auth';

let cachedAvailableValue: boolean | undefined = undefined;

export function useHappychatAvailable() {
	const [ available, setIsAvailable ] = useState< boolean | undefined >( cachedAvailableValue );
	const { data: dataAuth, isLoading: isLoadingAuth } = useHappychatAuth(
		cachedAvailableValue === undefined
	);

	useEffect( () => {
		if ( ! isLoadingAuth && dataAuth && cachedAvailableValue === undefined ) {
			const connection = buildConnection( {
				receiveAccept: ( receivedAvailability ) => {
					cachedAvailableValue = receivedAvailability;
					setIsAvailable( receivedAvailability );
				},
				receiveUnauthorized: () => {
					cachedAvailableValue = false;
					setIsAvailable( false );
				},
			} );
			connection.init( ( value: unknown ) => value, Promise.resolve( dataAuth ) );
		}
	}, [ dataAuth, isLoadingAuth ] );

	return { available: Boolean( available ), isLoading: available === undefined };
}

export default useHappychatAvailable;
