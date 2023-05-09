import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import { getDowngradePlanToMonthlyFromPurchase } from './get-downgrade-plan-to-monthly-from-purchase';

import 'calypso/state/purchases/init';

export const getDowngradePlanToMonthlyRawPrice = ( state, purchase ) => {
	const plan = getDowngradePlanToMonthlyFromPurchase( purchase );
	if ( ! plan ) {
		return null;
	}
	return getPlanRawPrice( state, plan.getProductId() );
};
