/**
 * Internal dependencies
 */
import type {
	PurchasableItem,
	PurchasableItemDecorator,
} from 'calypso/lib/jetpack/experiment/purchasable-items/types';

const selectors = {
	isOwned: (/* state: AppState */) => true,
	getBillingAmount: (/* state: AppState */) => 0,
};

export type SelectableItem = PurchasableItem & typeof selectors;

export const withSelectors: PurchasableItemDecorator< SelectableItem > = (
	item: PurchasableItem
) => {
	return { ...item, ...selectors };
};
