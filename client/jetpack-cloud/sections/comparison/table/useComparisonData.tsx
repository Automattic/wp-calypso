import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import Checkmark from 'calypso/assets/images/checkbox-icons/checkmark-jetpack.svg';
import DesignIcon from 'calypso/assets/images/jetpack/jetpack-icon-design.svg';
import EarnIcon from 'calypso/assets/images/jetpack/jetpack-icon-earn.svg';
import GrowthIcon from 'calypso/assets/images/jetpack/jetpack-icon-growth.svg';
import LockIcon from 'calypso/assets/images/jetpack/jetpack-icon-lock.svg';
import MobileAppIcon from 'calypso/assets/images/jetpack/jetpack-icon-mobile-app.svg';
import PerformanceIcon from 'calypso/assets/images/jetpack/jetpack-icon-performance.svg';
import SupportIcon from 'calypso/assets/images/jetpack/jetpack-icon-support.svg';
import AIIcon from 'calypso/assets/images/jetpack/jetpack-product-icon-ai.svg';
import AntiSpamIcon from 'calypso/assets/images/jetpack/jetpack-product-icon-antispam.svg';
import BackupIcon from 'calypso/assets/images/jetpack/jetpack-product-icon-backup.svg';
import BoostIcon from 'calypso/assets/images/jetpack/jetpack-product-icon-boost.svg';
import CRMIcon from 'calypso/assets/images/jetpack/jetpack-product-icon-crm.svg';
import ScanIcon from 'calypso/assets/images/jetpack/jetpack-product-icon-scan.svg';
import SearchIcon from 'calypso/assets/images/jetpack/jetpack-product-icon-search.svg';
import SocialIcon from 'calypso/assets/images/jetpack/jetpack-product-icon-social.svg';
import StatsIcon from 'calypso/assets/images/jetpack/jetpack-product-icon-stats.svg';
import VideoPressIcon from 'calypso/assets/images/jetpack/jetpack-product-icon-videopress.svg';
import { ComparisonDataItem } from '../types';
import { links } from './links';

const CheckIcon = () => <img className="checkmark-icon" src={ Checkmark } alt="" />;

const allChecked: ComparisonDataItem[ 'features' ][ number ][ 'info' ] = {
	FREE: { content: <CheckIcon /> },
	GROWTH: { content: <CheckIcon /> },
	SECURITY: { content: <CheckIcon /> },
	COMPLETE: { content: <CheckIcon /> },
};

