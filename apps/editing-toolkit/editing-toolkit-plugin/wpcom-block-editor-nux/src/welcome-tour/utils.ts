/**
 * External Dependencies
 */
import { isDesktop } from '@automattic/viewport';
/**
 * Internal dependencies
 */
import type { TourAsset } from './types';

/**
 * This function returns the src string for the current Welcome Tour View based on the current viewport
 *
 * @param asset {TourAsset} list of assets for current Welcome Tour View
 * @returns {string} asset src string
 */
export const getImageSrcForView = ( asset: TourAsset ): string => {
	return ! isDesktop() && asset.mobile ? asset.mobile.src : asset.desktop.src;
};
