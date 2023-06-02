import { getSitePlan } from 'calypso/state/sites/plans/selectors/get-site-plan';

/**
 * Returns true if the site plan contains introductory offer pricing.
 *
 * @param  {Object}  state         global state
 * @param  {number}  siteId        the site id
 * @param  {string}  productSlug   the plan product slug
 * @returns {boolean}              True if the site plan contains an introductory offer discount.
 */
export function isIntroductoryOfferAppliedToPlanPrice( state, siteId, productSlug ) {
	const plan = getSitePlan( state, siteId, productSlug );

	return ( plan?.introductoryOfferRawPrice ?? -1 ) > 0;
}
