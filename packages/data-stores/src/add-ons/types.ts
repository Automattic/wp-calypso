import { TranslateResult } from 'i18n-calypso';
import { STORAGE_ADD_ONS, ADD_ONS } from './constants';
import type { StoreProductSlug } from '../products-list';

export interface AddOnMeta {
	addOnSlug: AddOnSlug;
	productSlug: StoreProductSlug;
	featureSlugs?: string[] | null;
	icon?: JSX.Element;
	featured?: boolean; // used to display the popular badge in the add-ons grid
	name?: TranslateResult; // when the name is optional, it will be filled by the product list data
	description?: TranslateResult; // same as the above.
	displayCost?: TranslateResult;
	purchased?: boolean;
	isLoading?: boolean;
	prices?: {
		monthlyPrice: number;
		yearlyPrice: number;
		formattedMonthlyPrice: string;
		formattedYearlyPrice: string;
		currencyCode: string;
	} | null;
	quantity?: number; // used for determining checkout costs for quantity based products
	checkoutLink?: string;
}

export type AddOnSlug = ( typeof ADD_ONS )[ number ];
export type StorageAddOnSlug = ( typeof STORAGE_ADD_ONS )[ number ];
