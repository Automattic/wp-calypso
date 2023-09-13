import {
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
	TERM_TRIENNIALLY,
	TERM_QUADRENNIALLY,
	TERM_QUINQUENNIALLY,
	TERM_SEXENNIALLY,
	TERM_SEPTENNIALLY,
	TERM_OCTENNIALLY,
	TERM_NOVENNIALLY,
	TERM_DECENNIALLY,
	TERM_CENTENNIALLY,
} from '@automattic/calypso-products';
import { useSelector } from 'calypso/state';
import { getPlanRawPrice, getDiscountedRawPrice } from 'calypso/state/plans/selectors';
import type { WPComPlan } from '@automattic/calypso-products';
import type { IAppState } from 'calypso/state/types';

export interface PlanPrices {
	price: number;
	originalPrice?: number;
}

function toMonthlyPrice( plan: WPComPlan ) {
	return ( yearlyPrice: number ) => {
		if ( ! yearlyPrice ) {
			return 0;
		}

		switch ( plan.term ) {
			case TERM_MONTHLY:
				return yearlyPrice;
			case TERM_ANNUALLY:
				return yearlyPrice / 12;
			case TERM_BIENNIALLY:
				return yearlyPrice / 24;
			case TERM_TRIENNIALLY:
				return yearlyPrice / 36;
			case TERM_QUADRENNIALLY:
				return yearlyPrice / 48;
			case TERM_QUINQUENNIALLY:
				return yearlyPrice / 60;
			case TERM_SEXENNIALLY:
				return yearlyPrice / 72;
			case TERM_SEPTENNIALLY:
				return yearlyPrice / 84;
			case TERM_OCTENNIALLY:
				return yearlyPrice / 96;
			case TERM_NOVENNIALLY:
				return yearlyPrice / 108;
			case TERM_DECENNIALLY:
				return yearlyPrice / 120;
			case TERM_CENTENNIALLY:
				return yearlyPrice / 1200;
		}
	};
}

/**
 * @deprecated use the hook at client/my-sites/plans/hooks/use-plan-prices.tsx#usePlanPrices instead.
 */
export default function usePlanPrices( plans: WPComPlan[] ): PlanPrices[] {
	return useSelector( ( state: IAppState ) => {
		return plans.map( ( plan ) => {
			const productId = plan.getProductId();
			const [ price, discountPrice ] = [
				getPlanRawPrice( state, productId ) ?? 0,
				getDiscountedRawPrice( state, productId ) ?? 0,
			].map( toMonthlyPrice( plan ) );

			if ( ! discountPrice ) {
				return { price };
			}

			return {
				price: discountPrice,
				originalPrice: price,
			};
		} );
	} );
}
