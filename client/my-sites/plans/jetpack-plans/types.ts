/* eslint-disable wpcalypso/import-docblock */
/**
 * Type dependencies
 */
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode, ReactElement } from 'react';
import type { TERM_ANNUALLY, TERM_MONTHLY } from 'calypso/lib/plans/constants';
import type { Purchase } from 'calypso/lib/purchases/types';
import type {
	ALL,
	PERFORMANCE,
	SECURITY,
	PRODUCTS_WITH_OPTIONS,
	ITEM_TYPE_PLAN,
	ITEM_TYPE_BUNDLE,
	ITEM_TYPE_PRODUCT,
} from './constants';

export type Duration = typeof TERM_ANNUALLY | typeof TERM_MONTHLY;
export type DurationString = 'annual' | 'monthly';
export type ProductType = typeof ALL | typeof PERFORMANCE | typeof SECURITY;
export type ItemType = typeof ITEM_TYPE_PLAN | typeof ITEM_TYPE_BUNDLE | typeof ITEM_TYPE_PRODUCT;

export interface QueryArgs {
	[ key: string ]: string;
}

export type PurchaseCallback = ( arg0: SelectorProduct, arg1?: boolean, arg2?: Purchase ) => void;
export type DurationChangeCallback = ( arg0: Duration ) => void;

interface BasePageProps {
	rootUrl: string;
	urlQueryArgs: QueryArgs;
	header: ReactNode;
	footer?: ReactNode;
}

export interface SelectorPageProps extends BasePageProps {
	defaultDuration?: Duration;
	siteSlug?: string;
}

export interface ProductsGridProps {
	duration: Duration;
	onSelectProduct: PurchaseCallback;
	urlQueryArgs: QueryArgs;
	onDurationChange?: DurationChangeCallback;
}

export interface JetpackFreeProps {
	urlQueryArgs: QueryArgs;
	siteId: number | null;
}

export type SelectorProductSlug = typeof PRODUCTS_WITH_OPTIONS[ number ];

export type SelectorProductCost = {
	cost?: number;
	discountCost?: number;
	loadingCost?: boolean;
};

export type SelectorProductFeaturesItem = {
	slug: string;
	icon?:
		| string
		| {
				icon: string;
				component?: ReactElement;
		  };
	text: TranslateResult;
	description?: TranslateResult;
	subitems?: SelectorProductFeaturesItem[];
	isHighlighted?: boolean;
};

export type SelectorProductFeaturesSection = {
	heading: TranslateResult;
	list: SelectorProductFeaturesItem[];
};

export type SelectorProductFeatures = {
	items: SelectorProductFeaturesItem[] | SelectorProductFeaturesSection[];
	more?: {
		url: string;
		label: TranslateResult;
	};
};

export interface SelectorProduct extends SelectorProductCost {
	productSlug: string;
	annualOptionSlug?: string;
	monthlyOptionSlug?: string;
	iconSlug: string;
	type: ItemType;
	costProductSlug?: string;
	monthlyProductSlug?: string;
	displayName: TranslateResult;
	shortName: TranslateResult;
	tagline: TranslateResult;
	description: TranslateResult | ReactNode;
	children?: ReactNode;
	term: Duration;
	buttonLabel?: TranslateResult;
	features: SelectorProductFeatures;
	subtypes: string[];
	legacy?: boolean;
	hidePrice?: boolean;
	externalUrl?: string;
	displayTerm?: Duration;
	displayPrice?: number;
	displayCurrency?: string;
}
