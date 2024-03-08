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
	id: string;
	selectedItem: ResponseCartProduct;
	onChangeItemVariant: OnChangeItemVariant;
	isDisabled: boolean;
	isLoading?: boolean;
	variants: WPCOMProductVariant[];
	toggle: ( id: string | null ) => void;
	isOpen: boolean;
};

export type OnChangeItemVariant = (
	uuid: string,
	productSlug: WPCOMProductSlug,
	productId: number,
	volume?: number
) => void;

export type CurrentOptionProps = {
	open: boolean;
	shouldUseCheckoutV2: boolean;
};

export type OptionProps = {
	selected: boolean;
	shouldUseCheckoutV2: boolean;
};
