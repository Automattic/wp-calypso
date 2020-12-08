/**
 * External dependencies
 */
import React, { useRef, useEffect, useState } from 'react';
import { throttle } from 'lodash';

type NullableDOMRect = ClientRect | DOMRect | null;
type NullableElement = Element | null;

export const THROTTLE_RATE = 200;

function rectIsEqual( prevRect: NullableDOMRect, nextRect: NullableDOMRect ) {
	if ( prevRect === null ) {
		return nextRect === null;
	}

	if ( nextRect === null ) {
		return prevRect === null;
	}

	return (
		prevRect.bottom === nextRect.bottom &&
		prevRect.left === nextRect.left &&
		prevRect.right === nextRect.right &&
		prevRect.top === nextRect.top &&
		prevRect.width === nextRect.width &&
		prevRect.height === nextRect.height
	);
}

function rectIsZero( rect: NullableDOMRect ) {
	if ( rect === null ) {
		return null;
	}
	return (
		rect.bottom === 0 &&
		rect.left === 0 &&
		rect.right === 0 &&
		rect.top === 0 &&
		rect.width === 0 &&
		rect.height === 0
	);
}

/**
 * React hook that subscribes a consumer to changes to the bounding client rect of an element, based
 * on window resize events.
 * Does not notify when an element resizes due to reasons other than the window resizing.
 * Uses throttling on the events, to avoid making changes too often.
 *
 * @param callback The function to call back on changes. Takes a single parameter: `boundingClientRect`.
 *
 * @returns The ref to be set on the consumer component.
 */
export function useWindowResizeCallback(
	callback: ( boundingClientRect: NullableDOMRect ) => void
) {
	const lastRect = useRef< NullableDOMRect >( null );
	const elementRef = useRef< NullableElement >( null );

	useEffect( () => {
		if ( ! callback ) {
			return;
		}

		// Measure the element in the DOM.
		const measureElement = () => {
			const rect = elementRef.current ? elementRef.current.getBoundingClientRect() : null;
			// Avoid notifying consumer if nothing's changed.
			if ( ! rectIsEqual( lastRect.current, rect ) && ! rectIsZero( rect ) ) {
				lastRect.current = rect;

				// Notify consumer of bounding client rect change.
				callback( rect );
			}
		};

		// Measure element so that the callback is invoked at least once, even if
		// there are no window resize events.
		measureElement();

		const throttledMeasureElement = throttle( measureElement, THROTTLE_RATE );

		// Set up subscription.
		window.addEventListener( 'resize', throttledMeasureElement );

		// Unsubscribe.
		return () => {
			window.removeEventListener( 'resize', throttledMeasureElement );
			throttledMeasureElement.cancel();
		};
	}, [ elementRef.current, callback ] );

	return elementRef;
}

/**
 * React hook that subscribes a consumer to changes to the bounding client rect of an element, based
 * on window resize events.
 * Does not notify when an element resizes due to reasons other than the window resizing.
 * Uses throttling on the events, to avoid making changes too often.
 *
 * @returns A tuple with the ref to be set on the consumer component, and the current rect.
 */
export function useWindowResizeRect(): [
	React.MutableRefObject< NullableElement >,
	NullableDOMRect
] {
	const [ rect, setRect ] = useState< NullableDOMRect >( null );
	const callbackRef = useWindowResizeCallback( setRect );
	return [ callbackRef, rect ];
}
