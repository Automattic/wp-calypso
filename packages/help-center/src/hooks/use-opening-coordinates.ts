import { useMobileBreakpoint } from '@automattic/viewport-react';

type OpeningCoordinates = {
	left: number;
	top?: number | 'auto';
	bottom?: number | 'auto';
	transformOrigin: string;
};

const AESTHETIC_OFFSET = 20;
const HELP_CENTER_WIDTH = 410;

const defaultPosition = {
	left: window?.innerWidth - HELP_CENTER_WIDTH - AESTHETIC_OFFSET,
	bottom: 20,
	transformOrigin: 'center',
};

/**
 * This hook determines the position of the Help Center based on the last click event.
 * @param isMinimized If the Help Center is minimized
 * @returns object with left and top properties
 */
export function useOpeningCoordinates( isMinimized: boolean ): OpeningCoordinates | undefined {
	const isMobile = useMobileBreakpoint();

	if ( isMobile ) {
		return undefined;
	}

	if ( isMinimized ) {
		return { ...defaultPosition, top: 'auto', transformOrigin: 'bottom right' };
	}

	return defaultPosition;
}
