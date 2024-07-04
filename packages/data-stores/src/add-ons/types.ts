import { TranslateResult } from 'i18n-calypso';
import { STORAGE_ADD_ONS } from './constants';
import type { StoreProductSlug } from '../products-list';

export interface AddOnMeta {
	productSlug: StoreProductSlug;
	featureSlugs?: string[] | null;
	icon: JSX.Element;
	featured?: boolean; // used to display the popular badge in the add-ons grid
	name: string | null;
	quantity?: number; // used for determining checkout costs for quantity based products
	description: string | null;
	displayCost: TranslateResult | null;
	purchased?: boolean;
	isLoading?: boolean;
	prices?: {
		monthlyPrice: number;
		yearlyPrice: number;
		formattedMonthlyPrice: string;
		formattedYearlyPrice: string;
	} | null;
	checkoutLink?: string;
	exceedsSiteStorageLimits?: boolean;
}

export type StorageAddOnSlug = ( typeof STORAGE_ADD_ONS )[ number ];
