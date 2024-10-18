import type { AppState } from 'calypso/types';

/**
 * @param  {Object}  state       Global state tree
 * @param  {number}  productId   The productId to check for an intro offer
 * @param  {number|'none'|undefined}  siteId      The ID of the site we're querying
 * @returns {boolean}             Whether the site is eligible for an intro offer
 */

export default function getIntroOfferEligibility(
	state: AppState,
	productId: number,
	siteId: number | 'none' | undefined
): boolean {
	const siteIdKey = siteId && typeof siteId === 'number' && siteId > 0 ? siteId : 'none';

	const introOffer = state.sites?.introOffers?.items?.[ siteIdKey ]?.[ productId ];

	const ineligibleReason = introOffer?.ineligibleReason;

	return ! ineligibleReason || ineligibleReason?.length === 0;
}
