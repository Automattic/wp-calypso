import { RefObject, useEffect, useRef, useState } from 'react';

/**
 * Returns whether an element has touched/crossed the viewport's upper boundary,
 * plus or minus a given vertical offset.
 * @param offsetY A vertical offset (in pixels) to add or subtract
 * 		  when determining if the observed element has crossed
 * 		  the viewport's upper boundary
 * @returns A tuple with a reference to the observed element,
 * 			and a boolean indicating whether it's crossed
 * 			the viewport's upper boundary
 */
const useDetectWindowBoundary = (
	offsetY = 0
): [ RefObject< HTMLDivElement | undefined >, boolean | undefined ] => {
	const elementRef = useRef< HTMLDivElement >();
	const observerRef = useRef< IntersectionObserver >();

	const [ borderCrossed, setBorderCrossed ] = useState< boolean | undefined >( undefined );

	useEffect( () => {
		// We can't do anything without a valid reference to an element on the page
		if ( ! elementRef.current ) {
			return;
		}

		// If the observer is already defined, no need to continue
		if ( observerRef.current ) {
			return;
		}

		const handler = ( entries: IntersectionObserverEntry[] ) => {
			if ( ! entries.length ) {
				return;
			}

			// When the observed element crosses out of the top of the viewport,
			// its bounding rectangle will always have a Y coordinate
			// smaller than the value of our offsetY parameter.
			setBorderCrossed( entries[ 0 ].boundingClientRect.y < offsetY );
		};

		// Only trigger the handler when the observed element's
		// intersection ratio becomes 1.0 (fully visible), or
		// when it becomes less than 1.0 (not fully visible)
		observerRef.current = new IntersectionObserver( handler, {
			rootMargin: `${ -1 * offsetY }px 0px 0px 0px`,
			threshold: [ 1 ],
		} );

		observerRef.current.observe( elementRef.current );

		// Stop observing when this hook is unmounted
		return () => observerRef.current?.disconnect?.();
	}, [ offsetY ] );

	return [ elementRef, borderCrossed ];
};

export default useDetectWindowBoundary;
