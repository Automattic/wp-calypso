import { isEnabled } from '@automattic/calypso-config';
import type { WPBreakpoint } from '@wordpress/compose/build-types/hooks/use-viewport-match';

const isOmnibarEnabled = isEnabled( 'dashboard/omnibar' );

/**
 * The sidebar added by the omnibar takes up space, so layouts need wider
 * breakpoints to avoid feeling cramped. When the omnibar is enabled, shift
 * breakpoints up:
 *   - medium → xlarge
 *   - small  → large
 */
export const VIEWPORT_BREAKPOINTS: Record<
	'desktop' | 'medium' | 'small' | 'mobile',
	WPBreakpoint
> = {
	desktop: isOmnibarEnabled ? 'xlarge' : 'medium',
	medium: isOmnibarEnabled ? 'xlarge' : 'medium',
	small: isOmnibarEnabled ? 'large' : 'small',
	mobile: 'mobile',
};
