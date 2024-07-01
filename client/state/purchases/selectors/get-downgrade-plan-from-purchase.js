import { getPlan, findPlansKeys, TYPE_PERSONAL } from '@automattic/calypso-products';

// TODO clk: is this needed? confirm
import 'calypso/state/purchases/init';

// TODO: clk: rename to getDowngradePlan and pass planSlug
export const getDowngradePlanFromPurchase = ( purchase ) => {
	// TODO clk: purchase.productSlug is the planSlug
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
