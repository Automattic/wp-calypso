import { useEffect, useState } from 'react';

function useNetworkConnection() {
	const [ isOnline, setIsOnline ] = useState( navigator.onLine );

	useEffect( () => {
		window.addEventListener( 'online', () => setIsOnline( true ) );
		window.addEventListener( 'offline', () => setIsOnline( false ) );

		return () => {
			window.removeEventListener( 'online', () => setIsOnline( true ) );
			window.removeEventListener( 'offline', () => setIsOnline( false ) );
		};
	}, [] );

	return { isOnline };
}

export default useNetworkConnection;
