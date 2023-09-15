import { useState, useEffect, useRef } from 'react';

export type OdieUserTracking = {
	path: string;
	timeSpent: number;
	elementsClicked: string[];
};

const isUserReadableInteractiveElement = ( element: HTMLElement ) => {
	const tagName = element.tagName.toLocaleUpperCase();
	switch ( tagName ) {
		case 'A':
		case 'BUTTON':
		case 'SELECT':
			return true;
		default:
	}
};

const useOdieUserTracking = (): OdieUserTracking[] => {
	const [ userLocations, setUserLocations ] = useState< OdieUserTracking[] >( [] );
	const currentPath = useRef( window.location.pathname );
	const startTime = useRef( Date.now() );
	const elementsClicked = useRef< string[] >( [] );

	const recordClick = ( event: MouseEvent ) => {
		const target = event.target as HTMLElement;

		if ( isUserReadableInteractiveElement( target ) ) {
			elementsClicked.current.push( target.innerText );
		}
	};

	const updateUserLocations = () => {
		const now = Date.now();
		const newCurrentPath = window.location.pathname;

		if ( currentPath.current !== newCurrentPath ) {
			const timeSpent = now - startTime.current;

			setUserLocations( ( prevLocations ) =>
				[
					...prevLocations,
					{
						path: currentPath.current,
						timeSpent,
						elementsClicked: [ ...elementsClicked.current ],
					},
				].slice( -10 )
			);

			currentPath.current = newCurrentPath;
			startTime.current = now;
			elementsClicked.current = [];
		}
	};

	useEffect( () => {
		const intervalId = setInterval( updateUserLocations, 1000 ); // Check for URL change every second

		window.addEventListener( 'beforeunload', updateUserLocations );
		document.addEventListener( 'click', recordClick );

		return () => {
			clearInterval( intervalId );
			window.removeEventListener( 'beforeunload', updateUserLocations );
			document.removeEventListener( 'click', recordClick );
		};
	}, [] );

	return userLocations;
};

export default useOdieUserTracking;
