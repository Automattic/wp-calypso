/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSitePlan } from 'calypso/state/sites/plans/selectors/get-site-plan';

/**
 * Returns true if a plan is discounted
 *
 * @param  {object}   state         global state
 * @param  {number}   siteId        the site id
 * @param  {string}   productSlug   the plan product slug
 * @returns {?boolean}              true if a plan has a discount
 */
export function isSitePlanDiscounted( state, siteId, productSlug ) {
	const plan = getSitePlan( state, siteId, productSlug );

	if ( ! plan ) {
		return null;
	}

	return get( plan, 'rawDiscount', -1 ) > 0;
}
