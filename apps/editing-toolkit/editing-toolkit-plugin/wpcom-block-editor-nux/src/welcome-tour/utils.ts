/**
 * External Dependencies
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useEffect } from 'react';
/**
 * Internal dependencies
 */
import type { TourAsset } from './types';

export function useImageSrcForView( asset: TourAsset ): string {
	const isMobile = useMobileBreakpoint();

	useEffect( () => {
		return isMobile && asset.mobile ? asset.mobile.src : asset.desktop.src;
	}, [ asset, isMobile ] );
}
