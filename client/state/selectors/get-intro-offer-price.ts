import { get } from 'lodash';
import type { AppState } from 'calypso/types';

/**
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @param  {number}  productId   The productId to check for an intro offer
 * @returns {number|null}        The raw price of intro offer, if available. null otherwise.
 */
export default function getIntroOfferPrice(
	state: AppState,
	siteId: number,
	productId: number
): number | null {
	return get( state.sites.introOffers, `items.${ siteId }.${ productId }.rawPrice`, null );
}
