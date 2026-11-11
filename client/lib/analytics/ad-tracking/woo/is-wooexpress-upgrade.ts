import {
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	isEcommercePlan,
	isWooExpressPlan,
} from '@automattic/calypso-products';
import type { Receipt, ReceiptItem } from '@automattic/api-core';

/**
 * Checks whether the upgrade item is valid for upsell tracking.
 * There may be more conditions, for now it's just checking whether
 * it's any ecommerce plan.
 */
export const isValidWooExpressUpsell = ( item: ReceiptItem ): boolean => {
	return isEcommercePlan( item.wpcom_product_slug ) || isWooExpressPlan( item.wpcom_product_slug );
};

/**
 * Checks if the receipt contains an upgrade to a valid ecommerce plan from a
 * Woo Express trial.
 */
export const isWooExpressUpgrade = ( receipt: Receipt ): boolean => {
	return receipt.items.some(
		( item ) =>
			item.previous_plan_slug === PLAN_ECOMMERCE_TRIAL_MONTHLY && isValidWooExpressUpsell( item )
	);
};
