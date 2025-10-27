import {
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_1GB_SPACE,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	WPCOM_FEATURES_CUSTOM_DESIGN,
	ADD_ON_350GB_STORAGE,
	ADD_ON_300GB_STORAGE,
	ADD_ON_250GB_STORAGE,
	ADD_ON_200GB_STORAGE,
	ADD_ON_150GB_STORAGE,
	ADD_ON_100GB_STORAGE,
	ADD_ON_50GB_STORAGE,
	ADD_ON_CUSTOM_DESIGN,
	ADD_ON_UNLIMITED_THEMES,
} from '@automattic/api-core';
import { __, sprintf } from '@wordpress/i18n';
import customDesignIcon from './icons/custom-design';
import spaceUpgradeIcon from './icons/space-upgrade';
import unlimitedThemesIcon from './icons/unlimited-themes';
import type { AddOnMeta, AddOnSlug } from './types';

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
		name: __( '50 GB Storage' ),
		description: __( 'Make more space for high-quality photos, videos, and other media.' ),
	},
	{
		addOnSlug: ADD_ON_100GB_STORAGE,
		productSlug: PRODUCT_1GB_SPACE,
		featureSlugs: null,
		icon: spaceUpgradeIcon,
		quantity: 100,
		name: __( '100 GB Storage' ),
		description: __(
			'Take your site to the next level. Store all your media in one place without worrying about running out of space.'
		),
	},
	{
		addOnSlug: ADD_ON_150GB_STORAGE,
		productSlug: PRODUCT_1GB_SPACE,
		featureSlugs: null,
		icon: spaceUpgradeIcon,
		quantity: 150,
		/* Translators: %d is a number representing the amount of storage (in gigabytes) for this product */
		name: sprintf( __( '%d GB Storage' ), [ 150 ] ),
	},
	{
		addOnSlug: ADD_ON_200GB_STORAGE,
		productSlug: PRODUCT_1GB_SPACE,
		featureSlugs: null,
		icon: spaceUpgradeIcon,
		quantity: 200,
		/* Translators: %d is a number representing the amount of storage (in gigabytes) for this product */
		name: sprintf( __( '%d GB Storage' ), [ 200 ] ),
	},
	{
		addOnSlug: ADD_ON_250GB_STORAGE,
		productSlug: PRODUCT_1GB_SPACE,
		featureSlugs: null,
		icon: spaceUpgradeIcon,
		quantity: 250,
		/* Translators: %d is a number representing the amount of storage (in gigabytes) for this product */
		name: sprintf( __( '%d GB Storage' ), [ 250 ] ),
	},
	{
		addOnSlug: ADD_ON_300GB_STORAGE,
		productSlug: PRODUCT_1GB_SPACE,
		featureSlugs: null,
		icon: spaceUpgradeIcon,
		quantity: 300,
		/* Translators: %d is a number representing the amount of storage (in gigabytes) for this product */
		name: sprintf( __( '%d GB Storage' ), [ 300 ] ),
	},
	{
		addOnSlug: ADD_ON_350GB_STORAGE,
		productSlug: PRODUCT_1GB_SPACE,
		featureSlugs: null,
		icon: spaceUpgradeIcon,
		quantity: 350,
		/* Translators: %d is a number representing the amount of storage (in gigabytes) for this product */
		name: sprintf( __( '%d GB Storage' ), [ 350 ] ),
	},
];

//used
export const getAddOnsList = (): AddOnMeta[] => {
	return defaultAddOns;
};

//useful? not used.
export const getAddOn = ( addOnSlug: AddOnSlug ): AddOnMeta | undefined => {
	return getAddOnsList().find( ( addOn ) => addOn.addOnSlug === addOnSlug );
};
