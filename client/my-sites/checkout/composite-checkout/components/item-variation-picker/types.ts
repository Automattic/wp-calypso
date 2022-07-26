import type { ResponseCartProduct } from '@automattic/shopping-cart';

export type WPCOMProductSlug = string;

export type WPCOMProductVariant = {
	currentPrice: number;
	currentPricePerMonth: number;
	termIntervalInMonths: number;
	currency: string;
	productId: number;
	productSlug: WPCOMProductSlug;
	variantLabel: string;
};

export type ItemVariationPickerProps = {
	selectedItem: ResponseCartProduct;
	onChangeItemVariant: OnChangeItemVariant;
	isDisabled: boolean;
	siteId: number | undefined;
	productSlug: string;
	isLoading?: boolean;
};

export type OnChangeItemVariant = (
	uuid: string,
	productSlug: WPCOMProductSlug,
	productId: number
) => void;
