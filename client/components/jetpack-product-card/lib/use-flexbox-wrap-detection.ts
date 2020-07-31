/**
 * External dependencies
 */
import { useState, useCallback, useEffect, RefObject } from 'react';

export default function useFlexboxWrapDetection( el: RefObject< HTMLElement > ): boolean {
	const [ isWrapped, setWrapped ] = useState( false );
	const detectWrap = useCallback( () => {
		if ( el?.current ) {
			setWrapped( el.current.offsetTop > 0 );
		}
	}, [ el, setWrapped ] );

	useEffect( () => {
		detectWrap();

		window.addEventListener( 'resize', detectWrap );

		return () => window.removeEventListener( 'resize', detectWrap );
	}, [ detectWrap ] );

	return isWrapped;
}
