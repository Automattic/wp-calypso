import { TranslateResult } from 'i18n-calypso';

export interface AddOnMeta {
	productSlug: string;
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
