/**
 * External dependencies
 */
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';

/**
 * Returns whether `elementRef` has touched/crossed the upper Window's boundary.
 *
 * @param {MutableRefObject} elementRef Reference to an HTMLElement
 * @returns {boolean} Whether the element crossed the upper boundary
 */
const useDetectWindowBoundary = ( elementRef: MutableRefObject< HTMLDivElement | null > ) => {
	// Indicates whether the elementRef has crossed the upper window boundary
	const [ borderCrossed, setBorderCrossed ] = useState( false );

	const addStickyClass = useRef< ( this: Window, e: Event ) => void >(
		throttle( () => {
			if ( ! elementRef || ! elementRef.current ) {
				return;
			}
			setBorderCrossed( window.pageYOffset > elementRef.current.offsetTop );
		}, 50 )
	);

	useEffect( () => {
		const { current: addStickyClassFn } = addStickyClass;
		window.addEventListener( 'scroll', addStickyClassFn );
		return () => window.removeEventListener( 'scroll', addStickyClassFn );
	}, [ elementRef ] );

	return borderCrossed;
};

export default useDetectWindowBoundary;