export const useComparisonData = () => {
	const translate = useTranslate();

	return useMemo< Array< ComparisonDataItem > >(
		() => [
			{
				sectionId: 'security',
				sectionName: translate( 'Security', { context: 'Jetpack product name' } ),
				icon: LockIcon,
				features: [
					{
						id: 'backup',
						name: translate( 'VaultPress Backup' ),
						icon: BackupIcon,
						url: links.backup,
						info: {
							SECURITY: {
								highlight: true,
								content: (
									<>
										{ translate( 'Real-time backups' ) }
										<br data-screen="desktop" />
										<span data-screen="mobile"> - </span>
										{ translate( '%(amount)s storage', {
											args: { amount: '10GB' },
											comment: '%s is a storage amount like 1TB or 10GB',
										} ) }
									</>
								),
							},
							COMPLETE: {
								highlight: true,
								content: (
									<>
										{ translate( 'Real-time backups' ) }
										<br data-screen="desktop" />
										<span data-screen="mobile"> - </span>
										{ translate( '%(amount)s storage', {
											args: { amount: '1TB' },
											comment: '%s is a storage amount like 1TB or 10GB',
										} ) }
									</>
								),
							},
						},
					},
					{
						id: 'scan',
						name: translate( 'Scan' ),
						icon: ScanIcon,
						url: links.scan,
						info: {
							SECURITY: {
								highlight: true,
								content: translate( 'Scan Real-time' ),
							},
							COMPLETE: {
								highlight: true,
								content: translate( 'Scan Real-time' ),
							},
						},
					},
					{
						id: 'akismet_antispam',
						name: translate( 'Akismet Anti-spam' ),
						icon: AntiSpamIcon,
						url: links.akismet_antispam,
						info: {
							SECURITY: {
								highlight: true,
								content: translate( '10K API calls/mo' ),
							},
							COMPLETE: {
								highlight: true,
								content: translate( '60K API calls/mo' ),
							},
						},
					},
					{
						id: 'activity_log',
						name: translate( 'Activity log' ),
						url: links.activity_log,
						info: {
							FREE: {
								content: translate( 'Last 20 events' ),
							},
							GROWTH: {
								content: translate( 'Last 20 events' ),
							},
							SECURITY: {
								highlight: true,
								content: translate( '30-day archive' ),
							},
							COMPLETE: {
								highlight: true,
								content: translate( '1-year archive' ),
							},
						},
					},
					{
						id: 'downtime_monitoring',
						name: translate( 'Downtime monitoring' ),
						url: links.downtime_monitoring,
						info: allChecked,
					},
					{
						id: 'brute_force_attack_protection',
						name: translate( 'Brute force attack protection' ),
						url: links.brute_force_attack_protection,
						info: allChecked,
					},
					{
						id: 'secure_authentication',
						name: translate( 'Secure authentication' ),
						url: links.secure_authentication,
						info: allChecked,
					},
					{
						id: 'auto_plugin_updates',
						name: translate( 'Plugin auto-updates' ),
						url: links.auto_plugin_updates,
						info: allChecked,
					},
				],
			},
			{
				sectionId: 'performance',
				sectionName: translate( 'Performance' ),
				icon: PerformanceIcon,
				features: [
					{
						id: 'search',
						name: translate( 'Site Search' ),
						icon: SearchIcon,
						url: links.search,
						info: {
							COMPLETE: {
								highlight: true,
								content: translate( 'Up to 100k records' ),
							},
						},
					},
					{
						id: 'boost',
						name: translate( 'Boost' ),
						icon: BoostIcon,
						url: links.boost,
						info: {
							FREE: {
								content: translate( 'Manual Critical CSS' ),
							},
							GROWTH: {
								content: translate( 'Manual Critical CSS' ),
							},
							SECURITY: {
								content: translate( 'Manual Critical CSS' ),
							},
							COMPLETE: {
								highlight: true,
								content: translate( 'Automated Critical CSS' ),
							},
						},
					},
					{
						id: 'videopress',
						name: translate( 'VideoPress' ),
						icon: VideoPressIcon,
						url: links.videopress,
						info: {
							FREE: {
								content: translate( '1 video (Up to 1GB)' ),
							},
							GROWTH: {
								content: translate( '1 video (Up to 1GB)' ),
							},
							SECURITY: {
								content: translate( '1 video (Up to 1GB)' ),
							},
							COMPLETE: {
								highlight: true,
								content: translate( 'Unlimited Videos (Up to 1TB)' ),
							},
						},
					},
					{
						id: 'cdn',
						name: translate( '{{abbr}}CDN{{/abbr}} (Content Delivery Network)', {
							components: {
								abbr: <abbr title={ translate( 'Content Delivery Network' ) } />,
							},
						} ),
						url: links.cdn,
						info: allChecked,
					},
				],
			},
			{
				sectionId: 'growth',
				sectionName: translate( 'Growth' ),
				icon: GrowthIcon,
				features: [
					{
						id: 'stats',
						name: translate( 'Stats' ),
						url: links.stats,
						icon: StatsIcon,
						info: {
							FREE: {
								content: (
									<>
										{ translate( 'Basic stats' ) }
										<br data-screen="desktop" />
										{ /* Space between description and parenthesis on mobile */ }
										<span data-screen="mobile"> </span>
										{ translate( '(Personal sites only)' ) }
									</>
								),
							},
							GROWTH: {
								highlight: true,
								content: (
									<>
										{ translate( 'Advanced stats' ) }
										<br data-screen="desktop" />
										{ /* Space between description and parenthesis on mobile */ }
										<span data-screen="mobile"> </span>
										{ translate( '(10k page views)' ) }
									</>
								),
							},
							SECURITY: {
								content: (
									<>
										{ translate( 'Basic stats' ) }
										<br data-screen="desktop" />
										{ /* Space between description and parenthesis on mobile */ }
										<span data-screen="mobile"> </span>
										{ translate( '(Personal sites only)' ) }
									</>
								),
							},
							COMPLETE: {
								highlight: true,
								content: (
									<>
										{ translate( 'Advanced stats' ) }
										<br data-screen="desktop" />
										{ /* Space between description and parenthesis on mobile */ }
										<span data-screen="mobile"> </span>
										{ translate( '(100k page views)' ) }
									</>
								),
							},
						},
					},
					{
						id: 'social',
						name: translate( 'Social' ),
						url: links.social,
						icon: SocialIcon,
						info: {
							FREE: {
								content: translate( 'Social Free' ),
							},
							GROWTH: {
								highlight: true,
								content: translate( 'Social Advanced' ),
							},
							SECURITY: {
								content: translate( 'Social Free' ),
							},
							COMPLETE: {
								highlight: true,
								content: translate( 'Social Advanced' ),
							},
						},
					},
					{
						id: 'crm',
						name: translate( '{{abbr}}CRM{{/abbr}}', {
							components: {
								abbr: <abbr title={ translate( 'Customer Relationship Management' ) } />,
							},
						} ),
						url: links.crm,
						icon: CRMIcon,
						info: {
							FREE: {
								content: translate( 'Free' ),
							},
							GROWTH: {
								content: translate( 'Free' ),
							},
							SECURITY: {
								content: translate( 'Free' ),
							},
							COMPLETE: {
								highlight: true,
								content: translate( 'Entrepreneur' ),
							},
						},
					},
					{
						id: 'ai',
						name: translate( 'AI' ),
						url: links.ai,
						icon: AIIcon,
						info: {
							FREE: {
								content: translate( '20 free requests' ),
							},
							GROWTH: {
								content: translate( '20 free requests' ),
							},
							SECURITY: {
								content: translate( '20 free requests' ),
							},
							COMPLETE: {
								content: translate( '20 free requests' ),
							},
						},
					},
					{
						id: 'blaze',
						name: translate( 'Blaze' ),
						url: links.blaze,
						info: allChecked,
					},
					{
						id: 'newsletter',
						name: translate( 'Newsletter' ),
						url: links.newsletter,
						info: allChecked,
					},
					{
						id: 'seo',
						name: translate( '{{abbr}}SEO{{/abbr}} tools', {
							components: {
								abbr: <abbr title={ translate( 'Search Engine Optimization' ) } />,
							},
						} ),
						url: links.seo,
						info: allChecked,
					},
				],
			},
			{
				sectionId: 'earn',
				sectionName: translate( 'Monetize' ),
				icon: EarnIcon,
				features: [
					{
						id: 'ad_network',
						name: translate( 'Ad network' ),
						url: links.ad_network,
						info: {
							GROWTH: { content: <CheckIcon /> },
							SECURITY: { content: <CheckIcon /> },
							COMPLETE: { content: <CheckIcon /> },
						},
					},
					{
						id: 'payments_block',
						name: translate( 'Collect payments' ),
						url: links.payments_block,
						info: allChecked,
					},
					{
						id: 'transaction_fees',
						name: translate( 'Transaction fees' ),
						url: links.transaction_fees,
						info: {
							FREE: { content: translate( '10%' ) },
							GROWTH: { content: translate( '2%' ) },
							SECURITY: { content: translate( '4%' ) },
							COMPLETE: { content: translate( '2%' ) },
						},
					},
				],
			},
			{
				sectionId: 'design',
				sectionName: translate( 'Design' ),
				icon: DesignIcon,
				features: [
					{
						id: 'related_posts',
						name: translate( 'Related posts' ),
						url: links.related_posts,
						info: allChecked,
					},
					{
						id: 'galleries_and_slideshows',
						name: translate( 'Gallery and slideshow tools' ),
						url: links.galleries_and_slideshows,
						info: allChecked,
					},
					{
						id: 'contact_forms',
						name: translate( 'Contact Forms' ),
						url: links.contact_forms,
						info: allChecked,
					},
				],
			},
			{
				sectionId: 'support',
				sectionName: translate( 'Support' ),
				icon: SupportIcon,
				features: [
					{
						id: 'priority_support',
						name: translate( 'Priority support' ),
						url: links.priority_support,
						info: {
							GROWTH: { content: <CheckIcon /> },
							SECURITY: { content: <CheckIcon /> },
							COMPLETE: { content: <CheckIcon /> },
						},
					},
				],
			},
			{
				sectionId: 'mobile-app',
				sectionName: translate( 'Mobile app' ),
				icon: MobileAppIcon,
				features: [
					{
						id: 'mobile_app',
						name: translate( 'Jetpack for Android and iOS' ),
						url: links.mobile_app,
						info: allChecked,
					},
				],
			},
		],
		[ translate ]
	);
};
