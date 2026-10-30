import type { PlanProduct, Purchase } from '@automattic/api-core';

export const getDowngradePlanForPurchase = (
	plans: PlanProduct[],
	purchase: Purchase,
	upsell: string | undefined
): PlanProduct | undefined => {
	if ( ! plans ) {
		return;
	}
	const plan = plans.find( ( plan ) => plan.product_id === purchase.product_id );
	if ( ! plan ) {
		return;
	}

	let downgradePlanInfo;
	switch ( upsell ) {
		case 'downgrade-monthly':
			downgradePlanInfo = plan.downgrade_paths.find( ( path ) => {
				return path.bill_period !== plan.bill_period;
			} );
			break;
		case 'downgrade-personal':
			downgradePlanInfo = plan.downgrade_paths.find( ( path ) => {
				return path.bill_period === plan.bill_period;
			} );
			break;
	}
	if ( downgradePlanInfo ) {
		return plans.find( ( plan ) => plan.product_id === downgradePlanInfo.product_id );
	}
};
