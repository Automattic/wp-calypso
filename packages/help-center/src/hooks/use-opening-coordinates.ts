import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useState, useEffect } from 'react';

const AESTHETIC_OFFSET = 20;

/**
 * This function calculates the position of the Help Center based on the last click event
 *
 * @param element The element that was clicked
 * @returns object with left and top properties
 */
export const calculateOpeningPosition = ( element: HTMLElement ) => {
	const { x, y, width, height } = element.getBoundingClientRect();
	const { innerWidth, innerHeight } = window;
	const helpCenterWidth = 410;
	const helpCenterHeight = Math.min( 800, innerHeight * 0.8 );

	const buttonLeftEdge = x;
	const buttonRightEdge = x + width;

	const buttonTopEdge = y;
	const buttonBottomEdge = y + height;

	const coords = { left: 0, top: 0, bottom: undefined, transformOrigin: `${ x }px ${ y }px` };

	if ( buttonTopEdge + helpCenterHeight + AESTHETIC_OFFSET > innerHeight ) {
		// Align the bottom edge of the help center with the top edge of the button
		coords.top = buttonTopEdge - helpCenterHeight - AESTHETIC_OFFSET;
		coords.transformOrigin = 'bottom';
	} else {
		// Align the top edge of the help center with the bottom edge of the button
		coords.top = buttonBottomEdge + AESTHETIC_OFFSET;
		coords.transformOrigin = 'top';
	}

	if ( buttonLeftEdge + helpCenterWidth + AESTHETIC_OFFSET > innerWidth ) {
		// Align right edge of the help center with the right edge of the button
		coords.left = buttonRightEdge - helpCenterWidth;
		coords.transformOrigin += ' right';
	} else {
		// Align left edge of the help center with the left edge of the button
		coords.left = buttonLeftEdge;
		coords.transformOrigin += ' left';
	}

	// If the help center is off screen, move it to the top left or top right of the button
	if ( coords.top < 0 ) {
		const isButtonOnLeft = innerWidth / 2 > buttonLeftEdge;

		coords.top = AESTHETIC_OFFSET;
		coords.left = isButtonOnLeft
			? buttonRightEdge + AESTHETIC_OFFSET
			: buttonLeftEdge - helpCenterWidth - AESTHETIC_OFFSET;
		coords.transformOrigin = isButtonOnLeft ? 'left' : 'right';
	}

	return coords;
};

export function useOpeningCoordinates( disabled: boolean = false, isMinimized: boolean ) {
	const isMobile = useMobileBreakpoint();

	// Store the last click event to be used for the opening position
	const [ openingCoordinates, setOpeningCoordinates ] = useState< {
		top?: number;
		left?: number;
		transformOrigin?: string;
	} >( {} );

	useEffect( () => {
		function handler( event: MouseEvent ) {
			if ( ! disabled ) {
				try {
					const path = event.composedPath();
					const closestButtonOrAnchor = path.find(
						( element ) =>
							element instanceof HTMLButtonElement || element instanceof HTMLAnchorElement
					);
					// If the user clicked an icon inside a button or an anchor, consider the button or the anchor.
					if ( closestButtonOrAnchor ) {
						setOpeningCoordinates(
							calculateOpeningPosition( closestButtonOrAnchor as HTMLElement )
						);
					} else if ( path[ 0 ] instanceof HTMLElement ) {
						// Just pick the deepest element.
						setOpeningCoordinates( calculateOpeningPosition( path[ 0 ] as HTMLElement ) );
					}
				} catch ( e ) {
					// In case something weird is clicked. e.g something without `getBoundingClientRect`.
				}
			}
		}

		document.addEventListener( 'mousedown', handler );

		return () => document.removeEventListener( 'mousedown', handler );
	}, [ disabled ] );

	if ( isMobile ) {
		return undefined;
	}

	if ( isMinimized && openingCoordinates ) {
		return { ...openingCoordinates, top: 'auto', transformOrigin: 'bottom right' };
	}
	return openingCoordinates;
}
