import type { ResponseCartProduct } from '@automattic/shopping-cart';

export type WPCOMProductSlug = string;

export type WPCOMProductVariant = {
	price: number;
	pricePerMonth: number;
	termIntervalInMonths: number;
	termIntervalInDays: number;
	currency: string;
	productId: number;
	productSlug: WPCOMProductSlug;
	variantLabel: string;
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
	productId: number
) => void;
