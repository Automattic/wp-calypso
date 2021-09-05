import { getPlan, findPlansKeys, TYPE_PERSONAL } from '@automattic/calypso-products';

import 'calypso/state/purchases/init';

export const getDowngradePlanFromPurchase = ( purchase ) => {
	const plan = getPlan( purchase.productSlug );
	if ( ! plan ) {
		return null;
	}

	const newPlanKeys = findPlansKeys( {
		group: plan.group,
		type: TYPE_PERSONAL,
		term: plan.term,
	} );

	return getPlan( newPlanKeys[ 0 ] );
};
