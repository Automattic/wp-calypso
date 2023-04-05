import { getPlan, PlanSlug } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import { getPlanRawPrice, getDiscountedRawPrice } from 'calypso/state/plans/selectors';
import { getPlanDiscountedRawPrice } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { IAppState } from 'calypso/state/types';

export interface PlanPrices {
	rawPrice: number;
	discountedRawPrice: number; // discounted on yearly-monthly conversion
	planDiscountedRawPrice: number; // discounted on site plan upgrade
}

interface Props {
	planSlug: PlanSlug;
	returnMonthly: boolean; // defaults to true
}

const usePlanPrices = ( { planSlug, returnMonthly }: Props ): PlanPrices => {
	return useSelector( ( state: IAppState ) => {
		const siteId = getSelectedSiteId( state ) ?? undefined;
		const plan = getPlan( planSlug );
		const productId = plan?.getProductId();

		return {
			rawPrice: ( productId && getPlanRawPrice( state, productId, returnMonthly ) ) || 0,
			discountedRawPrice:
				( productId && getDiscountedRawPrice( state, productId, returnMonthly ) ) || 0,
			planDiscountedRawPrice:
				( siteId &&
					planSlug &&
					getPlanDiscountedRawPrice( state, siteId, planSlug, { returnMonthly } ) ) ||
				0,
		};
	} );
};

export default usePlanPrices;
