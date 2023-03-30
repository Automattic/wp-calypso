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
 */
export const getPlanPrice = (
	state: AppState,
	siteId: number | undefined,
	planObject: Pick< PlanObject, 'getStoreSlug' | 'getProductId' >,

	/**
	 * If true, attempt to calculate and return the monthly price. Note that this
	 * is not precise as it relies on float division and could have rounding
	 * errors.
	 */
	returnMonthly?: boolean
): number | null => {
	return (
		getPlanDiscountedRawPrice( state, siteId, planObject.getStoreSlug(), {
			isMonthly: returnMonthly,
		} ) || getPlanRawPrice( state, planObject.getProductId(), returnMonthly )
	);
};
