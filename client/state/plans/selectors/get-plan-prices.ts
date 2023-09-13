import 'calypso/state/plans/init';
import { getPlan, PlanSlug } from '@automattic/calypso-products';
import { getPlanDiscountedRawPrice } from 'calypso/state/sites/plans/selectors';
import { getDiscountedRawPrice } from './get-discounted-raw-price';
import { getPlanRawPrice } from './get-plan-raw-price';
import type { IAppState } from 'calypso/state/types';
import type { SiteId } from 'calypso/types';

export interface PlanPrices {
	rawPrice: number | null;
	discountedRawPrice: number | null; // discounted on yearly-monthly conversion
	planDiscountedRawPrice: number | null; // discounted on site plan upgrade
}

/**
 * A convenience function that returns the undiscounted and discounted prices
 * for a given plan and site.
 */
export function getPlanPrices(
	state: IAppState,
	{
		planSlug,
		siteId,
		returnMonthly,
		returnSmallestUnit,
	}: {
		planSlug: PlanSlug;
		siteId: SiteId | null;
		returnMonthly: boolean;
		returnSmallestUnit?: boolean;
	}
): PlanPrices {
	const plan = getPlan( planSlug );
	const productId = plan?.getProductId();

	return {
		rawPrice: productId
			? getPlanRawPrice( state, productId, returnMonthly, returnSmallestUnit )
			: null,
		discountedRawPrice: productId
			? getDiscountedRawPrice( state, productId, returnMonthly, returnSmallestUnit )
			: null,
		planDiscountedRawPrice:
			siteId && planSlug
				? getPlanDiscountedRawPrice( state, siteId, planSlug, {
						returnMonthly,
						returnSmallestUnit,
				  } )
				: null,
	};
}
