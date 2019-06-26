/**
 * External dependencies
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { throttle } from 'lodash';

/**
 * Internal dependencies
 */
import afterLayoutFlush from 'lib/after-layout-flush';

const THROTTLE_RATE = 200;

type UseWindowResizeRect = ReturnType< typeof Element.prototype.getBoundingClientRect >;

// Function type for the expected callback for `useWindowResizeCallback`.
interface UseWindowResizeCallback {
	( node: Element | null | undefined ): void;
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
	callback: ( boundingClientRect: UseWindowResizeRect ) => any
) {
	const lastRect = useRef< UseWindowResizeRect | null >( null );
	const [ element, setElement ] = useState< Element | null >( null );

	const callbackRef: UseWindowResizeCallback = useCallback( node => {
		if ( node ) {
			setElement( node );
		}
	}, [] );

	useEffect( () => {
		// Notify consumer of bounding client rect change.
		const handleRectChange = ( rect: UseWindowResizeRect ) => {
			if ( rect ) {
				// Avoid notifying consumer if nothing's changed.
				if (
					lastRect.current === null ||
					lastRect.current.bottom !== rect.bottom ||
					lastRect.current.left !== rect.left ||
					lastRect.current.right !== rect.right ||
					lastRect.current.top !== rect.top ||
					lastRect.current.width !== rect.width ||
					lastRect.current.height !== rect.height
				) {
					lastRect.current = rect;
					return callback( rect );
				}
			}
		};

		// Measure the element in the DOM.
		// Uses `afterLayoutFlush` to avoid causing layout thrashing.
		const measureElement = afterLayoutFlush( () => {
			if ( element && element.getBoundingClientRect ) {
				handleRectChange( element.getBoundingClientRect() );
			}
		} );
		const throttledMeasureElement = throttle( measureElement, THROTTLE_RATE );

		// Set up subscription.
		if ( element && callback ) {
			// Measure element so that the callback is invoked at least once, even if
			// there are no window resize events.
			throttledMeasureElement();
			window.addEventListener( 'resize', throttledMeasureElement );

			// Unsubscribe.
			return () => {
				window.removeEventListener( 'resize', throttledMeasureElement );
				measureElement.cancel();
				throttledMeasureElement.cancel();
			};
		}
	}, [ element, callback ] );

	return callbackRef;
}

/**
 * React hook that subscribes a consumer to changes to the bounding client rect of an element, based
 * on window resize events.
 * Does not notify when an element resizes due to reasons other than the window resizing.
 * Uses throttling on the events, to avoid making changes too often.
 *
 * @returns A tuple with the ref to be set on the consumer component, and the current rect.
 */
export function useWindowResizeRect(): [UseWindowResizeCallback, UseWindowResizeRect | null] {
	const [ rect, setRect ] = useState< UseWindowResizeRect | null >( null );

	const callback = useCallback(
		( boundingClientRect: UseWindowResizeRect ) => setRect( boundingClientRect ),
		[]
	);
	const callbackRef = useWindowResizeCallback( callback );

	return [ callbackRef, rect ];
}
