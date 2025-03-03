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
} from './constants';
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

export const getAddOn = ( addOnSlug: AddOnSlug ): AddOnMeta | undefined => {
	return getAddOnsList().find( ( addOn ) => addOn.addOnSlug === addOnSlug );
};
