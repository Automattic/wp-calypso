import type { useViewportMatch } from '@wordpress/compose';

type WPBreakpoint = Parameters< typeof useViewportMatch >[ 0 ];

/**
 * The sidebar added by the omnibar takes up space, so layouts use wider
 * breakpoints to avoid feeling cramped:
 *   - medium → xlarge
 *   - small  → large
 */
export const VIEWPORT_BREAKPOINTS: Record<
	'desktop' | 'medium' | 'small' | 'mobile',
	WPBreakpoint
> = {
	desktop: 'xlarge',
	medium: 'xlarge',
	small: 'large',
	mobile: 'mobile',
};
