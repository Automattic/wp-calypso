import { useEffect, useState } from 'react';

// Used to generate a different text for the "Check site" button
export function useDelayedQueryTime( domain: string, isFetching: boolean, limit = 3000 ) {
	const [ isTimeUp, setIsTimeUp ] = useState( false );

	useEffect( () => {
		setIsTimeUp( false );

		if ( isFetching ) {
			const timer = setTimeout( () => {
				setIsTimeUp( true );
			}, limit );

			return () => clearTimeout( timer );
		}
	}, [ domain, isFetching, limit ] );

	return isTimeUp;
}
