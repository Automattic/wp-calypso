/**
 * External dependencies
 */
import { useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';

export const THROTTLE_RATE = 50;

/**
 * Returns whether an element has touched/crossed the upper Window's boundary.
 *
 * @param {number} offsetY Add offset in the Y axis for the detection
 * @returns a tuple with the ref element, and boolean whether border has crossed
 */
const useDetectWindowBoundary = ( offsetY = 0 ) => {
	const elementRef = useRef< HTMLDivElement >( null );

	// Indicates whether the elementRef has crossed the upper window boundary
	const [ borderCrossed, setBorderCrossed ] = useState( false );

	// Stores the position of the element in the Y axis.relative to the viewport top.
	const initialTopPos = useRef< number | null >( null );

	useEffect( () => {
		const addStickyClass = throttle( () => {
			if ( ! elementRef || ! elementRef.current ) {
				return;
			}

			const { top: distanceRelativeToViewport } = elementRef.current.getBoundingClientRect();

			if ( ! initialTopPos.current && distanceRelativeToViewport ) {
				initialTopPos.current = distanceRelativeToViewport;
			}

			setBorderCrossed( window.pageYOffset + offsetY > initialTopPos.current );
		}, THROTTLE_RATE );

		window.addEventListener( 'scroll', addStickyClass );

		return () => window.removeEventListener( 'scroll', addStickyClass );
	}, [ elementRef.current, offsetY ] );

	return [ elementRef, borderCrossed ];
};

export default useDetectWindowBoundary;
