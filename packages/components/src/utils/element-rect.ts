import { useEvent, useResizeObserver } from '@wordpress/compose';
import { useLayoutEffect, useRef, useState } from 'react';

/**
 * The position and dimensions of an element, relative to its offset parent.
 */
export type ElementOffsetRect = {
	/**
	 * The element the rect belongs to.
	 */
	element: HTMLElement | undefined;
	/**
	 * The distance from the top edge of the offset parent to the top edge of
	 * the element.
	 */
	top: number;
	/**
	 * The distance from the right edge of the offset parent to the right edge
	 * of the element.
	 */
	right: number;
	/**
	 * The distance from the bottom edge of the offset parent to the bottom edge
	 * of the element.
	 */
	bottom: number;
	/**
	 * The distance from the left edge of the offset parent to the left edge of
	 * the element.
	 */
	left: number;
	/**
	 * The width of the element.
	 */
	width: number;
	/**
	 * The height of the element.
	 */
	height: number;
};

/**
 * An `ElementOffsetRect` object with all values set to zero.
 */
export const NULL_ELEMENT_OFFSET_RECT = {
	element: undefined,
	top: 0,
	right: 0,
	bottom: 0,
	left: 0,
	width: 0,
	height: 0,
} satisfies ElementOffsetRect;

/**
 * Returns the position and dimensions of an element, relative to its offset
 * parent, with subpixel precision. Values reflect the real measures before any
 * potential scaling distortions along the X and Y axes.
 *
 * Useful in contexts where plain `getBoundingClientRect` calls or `ResizeObserver`
 * entries are not suitable, such as when the element is transformed, and when
 * `element.offset<Top|Left|Width|Height>` methods are not precise enough.
 *
 * **Note:** in some contexts, like when the scale is 0, this method will fail
 * because it's impossible to calculate a scaling ratio. When that happens, it
 * will return `undefined`.
 */
export function getElementOffsetRect( element: HTMLElement ): ElementOffsetRect | undefined {
	// Position and dimension values computed with `getBoundingClientRect` have
	// subpixel precision, but are affected by distortions since they represent
	// the "real" measures, or in other words, the actual final values as rendered
	// by the browser.
	const rect = element.getBoundingClientRect();
	if ( rect.width === 0 || rect.height === 0 ) {
		return;
	}
	const offsetParent = element.offsetParent;
	const offsetParentRect = offsetParent?.getBoundingClientRect() ?? NULL_ELEMENT_OFFSET_RECT;
	const offsetParentScrollX = offsetParent?.scrollLeft ?? 0;
	const offsetParentScrollY = offsetParent?.scrollTop ?? 0;

	// Computed widths and heights have subpixel precision, and are not affected
	// by distortions.
	const computedWidth = parseFloat( getComputedStyle( element ).width );
	const computedHeight = parseFloat( getComputedStyle( element ).height );

	// We can obtain the current scale factor for the element by comparing "computed"
	// dimensions with the "real" ones.
	const scaleX = computedWidth / rect.width;
	const scaleY = computedHeight / rect.height;

	return {
		element,
		// To obtain the adjusted values for the position:
		// 1. Compute the element's position relative to the offset parent.
		// 2. Correct for the scale factor.
		// 3. Adjust for the scroll position of the offset parent.
		top: ( rect.top - offsetParentRect?.top ) * scaleY + offsetParentScrollY,
		right: ( offsetParentRect?.right - rect.right ) * scaleX - offsetParentScrollX,
		bottom: ( offsetParentRect?.bottom - rect.bottom ) * scaleY - offsetParentScrollY,
		left: ( rect.left - offsetParentRect?.left ) * scaleX + offsetParentScrollX,
		// Computed dimensions don't need any adjustments.
		width: computedWidth,
		height: computedHeight,
	};
}

const POLL_RATE = 100;

/**
 * Tracks the position and dimensions of an element, relative to its offset
 * parent. The element can be changed dynamically.
 *
 * When no element is provided (`null` or `undefined`), the hook will return
 * a "null" rect, in which all values are `0` and `element` is `undefined`.
 *
 * **Note:** sometimes, the measurement will fail (see `getElementOffsetRect`'s
 * documentation for more details). When that happens, this hook will attempt
 * to measure again after a frame, and if that fails, it will poll every 100
 * milliseconds until it succeeds.
 */
export function useTrackElementOffsetRect(
	targetElement: HTMLElement | undefined | null,
	deps: unknown[] = []
) {
	const [ indicatorPosition, setIndicatorPosition ] =
		useState< ElementOffsetRect >( NULL_ELEMENT_OFFSET_RECT );
	const intervalRef = useRef< ReturnType< typeof setInterval > >();

	const measure = useEvent( () => {
		// Check that the targetElement is still attached to the DOM, in case
		// it was removed since the last `measure` call.
		if ( targetElement && targetElement.isConnected ) {
			const elementOffsetRect = getElementOffsetRect( targetElement );
			if ( elementOffsetRect ) {
				setIndicatorPosition( elementOffsetRect );
				clearInterval( intervalRef.current );
				return true;
			}
		} else {
			clearInterval( intervalRef.current );
		}
		return false;
	} );

	const setElement = useResizeObserver( () => {
		if ( ! measure() ) {
			requestAnimationFrame( () => {
				if ( ! measure() ) {
					intervalRef.current = setInterval( measure, POLL_RATE );
				}
			} );
		}
	} );

	useLayoutEffect( () => {
		setElement( targetElement );
		if ( ! targetElement ) {
			setIndicatorPosition( NULL_ELEMENT_OFFSET_RECT );
		}
	}, [ setElement, targetElement ] );

	// Escape hatch to force a remeasurement when something else changes rather
	// than the target elements' ref or size (for example, the target element
	// can change its position within the tablist).
	useLayoutEffect( () => {
		measure();
		// `measure` is a stable function, so it's safe to omit it from the deps array.
		// deps can't be statically analyzed by ESLint
	}, deps );

	return indicatorPosition;
}
