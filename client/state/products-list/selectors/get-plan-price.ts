import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import { getPlanDiscountedRawPrice } from 'calypso/state/sites/plans/selectors';
import type { Plan, PlanSlug, ProductSlug } from '@automattic/calypso-products';
import type { AppState } from 'calypso/types';

type PlanOrProductSlug = PlanSlug | ProductSlug;
type Optional< T, K extends keyof T > = Pick< Partial< T >, K > & Omit< T, K >;
type PlanObject = Optional< Pick< Plan, 'group' | 'getProductId' >, 'group' > & {
	getStoreSlug: () => PlanOrProductSlug;
};

/**
 * Computes a price based on plan slug/constant, including any discounts available.
 *
 * @param {Object} state Current redux state
 * @param {number|undefined} siteId Site ID to consider
 * @param {Object} planObject Plan object returned by getPlan() from @automattic/calypso-products
 * @param {boolean} isMonthly Flag - should return a monthly price?
 * @returns {number|null} Requested price
 */
export const getPlanPrice = (
	state: AppState,
	siteId: number | undefined,
	planObject: Pick< PlanObject, 'getStoreSlug' | 'getProductId' >,
	isMonthly?: boolean
): number | null => {
	return (
		getPlanDiscountedRawPrice( state, siteId, planObject.getStoreSlug(), { isMonthly } ) ||
		getPlanRawPrice( state, planObject.getProductId(), isMonthly )
	);
};
