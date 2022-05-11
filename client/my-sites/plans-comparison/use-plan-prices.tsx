import { useSelector } from 'react-redux';
import { getPlanRawPrice, getDiscountedRawPrice } from 'calypso/state/plans/selectors';
import type { WPComPlan } from '@automattic/calypso-products';
export interface PlanPrices {
	price: number;
	originalPrice?: number;
}

function toMonthlyPrice( yearlyPrice: number ) {
	return yearlyPrice ? yearlyPrice / 12 : 0;
}

export default function usePlanPrices( plans: WPComPlan[] ): PlanPrices[] {
	return useSelector( ( state ) => {
		return plans.map( ( plan ) => {
			const productId = plan.getProductId();
			const [ price, discountPrice ] = [
				getPlanRawPrice( state, productId ),
				getDiscountedRawPrice( state, productId ),
			].map( toMonthlyPrice );

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
