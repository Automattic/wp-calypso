/* eslint-disable wpcalypso/import-docblock */
/**
 * Type dependencies
 */
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode, ReactElement } from 'react';
import type { TERM_ANNUALLY, TERM_MONTHLY } from '@automattic/calypso-products';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { ITEM_TYPE_PLAN, ITEM_TYPE_PRODUCT } from './constants';
import type { PlanRecommendation } from './plan-upgrade/types';

export type Duration = typeof TERM_ANNUALLY | typeof TERM_MONTHLY;
export type DurationString = 'annual' | 'monthly';
export type ItemType = typeof ITEM_TYPE_PLAN | typeof ITEM_TYPE_PRODUCT;

export interface QueryArgs {
	[ key: string ]: string;
}

export type PurchaseCallback = ( arg0: SelectorProduct, arg1?: boolean, arg2?: Purchase ) => void;
export type DurationChangeCallback = ( arg0: Duration ) => void;
export type ScrollCardIntoViewCallback = ( arg0: HTMLDivElement, arg1: string ) => void;

interface BasePageProps {
	rootUrl: string;
	urlQueryArgs: QueryArgs;
	header: ReactNode;
	footer?: ReactNode;
}

export interface SelectorPageProps extends BasePageProps {
	defaultDuration?: Duration;
	siteSlug?: string;
	planRecommendation?: PlanRecommendation;
	highlightedProducts?: string[];
}

export interface ProductsGridProps {
	duration: Duration;
	urlQueryArgs: QueryArgs;
	planRecommendation?: PlanRecommendation;
	onSelectProduct: PurchaseCallback;
	onDurationChange?: DurationChangeCallback;
	scrollCardIntoView: ScrollCardIntoViewCallback;
}

export type PlanGridProducts = {
	availableProducts: SelectorProduct[];
	purchasedProducts: SelectorProduct[];
	includedInPlanProducts: SelectorProduct[];
};

export interface JetpackFreeProps {
	urlQueryArgs: QueryArgs;
	siteId: number | null;
}

export type SelectorProductCost = {
	isFree?: boolean;
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
	infoText?: TranslateResult | ReactNode;
	legacy?: boolean;
	hidePrice?: boolean;
	externalUrl?: string;
	displayTerm?: Duration;
	displayPrice?: number;
	displayCurrency?: string;
	displayFrom?: boolean;
	belowPriceText?: TranslateResult;
}

export type SiteProduct = {
	tierUsage: number;
};
