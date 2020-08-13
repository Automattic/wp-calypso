/* eslint-disable wpcalypso/import-docblock */
/**
 * Type dependencies
 */
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';
import type { TERM_ANNUALLY, TERM_MONTHLY } from 'lib/plans/constants';
import type {
	ALL,
	PERFORMANCE,
	SECURITY,
	PRODUCTS_WITH_OPTIONS,
	ITEM_TYPE_PLAN,
	ITEM_TYPE_BUNDLE,
	ITEM_TYPE_PRODUCT,
} from './constants';
import type { Features } from 'components/jetpack/card/jetpack-product-card/types';

export type Duration = typeof TERM_ANNUALLY | typeof TERM_MONTHLY;
export type DurationString = 'annual' | 'monthly';
export type ProductType = typeof ALL | typeof PERFORMANCE | typeof SECURITY;
export type ItemType = typeof ITEM_TYPE_PLAN | typeof ITEM_TYPE_BUNDLE | typeof ITEM_TYPE_PRODUCT;
export type PurchaseCallback = ( arg0: SelectorProduct ) => void;

interface BasePageProps {
	rootUrl: string;
}

export interface SelectorPageProps extends BasePageProps {
	defaultDuration?: Duration;
}

export interface DetailsPageProps extends BasePageProps {
	duration?: Duration;
	productSlug: string;
}

export interface UpsellPageProps extends BasePageProps {
	duration?: Duration;
	productSlug: string;
}

export type SelectorProductSlug = typeof PRODUCTS_WITH_OPTIONS[ number ];

export type SelectorProductCost = {
	cost?: number;
	discountCost?: number;
	loadingCost?: boolean;
};

export interface SelectorProduct extends SelectorProductCost {
	productSlug: string;
	iconSlug: string;
	type: ItemType;
	costProductSlug?: string;
	monthlyProductSlug?: string;
	displayName: TranslateResult;
	tagline: TranslateResult;
	description: TranslateResult | ReactNode;
	term: Duration;
	buttonLabel?: TranslateResult;
	features: Features;
	subtypes: string[];
	legacy?: boolean;
}

export interface AvailableProductData {
	product_slug: string;
	cost: number;
}
