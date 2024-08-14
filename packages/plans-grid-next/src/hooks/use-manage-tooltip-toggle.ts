import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { hasTouch } from '../lib/touch-detect';

export function useManageTooltipToggle(): [ string, Dispatch< SetStateAction< string > > ] {
	const [ activeTooltipId, setActiveTooltipId ] = useState( '' );
	const isTouch = hasTouch();

	useEffect( () => {
		if ( ! isTouch ) {
			return;
		}

		// Close all tooltips if the user touches anywhere outside a tooltip container.
		// Since the plan logos are an SVG, we are checking the event target's parent classes to determine the tooltip container.
		const closeAllTooltips = ( event: TouchEvent ) => {
			const eventTarget = event.target as Element;
			if ( ! eventTarget.closest( '.plans-next-tooltip__hover-area-container' ) ) {
				setActiveTooltipId( '' );
			}
		};

		document.addEventListener( 'touchstart', closeAllTooltips );

		return () => {
			document.removeEventListener( 'touchstart', closeAllTooltips );
		};
	}, [ isTouch ] );

	return [ activeTooltipId, setActiveTooltipId ];
}
