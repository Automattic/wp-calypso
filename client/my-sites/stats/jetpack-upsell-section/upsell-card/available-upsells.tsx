import {
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_VIDEOPRESS,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import SecurityIcon from './icons/jetpack-icon-lock.svg';
import BackupIcon from './icons/jetpack-product-icon-backup.svg';
import BoostIcon from './icons/jetpack-product-icon-boost.svg';
import SearchIcon from './icons/jetpack-product-icon-search.svg';
import SocialIcon from './icons/jetpack-product-icon-social.svg';
import VideoPressIcon from './icons/jetpack-product-icon-videopress.svg';

export type Product = {
	description: string;
	href: string;
	iconUrl: string;
	isFree: boolean;
	slug: string;
	title: string;
	features: string[];
	checkoutSlug: string;
	checkoutUrl: string | null;
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
			title: translate( 'Security', { context: 'Jetpack product name' } ),
			features: [
				'akismet',
				'antispam',
				'backups',
				'backups-daily',
				'cloudflare-analytics',
				'cloudflare-cdn',
				'core/audio',
				'full-activity-log',
				'google-analytics',
				'google-my-business',
				'priority_support',
				'real-time-backups',
				'scan',
				'simple-payments',
				'subscriber-unlimited-imports',
				'support',
				'vaultpress-backups',
				'video-hosting',
				'wordads',
				'wordads-jetpack',
			],
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
			title: translate( 'Backup' ),
			features: [ 'backups', 'full-activity-log', 'real-time-backups', 'priority_support' ],
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
			title: translate( 'Search' ),
			features: [ 'search', 'instant-search' ],
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
			title: translate( 'VideoPress' ),
			features: [ 'videopress', 'videopress-1tb-storage' ],
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
			title: translate( 'Boost' ),
			features: [
				'cloud-critical-css',
				'cornerstone-10-pages',
				'image-cdn-liar',
				'image-cdn-quality',
				'image-size-analysis',
				'performance-history',
			],
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
			title: translate( 'Social' ),
			features: [
				'social-enhanced-publishing',
				'social-image-generator',
				'subscriber-unlimited-imports',
			],
			checkoutSlug: PRODUCT_JETPACK_SOCIAL_BASIC,
		},
	] as Product[];
}

// TODO: Reconfigure this to separate const data and translate calls.
// Currently we end up calling getAvailableUpsells() twice per render.
export function getUpsellFeatureSlugs(): string[] {
	const upsells = getAvailableUpsells();
	return upsells.flatMap( ( upsell ) => upsell.features );
}
