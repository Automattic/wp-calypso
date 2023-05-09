import type { AppState } from 'calypso/types';

/**
 * @param  {Object}  state       Global state tree
 * @param  {number}  productId   The productId to check for intro offers
 * @param  {number|'none'|undefined}  siteId      The ID of the site we're querying
 * @returns {boolean}            True if the offer is eligible for an intro offer
 */
export default function getIntroOfferIsEligible(
	state: AppState,
	productId: number,
	siteId: number | 'none' | undefined
): boolean {
	const siteIdKey = siteId && typeof siteId === 'number' && siteId > 0 ? siteId : 'none';

	// if siteIdKey is 'none' we are querying into offers without a site and so intro offers so always be eligible
	return siteIdKey === 'none'
		? true
		: ( state.sites?.introOffers?.items?.[ siteIdKey ]?.[ productId ]?.ineligibleReason ?? [] )
				.length === 0;
}
