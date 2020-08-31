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
	// Stores the initial position of the element in the Y axis. We need this to put the
	// element back in its place when the scroll bar reaches this point a not when the scroll
	// bar reaches the top of the page (0 in the Y axis).
	const initialTopPos = useRef< number | null >( null );

	const addStickyClass = useRef< ( this: Window, e: Event ) => void >(
		throttle( () => {
			if ( ! elementRef || ! elementRef.current ) {
				return;
			}

			const { top: distanceRelativeToViewport } = elementRef.current.getBoundingClientRect();

			if ( ! initialTopPos.current && distanceRelativeToViewport ) {
				initialTopPos.current = distanceRelativeToViewport;
			}

			setBorderCrossed( window.pageYOffset > initialTopPos.current );
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
