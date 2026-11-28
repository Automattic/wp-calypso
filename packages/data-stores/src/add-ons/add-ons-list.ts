import {
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_1GB_SPACE,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	WPCOM_FEATURES_CUSTOM_DESIGN,
} from '@automattic/calypso-products';
import i18n from 'i18n-calypso';
import {
	ADD_ON_350GB_STORAGE,
	ADD_ON_300GB_STORAGE,
	ADD_ON_250GB_STORAGE,
	ADD_ON_200GB_STORAGE,
	ADD_ON_150GB_STORAGE,
	ADD_ON_100GB_STORAGE,
	ADD_ON_50GB_STORAGE,
	ADD_ON_CUSTOM_DESIGN,
	ADD_ON_UNLIMITED_THEMES,
	ADD_ON_WOOCOMMERCE_BOOKINGS,
	ADD_ON_WOOCOMMERCE_SUBSCRIPTIONS,
	WOO_BUNDLE_EXTENSIONS_FEATURE,
} from './constants';
import customDesignIcon from './icons/custom-design';
import spaceUpgradeIcon from './icons/space-upgrade';
import unlimitedThemesIcon from './icons/unlimited-themes';
import woocommerceBookingsIcon from './icons/woocommerce-bookings';
import woocommerceSubscriptionsIcon from './icons/woocommerce-subscriptions';
import type { AddOnMeta, AddOnSlug, PluginAddOnMeta } from './types';

const defaultAddOns: AddOnMeta[] = [
	{
		addOnSlug: ADD_ON_UNLIMITED_THEMES,
		productSlug: PRODUCT_WPCOM_UNLIMITED_THEMES,
		featureSlugs: [ WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED ] as string[],
		icon: unlimitedThemesIcon,
		featured: true,
	},
	{
		addOnSlug: ADD_ON_CUSTOM_DESIGN,
		productSlug: PRODUCT_WPCOM_CUSTOM_DESIGN,
		featureSlugs: [ WPCOM_FEATURES_CUSTOM_DESIGN ] as string[],
		icon: customDesignIcon,
	},
	{
		addOnSlug: ADD_ON_50GB_STORAGE,
		productSlug: PRODUCT_1GB_SPACE,
		featureSlugs: null,
		icon: spaceUpgradeIcon,
		quantity: 50,
		name: i18n.translate( '50 GB Storage' ),
		description: i18n.translate(
			'Make more space for high-quality photos, videos, and other media. '
		),
	},
	{
		addOnSlug: ADD_ON_100GB_STORAGE,
		productSlug: PRODUCT_1GB_SPACE,
		featureSlugs: null,
		icon: spaceUpgradeIcon,
		quantity: 100,
		name: i18n.translate( '100 GB Storage' ),
		description: i18n.translate(
			'Take your site to the next level. Store all your media in one place without worrying about running out of space.'
		),
	},
	{
		addOnSlug: ADD_ON_150GB_STORAGE,
		productSlug: PRODUCT_1GB_SPACE,
		featureSlugs: null,
		icon: spaceUpgradeIcon,
		quantity: 150,
		name: i18n.translate( '%d GB Storage', { args: [ 150 ] } ),
	},
	{
		addOnSlug: ADD_ON_200GB_STORAGE,
		productSlug: PRODUCT_1GB_SPACE,
		featureSlugs: null,
		icon: spaceUpgradeIcon,
		quantity: 200,
		name: i18n.translate( '%d GB Storage', { args: [ 200 ] } ),
	},
	{
		addOnSlug: ADD_ON_250GB_STORAGE,
		productSlug: PRODUCT_1GB_SPACE,
		featureSlugs: null,
		icon: spaceUpgradeIcon,
		quantity: 250,
		name: i18n.translate( '%d GB Storage', { args: [ 250 ] } ),
	},
	{
		addOnSlug: ADD_ON_300GB_STORAGE,
		productSlug: PRODUCT_1GB_SPACE,
		featureSlugs: null,
		icon: spaceUpgradeIcon,
		quantity: 300,
		name: i18n.translate( '%d GB Storage', { args: [ 300 ] } ),
	},
	{
		addOnSlug: ADD_ON_350GB_STORAGE,
		productSlug: PRODUCT_1GB_SPACE,
		featureSlugs: null,
		icon: spaceUpgradeIcon,
		quantity: 350,
		name: i18n.translate( '%d GB Storage', { args: [ 350 ] } ),
	},
];

export const getAddOnsList = (): AddOnMeta[] => {
	return defaultAddOns;
};

/**
 * The add-ons that the site's plan includes as plugins to install. They have no store product.
 * The list is built on each call, so that the names and descriptions use the current locale.
 */
export const getPluginAddOnsList = (): PluginAddOnMeta[] => [
	{
		addOnSlug: ADD_ON_WOOCOMMERCE_BOOKINGS,
		pluginSlug: 'woocommerce-bookings',
		featureSlugs: [ WOO_BUNDLE_EXTENSIONS_FEATURE ],
		icon: woocommerceBookingsIcon,
		name: i18n.translate( 'WooCommerce Bookings' ),
		description: i18n.translate(
			'Let customers book appointments, rentals, and classes directly from your store.'
		),
	},
	{
		addOnSlug: ADD_ON_WOOCOMMERCE_SUBSCRIPTIONS,
		pluginSlug: 'woocommerce-subscriptions',
		featureSlugs: [ WOO_BUNDLE_EXTENSIONS_FEATURE ],
		icon: woocommerceSubscriptionsIcon,
		name: i18n.translate( 'WooCommerce Subscriptions' ),
		description: i18n.translate(
			'Sell products and services with recurring payments, billed weekly, monthly, or yearly.'
		),
	},
];

export const getAddOn = ( addOnSlug: AddOnSlug ): AddOnMeta | undefined => {
	return getAddOnsList().find( ( addOn ) => addOn.addOnSlug === addOnSlug );
};
