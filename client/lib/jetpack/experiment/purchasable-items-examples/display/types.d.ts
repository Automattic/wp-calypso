/**
 * External dependencies
 */
import type { TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import type { AppState } from 'calypso/types';
import type { PurchasableItem } from 'calypso/lib/jetpack/experiment/purchasable-items/types';

export interface DisplayableItemFeature {
	slug: string;
	iconSlug: string;
	title: TranslateResult;
	description: TranslateResult;
	shouldHighlight: boolean;
}

export interface DisplayableItemProperties {
	iconSlug: string;
	displayName: TranslateResult;
	shortName: TranslateResult;
	getTagline: ( state: AppState ) => TranslateResult;
	callToAction: TranslateResult;
	description: TranslateResult;
	features: DisplayableItemFeature[];
}

export type DisplayableItem = PurchasableItem & DisplayableItemProperties;
