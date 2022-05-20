import { useEffect, useState } from 'react';
import buildConnection from './connection';
import useHappychatAuth from './use-happychat-auth';

export function useHappychatAvailable() {
	const [ available, setIsAvailable ] = useState( undefined );
	const { data: dataAuth, isLoading: isLoadingAuth } = useHappychatAuth();

	useEffect( () => {
		if ( ! isLoadingAuth && dataAuth ) {
			const connection = buildConnection( ( receivedAvailability ) =>
				setIsAvailable( receivedAvailability )
			);
			connection.init( ( value ) => value, Promise.resolve( dataAuth ) );
		}
	}, [ dataAuth, isLoadingAuth ] );

	return { available, isLoading: available === undefined };
}

export default useHappychatAvailable;
