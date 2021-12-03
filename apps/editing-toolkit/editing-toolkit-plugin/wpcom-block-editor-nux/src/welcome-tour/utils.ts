/**
 * External Dependencies
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
import type { Step, Steps } from '@automattic/tour-kit';

export function usePrefetchTourAssets( steps: Step | Steps ): void {
	const isMobile = useMobileBreakpoint();

	if ( ! Array.isArray( steps ) ) {
		const imgSrc = steps.meta.imgSrc;
		new window.Image().src = isMobile && imgSrc.mobile ? imgSrc.mobile.src : imgSrc.desktop.src;
		return;
	}

	steps.forEach( ( step: Step ) => {
		const imgSrc = step.meta.imgSrc;
		new window.Image().src = isMobile && imgSrc.mobile ? imgSrc.mobile.src : imgSrc.desktop.src;
	} );
}
