import { useEffect, useState } from 'react';
import buildConnection from './connection';
import useHappychatAuth from './use-happychat-auth';

export function useHappychatAvailable() {
	const [ available, setIsAvailable ] = useState< boolean | undefined >( undefined );
	const { data: dataAuth, isLoading: isLoadingAuth } = useHappychatAuth();

	useEffect( () => {
		if ( ! isLoadingAuth && dataAuth ) {
			const connection = buildConnection( {
				receiveAccept: ( receivedAvailability ) => setIsAvailable( receivedAvailability ),
			} );
			connection.init( ( value: any ) => value, Promise.resolve( dataAuth ) );
		}
	}, [ dataAuth, isLoadingAuth ] );

	return { available, isLoading: available === undefined };
}

export default useHappychatAvailable;
