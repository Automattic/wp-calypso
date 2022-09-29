import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import { getPlanDiscountedRawPrice } from 'calypso/state/sites/plans/selectors';
import type { Plan } from '@automattic/calypso-products';
import type { AppState } from 'calypso/types';

/**
 * Computes a price based on plan slug/constant, including any discounts available.
 *
 * @param {object} state Current redux state
 * @param {number|undefined} siteId Site ID to consider
 * @param {object} planObject Plan object returned by getPlan() from @automattic/calypso-products
 * @param {boolean} isMonthly Flag - should return a monthly price?
 * @returns {number|null} Requested price
 */
export const getPlanPrice = (
	state: AppState,
	siteId: number | undefined,
	planObject: Plan,
	isMonthly?: boolean
): number | null => {
	return (
		getPlanDiscountedRawPrice( state, siteId, planObject.getStoreSlug(), { isMonthly } ) ||
		getPlanRawPrice( state, planObject.getProductId(), isMonthly )
	);
};
