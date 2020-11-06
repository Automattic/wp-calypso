/**
 * Internal dependencies
 */
import { BillingTerm, DailyRealtimeOption, ItemType } from './attributes';

export * from './attributes';

export type PurchaseableItemAttributes = {
	itemType: ItemType;
	family: string;
	billingTerm: BillingTerm;
	dailyOrRealtime?: DailyRealtimeOption;
};

export type PurchaseableItemDecorator< I extends PurchaseableItem > = (
	item: PurchaseableItem
) => I;

export type PurchaseableItem = Readonly< {
	slug: string;
	attributes: PurchaseableItemAttributes;
} >;

export type PurchaseableProduct = PurchaseableItem;

export interface PurchaseableBundle extends PurchaseableItem {
	includedProducts: Readonly< PurchaseableItem[] >;
}

export interface PurchaseableLegacyPlan extends PurchaseableBundle {
	productId: Readonly< number >;
}
