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
export type ProductType = typeof ALL | typeof PERFORMANCE | typeof SECURITY;
export type PurchaseCallback = ( arg0: string ) => null;

export interface SelectorPageProps {
	defaultDuration?: Duration;
}

export interface DetailsPageProps {
	duration?: Duration;
	productType: string;
}

export interface UpsellPageProps {
	duration: Duration;
	productSlug: string;
}

export type SelectorProductSlug = typeof PRODUCTS_WITH_OPTIONS[ number ];

export interface SelectorProduct {
	productSlug: string;
	iconSlug: string;
	costProductSlug?: string;
	displayName: TranslateResult;
	tagline: TranslateResult;
	description: TranslateResult | ReactNode;
	term: Duration;
	buttonLabel?: TranslateResult;
	features: string[];
	subtypes?: string[];
}
