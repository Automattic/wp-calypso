import 'calypso/state/plans/init';
import { getPlan, PlanSlug } from '@automattic/calypso-products';
import { createSelector } from '@automattic/state-utils';
import { getPlanDiscountedRawPrice, getPlansBySiteId } from 'calypso/state/sites/plans/selectors';
import { getDiscountedRawPrice } from './get-discounted-raw-price';
import { getPlanRawPrice } from './get-plan-raw-price';
import type { SiteId, AppState } from 'calypso/types';

export interface PlanPrices {
	rawPrice: number | null;
	discountedRawPrice: number | null; // discounted on yearly-monthly conversion
	planDiscountedRawPrice: number | null; // discounted on site plan upgrade
}

interface PlanPricesIndex {
	[ planSlug: string ]: PlanPrices;
}
/**
 * A convenience function that returns the undiscounted and discounted prices
 * for a given set of plans and site.
 */
export const getPlanPrices = createSelector(
	(
		state: AppState,
		{
			planSlugs,
			siteId,
			returnMonthly,
			returnSmallestUnit,
		}: {
			planSlugs: PlanSlug[];
			siteId?: SiteId | null;
			returnMonthly: boolean;
			returnSmallestUnit?: boolean;
		}
	): PlanPricesIndex => {
		return planSlugs.reduce( ( acc, planSlug ) => {
			const plan = getPlan( planSlug );
			const productId = plan?.getProductId();

			return {
				...acc,
				[ planSlug ]: {
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
				},
			};
		}, {} as PlanPricesIndex );
	},
	( state: AppState, { planSlugs, siteId, returnMonthly, returnSmallestUnit } ) => [
		getPlansBySiteId( state, siteId ?? undefined ), // consumed by getPlanDiscountedRawPrice
		state.plans?.items, // consumed by getPlanRawPrice, getDiscountedRawPrice
		planSlugs,
		returnMonthly,
		returnSmallestUnit,
	]
);
