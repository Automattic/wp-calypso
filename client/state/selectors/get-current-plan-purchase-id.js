/** @format */
/**
 * External dependencies
 */
import { get, isNaN } from 'lodash';

/**
 * Internal dependencies
 */
import { getCurrentPlan } from 'state/sites/plans/selectors';

/**
 * Returns a site's current plan purchase ID or null if the site doesn't exist or the purchase ID
 * is unknown.
 *
 * The ID returned by this selector is retrieved from the site plan. It is intended to provide a
 * means of retrieving full purchase information based on a site and its plan information.
 * Caution! It _does not_ retrieve the ID from a purchase.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?Number}        Purchase ID if known
 */
export default function getCurrentPlanPurchaseId( state, siteId ) {
	const result = get( getCurrentPlan( state, siteId ), 'id', null );

	// getCurrentPlan uses an "assembler" which may have NaN in the `id`.
	if ( isNaN( result ) ) {
		return null;
	}

	return result;
}
