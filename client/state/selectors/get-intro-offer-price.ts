import type { AppState } from 'calypso/types';

/**
 * @param  {Object}  state       Global state tree
 * @param  {number}  productId   The productId to check for an intro offer
 * @param  {number|'none'|undefined}  siteId      The ID of the site we're querying
 * @returns {number|null}        The raw price of intro offer, if available. null otherwise.
 */
export default function getIntroOfferPrice(
	state: AppState,
	productId: number,
	siteId: number | 'none' | undefined
): number | null {
	const siteIdKey = siteId && typeof siteId === 'number' && siteId > 0 ? siteId : 'none';

	return state.sites?.introOffers?.items?.[ siteIdKey ]?.[ productId ]?.rawPrice ?? null;
}
