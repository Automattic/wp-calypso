import { DEFAULT_VIEWPORT_WIDTH, MOBILE_VIEWPORT_WIDTH } from '../constants';
import type { Design } from '../types';
import type { MShotsOptions } from '@automattic/onboarding';

type MShotInputOptions = {
	scrollable?: boolean;
	highRes?: boolean;
	isMobile?: boolean;
};

// Used for both prefetching and loading design screenshots
export const getMShotOptions = ( {
	scrollable,
	highRes,
	isMobile,
}: MShotInputOptions = {} ): MShotsOptions => {
	// Take care changing these values, as the design-picker CSS animations are written for these values (see the *__landscape and *__portrait classes)
	return {
		vpw: isMobile ? MOBILE_VIEWPORT_WIDTH : DEFAULT_VIEWPORT_WIDTH,
		// 1040 renders well with all the current designs, more details in the links below.
		// See: #77052
		vph: scrollable ? 1600 : 1040,
		// When `w` was 1200 it created a visual glitch on one thumbnail. #57261
		w: highRes ? 1199 : 600,
		screen_height: 3600,
	};
};

export function isBlankCanvasDesign( design?: Design ): boolean {
	if ( ! design ) {
		return false;
	}
	return /blank-canvas/i.test( design.slug ) && ! design.is_virtual;
}
