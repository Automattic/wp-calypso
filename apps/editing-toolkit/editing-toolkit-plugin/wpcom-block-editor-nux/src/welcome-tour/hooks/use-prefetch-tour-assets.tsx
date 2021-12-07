/**
 * External Dependencies
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
import type { TourAsset } from '../types';
import type { Step, Steps } from '@automattic/tour-kit';

export function usePrefetchTourAssets( steps: Steps ): void {
	const isMobile = useMobileBreakpoint();

	steps.forEach( ( step: Step ) => {
		const imgSrc = step.meta.imgSrc as TourAsset;
		new window.Image().src = isMobile && imgSrc.mobile ? imgSrc.mobile.src : imgSrc.desktop.src;
	} );
}
