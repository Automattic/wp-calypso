import type { AppState } from 'calypso/types';

/**
 * @param  {object}  state       Global state tree
 * @param  {number}  productId   The productId to check for an intro offer
 * @param  {number}  siteId      The ID of the site we're querying
 * @returns {number|null}        The raw price of intro offer, if available. null otherwise.
 */
export default function getIntroOfferPrice(
	state: AppState,
	productId: number,
	siteId: number | 'none' = 'none'
): number | null {
	return state.sites?.introOffers?.items?.[ siteId ?? 'none' ]?.[ productId ]?.rawPrice ?? null;
}
