import { TYPE_FREE, TYPE_FLEXIBLE } from '@automattic/calypso-products';
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

export function usePlanPrices( plan: WPComPlan ): PlanPrices {
	const productId = plan.getProductId();
	const [ price, discountPrice ] = useSelector( ( state ) => {
		if ( plan.type === TYPE_FREE || plan.type === TYPE_FLEXIBLE ) {
			return [ 0 ];
		}

		return [ getPlanRawPrice( state, productId ), getDiscountedRawPrice( state, productId ) ].map(
			toMonthlyPrice
		);
	} );

	if ( ! discountPrice ) {
		return { price };
	}

	return {
		price: discountPrice,
		originalPrice: price,
	};
}
