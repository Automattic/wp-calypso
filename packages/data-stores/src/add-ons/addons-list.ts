import {
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_1GB_SPACE,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	WPCOM_FEATURES_CUSTOM_DESIGN,
} from '@automattic/calypso-products';
import i18n from 'i18n-calypso';
import {
	ADD_ON_100GB_STORAGE,
	ADD_ON_50GB_STORAGE,
	ADD_ON_CUSTOM_DESIGN,
	ADD_ON_UNLIMITED_THEMES,
} from './constants';
import customDesignIcon from './icons/custom-design';
import spaceUpgradeIcon from './icons/space-upgrade';
import unlimitedThemesIcon from './icons/unlimited-themes';
import type { AddOnMeta } from './types';

export const getAddOnsList = (): AddOnMeta[] => {
	return [
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
	];
};
