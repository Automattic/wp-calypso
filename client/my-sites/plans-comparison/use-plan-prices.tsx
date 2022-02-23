import { TYPE_FREE, TYPE_FLEXIBLE } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import { getPlanRawPrice, getDiscountedRawPrice } from 'calypso/state/plans/selectors';
import {
	getPlanDiscountedRawPrice,
	getSitePlanRawPrice,
} from 'calypso/state/sites/plans/selectors';
import type { WPComPlan } from '@automattic/calypso-products';

export interface PlanPrices {
	price: number;
	originalPrice?: number;
}

export function usePlanPrices( plan: WPComPlan, siteId?: number ): PlanPrices {
	const productSlug = plan.getStoreSlug();
	const productId = plan.getProductId();
	const [ price, discountPrice ] = useSelector( ( state ) => {
		if ( plan.type === TYPE_FREE || plan.type === TYPE_FLEXIBLE ) {
			return [ 0 ];
		}

		return [
			siteId
				? getSitePlanRawPrice( state, siteId, productSlug )
				: getPlanRawPrice( state, productId ),
			siteId
				? getPlanDiscountedRawPrice( state, siteId, productSlug )
				: getDiscountedRawPrice( state, productId ),
		];
	} );

	if ( ! discountPrice ) {
		return { price };
	}

	return {
		price: discountPrice,
		originalPrice: price,
	};
}
