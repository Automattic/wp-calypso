import { useMemo } from '@wordpress/element';
import type { GridPlan } from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

type PricingInfo = {
	prices: number[];
	currencyCode?: string;
};

export function usePlanPricingInfoFromGridPlans( {
	gridPlans,
	returnMonthly = true,
}: {
	gridPlans: GridPlan[];
	returnMonthly?: boolean;
} ) {
	return useMemo(
		() =>
			gridPlans.reduce(
				( acc: PricingInfo, gridPlan ) => {
					const {
						pricing: { originalPrice, discountedPrice, currencyCode },
					} = gridPlan;

					const originalPriceForTerm = originalPrice[ returnMonthly ? 'monthly' : 'full' ] || 0;
					const discountedPriceForTerm = discountedPrice[ returnMonthly ? 'monthly' : 'full' ] || 0;

					return {
						prices: [ ...acc.prices, originalPriceForTerm, discountedPriceForTerm ],
						...( currencyCode && { currencyCode } ),
					};
				},
				{ prices: [], currencyCode: 'USD' }
			),
		[ gridPlans, returnMonthly ]
	);
}
