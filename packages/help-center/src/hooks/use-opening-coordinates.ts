import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useState, useEffect } from 'react';

type OpeningCoordinates = {
	left: number;
	top: number | 'auto';
	transformOrigin: string;
};

const AESTHETIC_OFFSET = 60;
const HELP_CENTER_WIDTH = 410;
const HELP_CENTER_POSITION = {
	MASTERBAR: 11,
	EDITOR: 15,
};

const getOriginElementOffset = ( element: HTMLElement ) => {
	if ( element.classList.contains( 'masterbar__item' ) ) {
		return HELP_CENTER_POSITION.MASTERBAR;
	}
	if ( element.classList.contains( 'entry-point-button' ) ) {
		return HELP_CENTER_POSITION.EDITOR;
	}
	return 0;
};

const getDefaultPosition = (): OpeningCoordinates => ( {
	left: window?.innerWidth - HELP_CENTER_WIDTH - AESTHETIC_OFFSET,
	top: 60,
	transformOrigin: 'center',
} );

const calculateOpeningPosition = ( element: HTMLElement ): OpeningCoordinates => {
	const { innerWidth, innerHeight } = window;
	const helpCenterHeight = Math.min( 800, innerHeight * 0.8 );

	// To prevent Help Center from not being shown if an element is not found.
	if ( ! element ) {
		return getDefaultPosition();
	}

	const { x, y, width, height } = element.getBoundingClientRect();
	const position = getOriginElementOffset( element );
	const buttonLeftEdge = x - position;
	const buttonTopEdge = y;
	const buttonBottomEdge = y + height;

	const coords = {
		top: buttonBottomEdge + AESTHETIC_OFFSET,
		left: buttonLeftEdge,
		transformOrigin: 'top left',
	};

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
		const buttonRightEdge = x + width + position;
		coords.left = buttonRightEdge - HELP_CENTER_WIDTH;
		coords.transformOrigin += ' right';
	} else {
		// Align left edge of the help center with the left edge of the button
		coords.left = buttonLeftEdge;
		coords.transformOrigin += ' left';
	}

	const isOffScreen =
		coords.top < 0 ||
		coords.left < 0 ||
		coords.left + HELP_CENTER_WIDTH > innerWidth ||
		coords.top + helpCenterHeight > innerHeight;

	return isOffScreen ? getDefaultPosition() : coords;
};

export function useOpeningCoordinates(
	disabled = false,
	isMinimized: boolean
): OpeningCoordinates | undefined {
	const isMobile = useMobileBreakpoint();
	const [ openingCoordinates, setOpeningCoordinates ] = useState( getDefaultPosition() );

	useEffect( () => {
		if ( disabled || isMobile ) {
			return;
		}

		const handler = ( event: MouseEvent ) => {
			try {
				const path = event.composedPath();
				const openingElement = ( path.find(
					( element ) =>
						element instanceof HTMLButtonElement || element instanceof HTMLAnchorElement
				) || path[ 0 ] ) as HTMLElement;
				setOpeningCoordinates( calculateOpeningPosition( openingElement ) );
			} catch ( e ) {
				// Handle unexpected click targets
			}
		};

		document.addEventListener( 'mousedown', handler );
		return () => document.removeEventListener( 'mousedown', handler );
	}, [ disabled, isMobile ] );

	if ( isMobile ) {
		return undefined;
	}

	if ( isMinimized && openingCoordinates ) {
		return { ...openingCoordinates, top: 'auto', transformOrigin: 'bottom right' };
	}

	return openingCoordinates;
}
