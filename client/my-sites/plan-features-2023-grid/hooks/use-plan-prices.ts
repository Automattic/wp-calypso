import {
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
	TERM_TRIENNIALLY,
} from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import { getPlanRawPrice, getDiscountedRawPrice } from 'calypso/state/plans/selectors';
import type { Plan } from '@automattic/calypso-products';

export interface PlanPrices {
	price: number;
	originalPrice?: number;
}

function toMonthlyPrice( plan: Plan ) {
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

export default function usePlanPrices( plans: Plan[] ): PlanPrices[] {
	return useSelector( ( state ) => {
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
