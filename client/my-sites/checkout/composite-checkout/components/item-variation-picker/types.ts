import type { ResponseCartProduct } from '@automattic/shopping-cart';

export type WPCOMProductSlug = string;

export type WPCOMProductVariant = {
	priceInteger: number;
	termIntervalInMonths: number;
	termIntervalInDays: number;
	currency: string;
	productId: number;
	productSlug: WPCOMProductSlug;
	variantLabel: string;
	introductoryTerm: string;
	introductoryInterval: number;
	priceBeforeDiscounts: number;
	productBillingTermInMonths: number;
	volume?: number;
};

export type ItemVariationPickerProps = {
	selectedItem: ResponseCartProduct;
	onChangeItemVariant: OnChangeItemVariant;
	isDisabled: boolean;
	isLoading?: boolean;
	variants: WPCOMProductVariant[];
};

export type OnChangeItemVariant = (
	uuid: string,
	productSlug: WPCOMProductSlug,
	productId: number,
	volume?: number
) => void;
