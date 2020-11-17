/**
 * Internal dependencies
 */
import { BillingTerm, DailyRealtimeOption, ItemType } from './attributes';

export * from './attributes';

export type PurchasableItemAttributes = {
	itemType: ItemType;
	family: string;
	billingTerm: BillingTerm;
	dailyOrRealtime?: DailyRealtimeOption;
};

export type PurchasableItemDecorator< I extends PurchasableItem > = ( item: PurchasableItem ) => I;

export type PurchasableItem = Readonly< {
	slug: string;
	attributes: PurchasableItemAttributes;
} >;

export type PurchasableProduct = PurchasableItem;

export interface PurchasableBundle extends PurchasableItem {
	includedProducts: Readonly< PurchasableItem[] >;
}

export interface PurchasableLegacyPlan extends PurchasableBundle {
	productId: Readonly< number >;
}
