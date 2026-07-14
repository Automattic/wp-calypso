import {
	FEATURE_CLOUD_CRITICAL_CSS,
	FEATURE_SOCIAL_ENHANCED_PUBLISHING,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_VIDEOPRESS,
	WPCOM_FEATURES_ANTISPAM,
	WPCOM_FEATURES_BACKUPS,
	WPCOM_FEATURES_CLASSIC_SEARCH,
	WPCOM_FEATURES_SCAN,
	WPCOM_FEATURES_VIDEOPRESS,
} from '@automattic/calypso-products';
import { translate, TranslateResult } from 'i18n-calypso';
import SecurityIcon from './icons/jetpack-icon-lock.svg';
import BackupIcon from './icons/jetpack-product-icon-backup.svg';
import BoostIcon from './icons/jetpack-product-icon-boost.svg';
import SearchIcon from './icons/jetpack-product-icon-search.svg';
import SocialIcon from './icons/jetpack-product-icon-social.svg';
import VideoPressIcon from './icons/jetpack-product-icon-videopress.svg';

export type Product = {
	description: TranslateResult;
	href: string;
	iconUrl: string;
	isFree: boolean;
	slug: string;
	title: string;
	// Feature slugs that indicate the product (or a plan bundling it) is already
	// owned. The upsell is hidden when the site has all of them.
	ownedFeatures: string[];
	checkoutSlug: string;
	checkoutUrl?: string;
};

export function getAvailableUpsells() {
	return [
		{
			description: translate(
				'Protect your site from hackers and spam with automated backups, malware scanning, and spam filtering.'
			),
			href: 'https://jetpack.com/features/security/',
			iconUrl: SecurityIcon,
			isFree: false,
			slug: 'security',
			title: 'Security',
			ownedFeatures: [ WPCOM_FEATURES_BACKUPS, WPCOM_FEATURES_SCAN, WPCOM_FEATURES_ANTISPAM ],
			checkoutSlug: PLAN_JETPACK_SECURITY_T1_YEARLY,
		},
		{
			description: translate(
				'Save every single change and get back online quickly with one-click restores.'
			),
			href: 'https://jetpack.com/upgrade/backup/',
			iconUrl: BackupIcon,
			isFree: false,
			slug: 'backup',
			title: 'Backup',
			ownedFeatures: [ WPCOM_FEATURES_BACKUPS ],
			checkoutSlug: PRODUCT_JETPACK_BACKUP_T1_YEARLY,
		},
		{
			description: translate(
				"Help your site visitors instantly find what they're looking for so they read and buy more."
			),
			href: 'https://jetpack.com/upgrade/search/',
			iconUrl: SearchIcon,
			isFree: false,
			slug: 'search',
			title: 'Search',
			ownedFeatures: [ WPCOM_FEATURES_CLASSIC_SEARCH ],
			checkoutSlug: PRODUCT_JETPACK_SEARCH,
		},
		{
			description: translate(
				'Engage your visitors with high-quality, ad-free videos build specifically for WordPress.'
			),
			href: 'https://jetpack.com/videopress/',
			iconUrl: VideoPressIcon,
			isFree: false,
			slug: 'video',
			title: 'VideoPress',
			ownedFeatures: [ WPCOM_FEATURES_VIDEOPRESS ],
			checkoutSlug: PRODUCT_JETPACK_VIDEOPRESS,
		},
		{
			description: translate(
				"Improve your site's performance and SEO in a few clicks with the free Jetpack Boost plugin."
			),
			href: 'https://jetpack.com/boost/',
			iconUrl: BoostIcon,
			isFree: true,
			slug: 'boost',
			title: 'Boost',
			ownedFeatures: [ FEATURE_CLOUD_CRITICAL_CSS ],
			checkoutSlug: PRODUCT_JETPACK_BOOST,
		},
		{
			description: translate(
				'Save time by auto-posting your content to social networks like Facebook, LinkedIn, and more.'
			),
			href: 'https://jetpack.com/social/',
			iconUrl: SocialIcon,
			isFree: true,
			slug: 'social',
			title: 'Social',
			ownedFeatures: [ FEATURE_SOCIAL_ENHANCED_PUBLISHING ],
			checkoutSlug: PRODUCT_JETPACK_SOCIAL_BASIC,
		},
	] satisfies Product[];
}

// TODO: Reconfigure this to separate const data and translate calls.
// Currently we end up calling getAvailableUpsells() twice per render.
export function getUpsellFeatureSlugs(): string[] {
	const upsells = getAvailableUpsells();
	return [ ...new Set( upsells.flatMap( ( upsell ) => upsell.ownedFeatures ) ) ];
}

export function filterUpsellsBySiteFeatures(
	upsells: Product[],
	siteFeatures: string[]
): Product[] {
	return upsells.filter(
		( upsell ) => ! upsell.ownedFeatures.every( ( feature ) => siteFeatures.includes( feature ) )
	);
}
