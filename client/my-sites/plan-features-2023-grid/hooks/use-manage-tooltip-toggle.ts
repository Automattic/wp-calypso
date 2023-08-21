import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { hasTouch } from 'calypso/lib/touch-detect';

export function useManageTooltipToggle(): [ string, Dispatch< SetStateAction< string > > ] {
	const [ activeTooltipId, setActiveTooltipId ] = useState( '' );
	const isTouch = hasTouch();

	useEffect( () => {
		if ( ! isTouch ) {
			return;
		}

		// Do not close tooltip if the user touches a tooltip container.
		// Since the plan logos are an SVG, we are checking the event target's grandparent class to determine the tooltip container.
		const closeAllTooltips = ( event: TouchEvent ) => {
			const eventTarget = event.target as Element;
			if (
				eventTarget.classList?.contains( 'plans-2023-tooltip__hover-area-container' ) ||
				eventTarget.parentElement?.parentElement?.classList?.contains(
					'plans-2023-tooltip__hover-area-container'
				)
			) {
				return;
			}

			// Close all toolltips in mobile if the user touches anywhere on the plan card.
			setActiveTooltipId( '' );
		};

		document.addEventListener( 'touchstart', closeAllTooltips );

		return () => {
			document.removeEventListener( 'touchstart', closeAllTooltips );
		};
	}, [ isTouch ] );

	return [ activeTooltipId, setActiveTooltipId ];
}
