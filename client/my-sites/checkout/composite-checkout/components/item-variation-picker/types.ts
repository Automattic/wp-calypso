import type { ResponseCartProduct } from '@automattic/shopping-cart';

export type WPCOMProductSlug = string;

export type WPCOMProductVariant = {
	discountPercentage: number;
	formattedCurrentPrice: string | null;
	formattedPriceBeforeDiscount: string | null;
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
	type?: 'buttons' | 'dropdown';
};

export type OnChangeItemVariant = (
	uuid: string,
	productSlug: WPCOMProductSlug,
	productId: number
) => void;
