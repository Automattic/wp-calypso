/**
 * Internal dependencies
 */

/**
 * Type dependencies
 */

import type { TranslateResult } from 'i18n-calypso';

export type ProductCardFeaturesItem = {
	icon?: string;
	text: TranslateResult;
	description?: TranslateResult;
	subitems?: ProductCardFeaturesItem[];
};

export type ProductCardFeaturesSection = {
	heading: TranslateResult;
	list: ProductCardFeaturesItem[];
};

export type ProductCardFeaturesItems = ProductCardFeaturesItem[] | ProductCardFeaturesSection[];

export type ProductCardFeaturesLink = {
	url: string;
	label: TranslateResult;
};

export type ProductCardFeatures = {
	items: ProductCardFeaturesItems;
	more?: ProductCardFeaturesLink;
};
