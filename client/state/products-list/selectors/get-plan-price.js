/**
 * Internal dependencies
 */
import { getPlanDiscountedRawPrice } from 'calypso/state/sites/plans/selectors';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';

/**
 * Computes a price based on plan slug/constant, including any discounts available.
 *
 * @param {object} state Current redux state
 * @param {number} siteId Site ID to consider
 * @param {object} planObject Plan object returned by getPlan() from lib/plans
 * @param {boolean} isMonthly Flag - should return a monthly price?
 * @returns {number} Requested price
 */
export const getPlanPrice = ( state, siteId, planObject, isMonthly ) => {
	return (
		getPlanDiscountedRawPrice( state, siteId, planObject.getStoreSlug(), { isMonthly } ) ||
		getPlanRawPrice( state, planObject.getProductId(), isMonthly )
	);
};
