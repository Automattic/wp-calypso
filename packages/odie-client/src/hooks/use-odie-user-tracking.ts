import { useState, useEffect, useRef } from 'react';
import type { OdieUserTracking } from '../types';

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

/**
 * `useOdieUserTracking` is a custom React Hook that monitors user interactions on the website. It keeps track of
 * the paths visited, the time spent on each path, and the interactive elements clicked by the user during their
 * visit. This information is accumulated within a session and is retained for the last 10 path transitions.
 *
 * It returns an array of user tracking data objects, each containing the path visited, time spent, and the
 * interactive elements that were clicked on that path.
 * @returns {OdieUserTracking[]} An array of user tracking data.
 */
export const useOdieUserTracking = (): OdieUserTracking[] => {
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
			const time_spent = now - startTime.current;

			setUserLocations( ( prevLocations ) =>
				[
					...prevLocations,
					{
						path: currentPath.current,
						time_spent,
						elements_clicked: [ ...elementsClicked.current ],
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
		const wpcomNode = document.getElementById( 'wpcom' );

		window.addEventListener( 'beforeunload', updateUserLocations );
		wpcomNode?.addEventListener( 'click', recordClick );

		return () => {
			clearInterval( intervalId );
			window.removeEventListener( 'beforeunload', updateUserLocations );
			wpcomNode?.removeEventListener( 'click', recordClick );
		};
	}, [] );

	return userLocations;
};
