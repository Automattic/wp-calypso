import 'calypso/state/plans/init';
import { getPlan, PlanSlug } from '@automattic/calypso-products';
import { createSelector } from '@automattic/state-utils';
import { getPlanDiscountedRawPrice, getPlansBySiteId } from 'calypso/state/sites/plans/selectors';
import { getDiscountedRawPrice } from './get-discounted-raw-price';
import { getPlanRawPrice } from './get-plan-raw-price';
import type { AppState, SiteId } from 'calypso/types';

export interface PlanPrices {
	rawPrice: number | null;
	discountedRawPrice: number | null; // discounted on yearly-monthly conversion
	planDiscountedRawPrice: number | null; // discounted on site plan upgrade
}

/**
 * A convenience function that returns the undiscounted and discounted prices
 * for a given plan and site.
 */
export const getPlanPrices = createSelector(
	(
		state: AppState,
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
	): PlanPrices => {
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
	},
	( state: AppState, { siteId } ) => [
		getPlansBySiteId( state, siteId ?? undefined ), // consumed by getPlanDiscountedRawPrice
		state.plans?.items, // consumed by getPlanRawPrice, getDiscountedRawPrice
	],
	( state: AppState, { planSlug, siteId, returnMonthly, returnSmallestUnit } ) =>
		planSlug + siteId + returnMonthly + returnSmallestUnit
);
