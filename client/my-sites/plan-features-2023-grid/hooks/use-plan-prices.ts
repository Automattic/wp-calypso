import {
	PlanSlug,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
	TERM_TRIENNIALLY,
} from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import { getPlanRawPrice, getDiscountedRawPrice } from 'calypso/state/plans/selectors';
import { getPlanDiscountedRawPrice } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { Plan } from '@automattic/calypso-products';

export interface PlanPrices {
	rawPrice: number;
	discountedRawPrice: number;
	planDiscountedRawPrice: number;
}

interface Props {
	plans: Plan[];
	currentPlanSlug?: PlanSlug;
	monthly?: boolean;
}

function toMonthlyPrice( plan: Plan ) {
	return ( yearlyPrice?: number | null ) => {
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

const usePlanPrices = ( { plans, currentPlanSlug, monthly = true }: Props ): PlanPrices[] => {
	return useSelector( ( state ) => {
		const siteId = getSelectedSiteId( state ) ?? undefined;

		return plans.map( ( plan ) => {
			const productId = plan.getProductId();
			const [ rawPrice, discountedRawPrice, planDiscountedRawPrice ] = [
				getPlanRawPrice( state, productId ),
				getDiscountedRawPrice( state, productId ),
				...( currentPlanSlug
					? [ getPlanDiscountedRawPrice( state, siteId, currentPlanSlug, { isMonthly: monthly } ) ]
					: [] ),
			].map( monthly ? toMonthlyPrice( plan ) : ( price ) => price );

			return {
				rawPrice: rawPrice ?? 0,
				discountedRawPrice: discountedRawPrice ?? 0,
				planDiscountedRawPrice: planDiscountedRawPrice ?? 0,
			};
		} );
	} );
};

export default usePlanPrices;
