import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useState, useEffect } from 'react';

const AESTHETIC_OFFSET = 20;
const DEFAULT_OFFSET = 45;
const HELP_CENTER_WIDTH = 410;

/**
 * This function calculates the position of the Help Center based on the last click event.
 * @param element The element that was clicked
 * @returns object with left and top properties
 */
export const calculateOpeningPosition = ( element: HTMLElement ) => {
	const { innerWidth, innerHeight } = window;
	const helpCenterHeight = Math.min( 800, innerHeight * 0.8 );
	HELP_CENTER_WIDTH;

	const defaultPosition = {
		left: innerWidth - HELP_CENTER_WIDTH - AESTHETIC_OFFSET,
		top: 100,
		transformOrigin: 'center',
	};

	// To prevent Help Center from not being shown if an element is not found.
	if ( ! element ) {
		return defaultPosition;
	}

	// Return an empty object in mobile view.
	if ( innerWidth <= 480 ) {
		return {};
	}

	const { x, y, width, height } = element.getBoundingClientRect();

	const buttonLeftEdge = x;
	const buttonRightEdge = x + width;

	const buttonTopEdge = y;
	const buttonBottomEdge = y + height;

	const coords = { ...defaultPosition };

	if ( buttonTopEdge + helpCenterHeight + AESTHETIC_OFFSET > innerHeight ) {
		// Align the bottom edge of the help center with the top edge of the button
		coords.top = buttonTopEdge - helpCenterHeight - AESTHETIC_OFFSET;
		coords.transformOrigin = 'bottom';
	} else {
		// Align the top edge of the help center with the bottom edge of the button
		coords.top = buttonBottomEdge + AESTHETIC_OFFSET;
		coords.transformOrigin = 'top';
	}

	if ( buttonLeftEdge + HELP_CENTER_WIDTH + AESTHETIC_OFFSET > innerWidth ) {
		// Align right edge of the help center with the right edge of the button
		coords.left = buttonRightEdge - HELP_CENTER_WIDTH;
		coords.transformOrigin += ' right';
	} else {
		// Align left edge of the help center with the left edge of the button
		coords.left = buttonLeftEdge;
		coords.transformOrigin += ' left';
	}

	// If the help center is off screen, move it to a set position
	if (
		coords.top < 0 ||
		coords.left < 0 ||
		coords.left + HELP_CENTER_WIDTH > innerWidth ||
		coords.top + helpCenterHeight > innerHeight
	) {
		return defaultPosition;
	}

	return coords;
};

export function useOpeningCoordinates(
	isMinimized: boolean,
	disabled: boolean = false,
	useDefaultOpeningPosition = false
) {
	const isMobile = useMobileBreakpoint();
	const { innerWidth } = window;

	// Store the last click event to be used for the opening position
	const [ openingCoordinates, setOpeningCoordinates ] = useState< {
		top?: number;
		left?: number;
		transformOrigin?: string;
	} >(
		useDefaultOpeningPosition
			? {
					top: 100,
					left: innerWidth - HELP_CENTER_WIDTH - DEFAULT_OFFSET,
					transformOrigin: 'top right',
			  }
			: {}
	);

	useEffect( () => {
		function handler( event: MouseEvent ) {
			if ( ! disabled ) {
				try {
					const path = event.composedPath();

					// Find the first button or anchor element in the path
					// If none is found, use the first element in the path
					const openingElement = ( path.find(
						( element ) =>
							element instanceof HTMLButtonElement || element instanceof HTMLAnchorElement
					) || path[ 0 ] ) as HTMLElement;

					setOpeningCoordinates( calculateOpeningPosition( openingElement ) );
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
