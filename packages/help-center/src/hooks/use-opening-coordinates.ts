import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useState, useEffect } from '@wordpress/element';

type OpeningCoordinates = {
	left: number;
	bottom: number | 'auto';
	transformOrigin: string;
};

const AESTHETIC_OFFSET = 20;
const HELP_CENTER_WIDTH = 410;

const getDefaultPosition = (): OpeningCoordinates => ( {
	left: window?.innerWidth - HELP_CENTER_WIDTH - AESTHETIC_OFFSET,
	bottom: 20,
	transformOrigin: 'center',
} );

/**
 * This hook determines the position of the Help Center in the viewport.
 * It handles positioning differently based on device size and minimized state.
 * @param disabled If the Help Center is disabled
 * @param isMinimized Whether the Help Center is in minimized state
 * @returns OpeningCoordinates object with positioning properties (left, top/bottom, transformOrigin)
 */
export function useOpeningCoordinates(
	disabled = false,
	isMinimized: boolean
): OpeningCoordinates | undefined {
	const isMobile = useMobileBreakpoint();
	const [ position, setPosition ] = useState< OpeningCoordinates | undefined >(
		isMobile ? undefined : getDefaultPosition()
	);

	useEffect( () => {
		if ( disabled ) {
			return;
		}

		if ( isMobile ) {
			setPosition( undefined );
			return;
		}

		const updatePosition = () => {
			const defaultPos = getDefaultPosition();

			if ( isMinimized ) {
				setPosition( {
					...defaultPos,
					transformOrigin: 'bottom right',
				} );
			} else {
				setPosition( defaultPos );
			}
		};

		updatePosition();

		window.addEventListener( 'resize', updatePosition );

		return () => {
			window.removeEventListener( 'resize', updatePosition );
		};
	}, [ disabled, isMobile, isMinimized ] );

	return position;
}
