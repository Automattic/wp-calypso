/**
 * External Dependencies
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
import type { Step, Steps } from '@automattic/tour-kit';

export function usePrefetchTourAssets( steps: Step | Steps ): void {
	const isMobile = useMobileBreakpoint();

	const convertStepsToArray = ( steps: Step | Steps ): Steps =>
		Array.isArray( steps ) ? steps : [ steps ];

	convertStepsToArray( steps ).forEach( ( step: Step ) => {
		const imgSrc = step.meta.imgSrc;
		new window.Image().src = isMobile && imgSrc.mobile ? imgSrc.mobile.src : imgSrc.desktop.src;
	} );
}
