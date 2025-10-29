import * as React from 'react';

type StoreProductSlug = string;

// This type represents things that React can render, but which also exist. (E.g.
// not nullable, not undefined, etc.)
type ExistingReactNode = React.ReactElement | string | number;
// Translate hooks, like component interpolation or highlighting untranslated strings,
// force us to declare the return type as a generic React node, not as just string.
type TranslateResult = ExistingReactNode;

//used
export type AddOnSlug = string[][ number ];
//used
export type StorageAddOnSlug = string[][ number ];

//used
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
