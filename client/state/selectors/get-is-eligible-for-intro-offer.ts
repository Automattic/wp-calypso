import { get } from 'lodash';
import type { AppState } from 'calypso/types';

/**
 * @param  {object}  state       Global state tree
 * @param  {number}  productId   The productId to check for an intro offer
 * @param  {number?}  siteId      The ID of the site we're querying
 * @returns {boolean}        The raw price of intro offer, if available. null otherwise.
 */
export default function getIsEligibleForIntroOffer(
	state: AppState,
	productId: number,
	siteId: number | 'none'
): boolean {
	const ineligibleReason = get(
		state.sites.introOffers,
		`items.${ siteId }.${ productId }.ineligibleReason`,
		null
	);

	return (
		ineligibleReason === null ||
		( Array.isArray( ineligibleReason ) && ineligibleReason.length <= 0 )
	);
}
