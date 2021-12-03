/**
 * External Dependencies
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
/**
 * Internal dependencies
 */
import type { TourAsset } from './types';

export function usePrefetchTourAssets( tourAssets: TourAsset[] ): void {
	const isMobile = useMobileBreakpoint();

	tourAssets.forEach( ( asset: TourAsset ) => {
		new window.Image().src = isMobile && asset.mobile ? asset.mobile.src : asset.desktop.src;
	} );
}
