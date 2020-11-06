/**
 * Internal dependencies
 */
import type {
	PurchaseableItem,
	PurchaseableItemDecorator,
} from 'calypso/lib/jetpack/experiment/purchaseable-items/types';

const selectors = {
	isOwned: (/* state: AppState */) => true,
	getBillingAmount: (/* state: AppState */) => 0,
};

export type SelectableItem = PurchaseableItem & typeof selectors;

export const withSelectors: PurchaseableItemDecorator< SelectableItem > = (
	item: PurchaseableItem
) => {
	return { ...item, ...selectors };
};
