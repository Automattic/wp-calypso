import { getPlan, findPlansKeys, TERM_MONTHLY } from '@automattic/calypso-products';

import 'calypso/state/purchases/init';

export const getDowngradePlanToMonthlyFromPurchase = ( purchase ) => {
	const plan = getPlan( purchase.productSlug );
	if ( ! plan ) {
		return null;
	}

	const newPlanKeys = findPlansKeys( {
		group: plan.group,
		type: plan.type,
		term: TERM_MONTHLY,
	} );

	return getPlan( newPlanKeys[ 0 ] );
};
