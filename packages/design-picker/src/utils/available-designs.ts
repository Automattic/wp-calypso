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

	// These settings are arbitrary. Switching from the previous settings (1199x3600) to these settings reduces page weight from 70 MB to ~5 MB,
	// These settings are intended to, at best, be temporary. A long-term solution for this should probably have values determined by A/B tests,
	// end up serving WEBPs instead of JPEGs, spend fewer bits on parts of images that are not displayed, and possibly display fewer images.
	//
	// See #88786 for more info.
	return {
		vpw: isMobile ? MOBILE_VIEWPORT_WIDTH : DEFAULT_VIEWPORT_WIDTH,
		vph: scrollable ? 1600 : 1040,
		w: highRes ? 500 : 500, // Stubbed out. See #88786 for more info.
		screen_height: 1100,
	};
};

export function isBlankCanvasDesign( design?: Design ): boolean {
	if ( ! design ) {
		return false;
	}
	return /blank-canvas/i.test( design.slug ) && ! design.is_virtual;
}
