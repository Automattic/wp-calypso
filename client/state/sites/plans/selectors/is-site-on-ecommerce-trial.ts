import { PLAN_ECOMMERCE_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { getSite } from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

/**
 * Checks whether the current site is on the Woo Trial.
 *
 * @param {AppState} state Global state tree
 * @param {number} siteId - Site ID
 * @returns {boolean} Returns true if the site is on the trial
 */
export default function isSiteOnECommerceTrial( state: AppState, siteId: number ) {
	const site = getSite( state, siteId );

	if ( ! site?.plan?.product_slug ) {
		return false;
	}

	return site.plan.product_slug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
}
