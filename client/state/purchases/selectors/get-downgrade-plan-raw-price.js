/**
 * Internal Dependencies
 */
import { getPlanRawPrice } from 'state/plans/selectors';
import { getDowngradePlanFromPurchase } from './get-downgrade-plan-from-purchase';

import 'state/purchases/init';

export const getDowngradePlanRawPrice = ( state, purchase ) => {
	const plan = getDowngradePlanFromPurchase( purchase );
	if ( ! plan ) {
		return null;
	}
	return getPlanRawPrice( state, plan.getProductId() );
};
