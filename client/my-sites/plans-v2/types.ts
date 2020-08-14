/**
 * Internal dependencies
 */
import { ALL, PERFORMANCE, SECURITY, PRODUCTS_WITH_OPTIONS } from './constants';

/**
 * Type dependencies
 */
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';
import type { TERM_ANNUALLY, TERM_MONTHLY } from 'lib/plans/constants';

export type Duration = typeof TERM_ANNUALLY | typeof TERM_MONTHLY;
export type DurationString = 'annual' | 'monthly';
export type ProductType = typeof ALL | typeof PERFORMANCE | typeof SECURITY;
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
};

export interface SelectorProduct extends SelectorProductCost {
	productSlug: string;
	iconSlug: string;
	costProductSlug?: string;
	monthlyProductSlug?: string;
	displayName: TranslateResult;
	tagline: TranslateResult;
	description: TranslateResult | ReactNode;
	term: Duration;
	buttonLabel?: TranslateResult;
	features: string[];
	subtypes: string[];
	owned?: boolean;
	legacy?: boolean;
}

export interface AvailableProductData {
	product_slug: string;
	cost: number;
}
