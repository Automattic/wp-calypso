import { WPCOM_FEATURES_WORDADS } from '@automattic/calypso-products';
import siteHasFeature from './site-has-feature';
import type { AppState } from 'calypso/types';

/**
 * Whether site has wordads feature.
 * @param  {Object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @returns {boolean} True if the site has WPCOM_FEATURES_WORDADS feature. Otherwise, False.
 */
export default function siteHasWordAds( state: AppState, siteId: number | null ): boolean {
	return siteHasFeature( state, siteId, WPCOM_FEATURES_WORDADS );
}
