import { TranslateResult } from 'i18n-calypso';
import { STORAGE_ADD_ONS, ADD_ONS, PLUGIN_ADD_ONS, WOO_BUNDLE_PLUGIN_SLUGS } from './constants';
import type { StoreProductSlug } from '../products-list';
import type { JSX } from 'react';

interface AddOnMetaBase {
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

export interface AddOnMeta extends AddOnMetaBase {
	addOnSlug: AddOnSlug;
	productSlug: StoreProductSlug;
	pluginSlug?: never;
}

/**
 * An add-on that the site's plan includes as a plugin to install. It has no store product,
 * so it has no price and no checkout link.
 */
export interface PluginAddOnMeta extends AddOnMetaBase {
	addOnSlug: PluginAddOnSlug;
	pluginSlug: BundlePluginSlug;
	productSlug?: never;
}

export type AnyAddOnMeta = AddOnMeta | PluginAddOnMeta;

export const isPluginAddOn = ( addOn: AnyAddOnMeta ): addOn is PluginAddOnMeta =>
	!! addOn.pluginSlug;

export type AddOnSlug = ( typeof ADD_ONS )[ number ];
export type StorageAddOnSlug = ( typeof STORAGE_ADD_ONS )[ number ];
export type PluginAddOnSlug = ( typeof PLUGIN_ADD_ONS )[ number ];
export type BundlePluginSlug = ( typeof WOO_BUNDLE_PLUGIN_SLUGS )[ number ];
