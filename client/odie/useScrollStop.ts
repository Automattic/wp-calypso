import { useEffect } from 'react';

export const useScrollStop = ( element: Element | null | undefined, callback: () => void ) => {
	useEffect( () => {
		if ( element ) {
			element.addEventListener( 'wheel', callback );
			element.addEventListener( 'touchstart', callback );
			element.addEventListener( 'wheel', callback, { passive: true } );
			element.addEventListener( 'touchend', callback, { passive: true } );
		}

		return () => {
			if ( element ) {
				element.removeEventListener( 'wheel', callback );
				element.removeEventListener( 'touchstart', callback );
				element.removeEventListener( 'wheel', callback );
				element.removeEventListener( 'touchend', callback );
			}
		};
	}, [ callback, element ] );
};
