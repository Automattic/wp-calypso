import {
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
	TERM_TRIENNIALLY,
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
			case TERM_ANNUALLY:
				return yearlyPrice / 12;
			case TERM_BIENNIALLY:
				return yearlyPrice / 24;
			case TERM_TRIENNIALLY:
				return yearlyPrice / 36;
			case TERM_MONTHLY:
				return yearlyPrice;
		}
	};
}

/**
 * @deprecated
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
