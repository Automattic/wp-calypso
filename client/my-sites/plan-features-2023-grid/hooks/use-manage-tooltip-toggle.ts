import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { hasTouch } from 'calypso/lib/touch-detect';

export function useManageTooltipToggle(): [ string, Dispatch< SetStateAction< string > > ] {
	const [ activeTooltipId, setActiveTooltipId ] = useState( '' );
	const isTouch = hasTouch();

	useEffect( () => {
		if ( ! isTouch ) {
			return;
		}

		// Close all toolltips in mobile if the user touches anywhere on the plan card.
		const closeAllTooltips = ( event: TouchEvent ) => {
			const eventTarget = event.target as Element;
			if ( ! eventTarget?.classList.contains( 'plans-2023-tooltip__hover-area-container' ) ) {
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
