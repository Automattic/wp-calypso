/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import { invoke } from 'lodash';

/**
 * Internal dependencies
 */
import * as constants from './constants';
import { DOMAIN_PRICING_AND_AVAILABLE_TLDS } from 'lib/url/support';

export const FEATURES_LIST = {
	[ constants.FEATURE_BLANK ]: {
		getSlug: () => constants.FEATURE_BLANK,
		getTitle: () => '',
	},

	[ constants.FEATURE_ALL_FREE_FEATURES_JETPACK ]: {
		getSlug: () => constants.FEATURE_ALL_FREE_FEATURES_JETPACK,
		getTitle: () =>
			translate( '{{a}}All free features{{/a}}', {
				components: {
					a: (
						<a
							href="https://jetpack.com/features/comparison"
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			} ),
		getDescription: () =>
			translate( 'Also includes all features offered in the free version of Jetpack.' ),
	},

	[ constants.FEATURE_ALL_FREE_FEATURES ]: {
		getSlug: () => constants.FEATURE_ALL_FREE_FEATURES,
		getTitle: () => translate( 'All free features' ),
		getDescription: () => translate( 'Also includes all features offered in the free plan.' ),
	},

	[ constants.FEATURE_ALL_PERSONAL_FEATURES_JETPACK ]: {
		getSlug: () => constants.FEATURE_ALL_PERSONAL_FEATURES_JETPACK,
		getTitle: () =>
			translate( '{{a}}All Personal features{{/a}}', {
				components: {
					a: (
						<a
							href="https://jetpack.com/features/comparison"
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			} ),
		getDescription: () => translate( 'Also includes all features offered in the Personal plan.' ),
	},

	[ constants.FEATURE_ALL_PERSONAL_FEATURES ]: {
		getSlug: () => constants.FEATURE_ALL_PERSONAL_FEATURES,
		getTitle: () => translate( 'All Personal features' ),
		getDescription: () =>
			translate(
				'Including email and live chat support, an ad-free experience for your visitors, increased storage space, and a custom domain name for one year.'
			),
	},

	[ constants.FEATURE_ALL_PREMIUM_FEATURES_JETPACK ]: {
		getSlug: () => constants.FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
		getTitle: () =>
			translate( '{{a}}All Premium features{{/a}}', {
				components: {
					a: (
						<a
							href="https://jetpack.com/features/comparison"
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			} ),
		getDescription: () => translate( 'Also includes all features offered in the Premium plan.' ),
	},

	[ constants.FEATURE_ALL_PREMIUM_FEATURES ]: {
		getSlug: () => constants.FEATURE_ALL_PREMIUM_FEATURES,
		getTitle: () => translate( 'All Premium features' ),
		getDescription: () =>
			translate(
				'Including unlimited premium themes, advanced design and monetization options, simple payment buttons, and a custom domain name for one year.'
			),
	},

	[ constants.FEATURE_ADVANCED_CUSTOMIZATION ]: {
		getSlug: () => constants.FEATURE_ADVANCED_CUSTOMIZATION,
		getTitle: () => translate( 'Advanced customization' ),
		getDescription: () =>
			translate(
				'Customize your selected theme template with extended color schemes, background designs, and complete control over website CSS.'
			),
	},

	[ constants.FEATURE_FREE_BLOG_DOMAIN ]: {
		getSlug: () => constants.FEATURE_FREE_BLOG_DOMAIN,
		getTitle: () => translate( 'Free .blog domain for one year' ),
		getDescription: () =>
			translate(
				'Get a free custom .blog domain for one year. Premium domains not included. Your domain will renew at its regular price.'
			),
	},

	[ constants.FEATURE_FREE_DOMAIN ]: {
		getSlug: () => constants.FEATURE_FREE_DOMAIN,
		getTitle: () => translate( 'Free Domain for One Year' ),
		getDescription: () =>
			translate(
				'Get a free domain for one year. ' +
					'Premium domains not included. ' +
					'Your domain will renew at its {{a}}regular price{{/a}}.',
				{
					components: {
						a: (
							<a
								href={ DOMAIN_PRICING_AND_AVAILABLE_TLDS }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				}
			),
	},

	[ constants.FEATURE_PREMIUM_THEMES ]: {
		getSlug: () => constants.FEATURE_PREMIUM_THEMES,
		getTitle: () => translate( 'Unlimited premium themes' ),
		getDescription: () =>
			translate(
				'Unlimited access to all of our advanced premium theme templates, including templates specifically tailored for businesses.'
			),
	},

	[ constants.FEATURE_MONETISE ]: {
		getSlug: () => constants.FEATURE_MONETISE,
		getTitle: () => translate( 'Monetize your site with ads' ),
		getDescription: () =>
			translate(
				'Add advertising to your site through our WordAds program and earn money from impressions.'
			),
	},

	[ constants.FEATURE_UPLOAD_THEMES_PLUGINS ]: {
		getSlug: () => constants.FEATURE_UPLOAD_THEMES_PLUGINS,
		getTitle: () => translate( 'Upload Themes and Plugins' ),
		getDescription: () => translate( 'Upload custom themes and plugins on your site.' ),
	},

	[ constants.FEATURE_GOOGLE_ANALYTICS_SIGNUP ]: {
		getSlug: () => constants.FEATURE_GOOGLE_ANALYTICS_SIGNUP,
		getTitle: () => translate( 'Google Analytics' ),
	},

	[ constants.FEATURE_EMAIL_SUPPORT_SIGNUP ]: {
		getSlug: () => constants.FEATURE_EMAIL_SUPPORT_SIGNUP,
		getTitle: () => translate( 'Email support' ),
		getDescription: () =>
			translate(
				'High quality email support to help you get your website up and running and working how you want it.'
			),
	},

	[ constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_SIGNUP ]: {
		getSlug: () => constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_SIGNUP,
		getTitle: () => translate( 'Email and live chat support' ),
		getDescription: () =>
			translate(
				'High quality support to help you get your website up and running and working how you want it.'
			),
	},

	[ constants.FEATURE_FREE_THEMES_SIGNUP ]: {
		getSlug: () => constants.FEATURE_FREE_THEMES_SIGNUP,
		getTitle: () => translate( 'Dozens of Free Themes' ),
		getDescription: () =>
			translate(
				"Access to a wide range of professional theme templates for your website so you can find the exact design you're looking for."
			),
	},

	[ constants.FEATURE_WP_SUBDOMAIN_SIGNUP ]: {
		getSlug: () => constants.FEATURE_WP_SUBDOMAIN_SIGNUP,
		getTitle: () => translate( 'WordPress.com subdomain' ),
		getDescription: () =>
			translate( 'Your site address will use a WordPress.com subdomain (sitename.wordpress.com).' ),
	},

	[ constants.FEATURE_UNLIMITED_STORAGE_SIGNUP ]: {
		getSlug: () => constants.FEATURE_UNLIMITED_STORAGE_SIGNUP,
		getTitle: () => translate( '200 GB storage' ),
		getDescription: () =>
			translate(
				"With increased storage space you'll be able to upload more images, videos, audio, and documents to your website."
			),
	},

	[ constants.FEATURE_ADVANCED_SEO_TOOLS ]: {
		getSlug: () => constants.FEATURE_ADVANCED_SEO_TOOLS,
		getTitle: () => translate( 'Advanced SEO tools' ),
		getDescription: () =>
			translate(
				"Adds tools to enhance your site's content for better results on search engines and social media."
			),
	},

	[ constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED_SIGNUP ]: {
		getSlug: () => constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED_SIGNUP,
		getTitle: () => translate( 'Unlimited Backup Space' ),
	},

	[ constants.FEATURE_FREE_WORDPRESS_THEMES ]: {
		getSlug: () => constants.FEATURE_FREE_WORDPRESS_THEMES,
		getTitle: () => translate( 'Free WordPress Themes' ),
	},

	[ constants.FEATURE_VIDEO_CDN_LIMITED ]: {
		getSlug: () => constants.FEATURE_VIDEO_CDN_LIMITED,
		getTitle: () => translate( '13GB Video Storage' ),
		getDescription: () =>
			translate(
				'High-speed video hosting on our CDN, free of ads and watermarks, fully optimized for WordPress.'
			),
	},

	[ constants.FEATURE_VIDEO_CDN_UNLIMITED ]: {
		getSlug: () => constants.FEATURE_VIDEO_CDN_UNLIMITED,
		getTitle: () => translate( 'Unlimited Video Storage' ),
	},

	[ constants.FEATURE_SEO_PREVIEW_TOOLS ]: {
		getSlug: () => constants.FEATURE_SEO_PREVIEW_TOOLS,
		getTitle: () => translate( 'SEO Tools' ),
		getDescription: () =>
			translate(
				'Edit your page titles and meta descriptions, and preview how your content will appear on social media.'
			),
	},

	[ constants.FEATURE_GOOGLE_ANALYTICS ]: {
		getSlug: () => constants.FEATURE_GOOGLE_ANALYTICS,
		getTitle: () => translate( 'Google Analytics Integration' ),
		getDescription: () =>
			translate(
				'Track website statistics with Google Analytics for a ' +
					'deeper understanding of your website visitors and customers.'
			),
	},

	[ constants.FEATURE_GOOGLE_MY_BUSINESS ]: {
		getSlug: () => constants.FEATURE_GOOGLE_MY_BUSINESS,
		getTitle: () => translate( 'Google My Business' ),
		getDescription: () =>
			translate(
				'See how customers find you on Google -- and whether they visited your site ' +
					'and looked for more info on your business -- by connecting to a Google My Business location.'
			),
	},

	[ constants.FEATURE_UNLIMITED_STORAGE ]: {
		getSlug: () => constants.FEATURE_UNLIMITED_STORAGE,
		getTitle: () =>
			translate( '{{strong}}200 GB{{/strong}} Storage Space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			translate(
				"With increased storage space you'll be able to upload " +
					'more images, videos, audio, and documents to your website.'
			),
		getStoreSlug: () => 'unlimited_space',
	},

	[ constants.FEATURE_BLOG_DOMAIN ]: {
		getSlug: () => constants.FEATURE_BLOG_DOMAIN,
		getTitle: () =>
			translate( 'Free .blog Domain for One Year', {
				context: 'title',
			} ),
		getDescription: ( abtest, domainName ) => {
			if ( domainName ) {
				return translate( 'Your domain (%s) is included with this plan.', {
					args: domainName,
				} );
			}

			return translate(
				'Get a free custom .blog domain for one year. Premium domains not included. Your domain will renew at its regular price.'
			);
		},
	},

	[ constants.FEATURE_CUSTOM_DOMAIN ]: {
		getSlug: () => constants.FEATURE_CUSTOM_DOMAIN,
		getTitle: () =>
			translate( 'Free Domain for One Year', {
				context: 'title',
			} ),
		getDescription: ( abtest, domainName ) => {
			if ( domainName ) {
				return translate( 'Your domain (%s) is included with this plan.', {
					args: domainName,
				} );
			}

			return translate(
				'Get a free domain for one year. ' +
					'Premium domains not included. ' +
					'Your domain will renew at its {{a}}regular price{{/a}}.',
				{
					components: {
						a: (
							<a
								href={ DOMAIN_PRICING_AND_AVAILABLE_TLDS }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				}
			);
		},
	},

	[ constants.FEATURE_JETPACK_ESSENTIAL ]: {
		getSlug: () => constants.FEATURE_JETPACK_ESSENTIAL,
		getTitle: () => translate( 'Jetpack Essential Features' ),
		getDescription: () =>
			translate(
				'Speed up your site’s performance and protect it from spammers. ' +
					'Access detailed records of all activity on your site. ' +
					'While you’re at it, improve your SEO and automate social media sharing.'
			),
	},

	[ constants.FEATURE_JETPACK_ADVANCED ]: {
		getSlug: () => constants.FEATURE_JETPACK_ADVANCED,
		getTitle: () => translate( 'Jetpack Advanced Features' ),
		getDescription: () =>
			translate(
				'Speed up your site’s performance and protect it from spammers. ' +
					'Access detailed records of all activity on your site and restore your site ' +
					'to a previous point in time with just a click! While you’re at it, ' +
					'improve your SEO with our Advanced SEO tools and automate social media sharing.'
			),
	},

	[ constants.FEATURE_UNLIMITED_PREMIUM_THEMES ]: {
		getSlug: () => constants.FEATURE_UNLIMITED_PREMIUM_THEMES,
		getTitle: () =>
			translate( '{{strong}}Unlimited{{/strong}} Premium Themes', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			translate(
				'Unlimited access to all of our advanced premium theme templates, ' +
					'including templates specifically tailored for businesses.'
			),
		getStoreSlug: () => 'unlimited_themes',
	},

	[ constants.FEATURE_VIDEO_UPLOADS ]: {
		getSlug: () => constants.FEATURE_VIDEO_UPLOADS,
		getTitle: () => translate( 'VideoPress Support' ),
		getDescription: () =>
			translate(
				'The easiest way to upload videos to your website and display them ' +
					'using a fast, unbranded, customizable player with rich stats.'
			),
		getStoreSlug: () => 'videopress',
	},

	[ constants.FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM ]: {
		getSlug: () => constants.FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM,
		getTitle: () => translate( 'VideoPress Support' ),
		getDescription: () =>
			translate(
				'Easy video uploads, and a fast, unbranded, customizable video player, ' +
					'enhanced with rich stats and unlimited storage space. '
			),
		getStoreSlug: () => 'videopress',
	},

	[ constants.FEATURE_VIDEO_UPLOADS_JETPACK_PRO ]: {
		getSlug: () => constants.FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
		getTitle: () =>
			translate( '{{strong}}Unlimited{{/strong}} Video Hosting', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			translate(
				'Easy video uploads, and a fast, unbranded, customizable video player, ' +
					'enhanced with rich stats and unlimited storage space. '
			),
		getStoreSlug: () => 'videopress',
	},

	[ constants.FEATURE_AUDIO_UPLOADS ]: {
		getSlug: () => constants.FEATURE_AUDIO_UPLOADS,
		getTitle: () => translate( 'Audio Upload Support' ),
		getDescription: () =>
			translate( 'The easiest way to upload audio files that use any major audio file format. ' ),
		getStoreSlug: () => 'videopress',
	},

	[ constants.FEATURE_BASIC_DESIGN ]: {
		getSlug: () => constants.FEATURE_BASIC_DESIGN,
		getTitle: () => translate( 'Basic Design Customization' ),
		getDescription: () =>
			translate(
				'Customize your selected theme template with pre-set color schemes, ' +
					'background designs, and font styles.'
			),
		getStoreSlug: () => constants.FEATURE_ADVANCED_DESIGN,
	},

	[ constants.FEATURE_ADVANCED_DESIGN ]: {
		getSlug: () => constants.FEATURE_ADVANCED_DESIGN,
		getTitle: () =>
			translate( '{{strong}}Advanced{{/strong}} Design Customization', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			translate(
				'Customize your selected theme template with extended color schemes, ' +
					'background designs, and complete control over website CSS.'
			),
		getStoreSlug: () => constants.FEATURE_ADVANCED_DESIGN,
	},

	[ constants.FEATURE_NO_ADS ]: {
		getSlug: () => constants.FEATURE_NO_ADS,
		getTitle: () => translate( 'Remove WordPress.com Ads' ),
		getDescription: () =>
			translate(
				'Allow your visitors to visit and read your website without ' +
					'seeing any WordPress.com advertising.'
			),
		getStoreSlug: () => 'no-adverts/no-adverts.php',
	},
	[ constants.FEATURE_REPUBLICIZE ]: {
		getSlug: () => constants.FEATURE_REPUBLICIZE,
		getTitle: () => translate( 'Advanced Social Media' ),
		getDescription: () =>
			translate(
				"Schedule your social media updates in advance and promote your posts when it's best for you."
			),
	},
	[ constants.FEATURE_SIMPLE_PAYMENTS ]: {
		getSlug: () => constants.FEATURE_SIMPLE_PAYMENTS,
		getTitle: () => translate( 'Simple Payments' ),
		getDescription: () => translate( 'Sell anything with a simple PayPal button.' ),
	},
	[ constants.FEATURE_NO_BRANDING ]: {
		getSlug: () => constants.FEATURE_NO_BRANDING,
		getTitle: () => translate( 'Remove WordPress.com Branding' ),
		getDescription: () =>
			translate(
				"Keep the focus on your site's brand by removing the WordPress.com footer branding."
			),
		getStoreSlug: () => 'no-adverts/no-adverts.php',
	},

	[ constants.FEATURE_BUSINESS_ONBOARDING ]: {
		getSlug: () => constants.FEATURE_BUSINESS_ONBOARDING,
		getTitle: () => translate( 'Get Personalized Help' ),
		getDescription: () =>
			translate(
				'Schedule a one-on-one orientation with a Happiness Engineer to set up your site and learn more about WordPress.com.'
			),
	},

	[ constants.FEATURE_ADVANCED_SEO ]: {
		getSlug: () => constants.FEATURE_ADVANCED_SEO,
		getTitle: () => translate( 'SEO Tools' ),
		getDescription: () =>
			translate(
				"Adds tools to enhance your site's content for better results on search engines and social media."
			),
	},

	[ constants.FEATURE_UPLOAD_PLUGINS ]: {
		getSlug: () => constants.FEATURE_UPLOAD_PLUGINS,
		getTitle: () => translate( 'Install Plugins' ),
		getDescription: () => translate( 'Install custom plugins on your site.' ),
	},

	[ constants.FEATURE_UPLOAD_THEMES ]: {
		getSlug: () => constants.FEATURE_UPLOAD_THEMES,
		getTitle: () => translate( 'Install Themes' ),
		getDescription: () => translate( 'Upload custom themes on your site.' ),
	},

	[ constants.FEATURE_WORDADS_INSTANT ]: {
		getSlug: () => constants.FEATURE_WORDADS_INSTANT,
		getTitle: () => translate( 'Site Monetization' ),
		getDescription: () =>
			translate(
				'Put your site to work and earn through ad revenue, easy-to-add PayPal buttons, and more.'
			),
	},

	[ constants.FEATURE_WP_SUBDOMAIN ]: {
		getSlug: () => constants.FEATURE_WP_SUBDOMAIN,
		getTitle: () => translate( 'WordPress.com Subdomain' ),
		getDescription: () =>
			translate( 'Your site address will use a WordPress.com subdomain (sitename.wordpress.com).' ),
	},

	[ constants.FEATURE_FREE_THEMES ]: {
		getSlug: () => constants.FEATURE_FREE_THEMES,
		getTitle: () => translate( 'Dozens of Free Themes' ),
		getDescription: () =>
			translate(
				'Access to a wide range of professional theme templates ' +
					"for your website so you can find the exact design you're looking for."
			),
	},

	[ constants.FEATURE_3GB_STORAGE ]: {
		getSlug: () => constants.FEATURE_3GB_STORAGE,
		getTitle: () => translate( '3GB Storage Space' ),
		getDescription: () =>
			translate( 'Storage space for adding images and documents to your website.' ),
	},

	[ constants.FEATURE_6GB_STORAGE ]: {
		getSlug: () => constants.FEATURE_6GB_STORAGE,
		getTitle: () =>
			translate( '{{strong}}6GB{{/strong}} Storage Space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			translate(
				"With increased storage space you'll be able to upload " +
					'more images, audio, and documents to your website.'
			),
	},

	[ constants.FEATURE_13GB_STORAGE ]: {
		getSlug: () => constants.FEATURE_13GB_STORAGE,
		getTitle: () =>
			translate( '{{strong}}13GB{{/strong}} Storage Space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			translate(
				"With increased storage space you'll be able to upload " +
					'more images, videos, audio, and documents to your website.'
			),
	},

	[ constants.FEATURE_COMMUNITY_SUPPORT ]: {
		getSlug: () => constants.FEATURE_COMMUNITY_SUPPORT,
		getTitle: () => translate( 'Community support' ),
		getDescription: () => translate( 'Get support through our ' + 'user community forums.' ),
	},

	[ constants.FEATURE_EMAIL_SUPPORT ]: {
		getSlug: () => constants.FEATURE_EMAIL_SUPPORT,
		getTitle: () => translate( 'Email Support' ),
		getDescription: () =>
			translate(
				'High quality email support to help you get your website up and running and working how you want it.'
			),
	},

	[ constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT ]: {
		getSlug: () => constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT,
		getTitle: () => translate( 'Email & Live Chat Support' ),
		getDescription: () => translate( 'Live chat support to help you get started with your site.' ),
	},

	[ constants.FEATURE_PREMIUM_SUPPORT ]: {
		getSlug: () => constants.FEATURE_PREMIUM_SUPPORT,
		getTitle: () => translate( 'Priority Support' ),
		getDescription: () => translate( 'Live chat support to help you get started with Jetpack.' ),
	},

	[ constants.FEATURE_STANDARD_SECURITY_TOOLS ]: {
		getSlug: () => constants.FEATURE_STANDARD_SECURITY_TOOLS,
		getTitle: () => translate( 'Standard Security Tools' ),
		getDescription: () =>
			translate(
				'Brute force protection, downtime monitoring, secure sign on, ' +
					'and automatic updates for your plugins.'
			),
	},
	[ constants.FEATURE_SITE_STATS ]: {
		getSlug: () => constants.FEATURE_SITE_STATS,
		getTitle: () => translate( 'Site Stats and Analytics' ),
		getDescription: () => translate( 'The most important metrics for your site.' ),
	},
	[ constants.FEATURE_TRAFFIC_TOOLS ]: {
		getSlug: () => constants.FEATURE_TRAFFIC_TOOLS,
		getTitle: () => translate( 'Traffic and Promotion Tools' ),
		getDescription: () =>
			translate( 'Build and engage your audience with more than a dozen optimization tools.' ),
	},
	[ constants.FEATURE_MANAGE ]: {
		getSlug: () => constants.FEATURE_MANAGE,
		getTitle: () => translate( 'Centralized Dashboard' ),
		getDescription: () => translate( 'Manage all of your WordPress sites from one location.' ),
	},
	[ constants.FEATURE_SPAM_AKISMET_PLUS ]: {
		getSlug: () => constants.FEATURE_SPAM_AKISMET_PLUS,
		getTitle: () => translate( 'Spam Protection' ),
		getDescription: () => translate( 'State-of-the-art spam defense, powered by Akismet.' ),
	},
	[ constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY ]: {
		getSlug: () => constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
		getTitle: () =>
			translate( '{{strong}}Daily{{/strong}} Backups', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			translate(
				'Automatic daily backups of your entire site, with ' +
					'unlimited, WordPress-optimized secure storage.'
			),
	},
	[ constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME ]: {
		getSlug: () => constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
		getTitle: () =>
			translate( '{{strong}}Real-time{{/strong}} Backups', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			translate(
				'Automatic real-time backups of every single aspect of your site. ' +
					'Stored safely and optimized for WordPress.'
			),
	},
	[ constants.FEATURE_BACKUP_ARCHIVE_30 ]: {
		getSlug: () => constants.FEATURE_BACKUP_ARCHIVE_30,
		getTitle: () => translate( '30-day Backup Archive' ),
		getDescription: () => translate( 'Browse or restore any backup made within the past 30 days.' ),
	},
	[ constants.FEATURE_BACKUP_ARCHIVE_15 ]: {
		getSlug: () => constants.FEATURE_BACKUP_ARCHIVE_15,
		getTitle: () => translate( '15-day Backup Archive' ),
		getDescription: () => translate( 'Browse or restore any backup made within the past 15 days.' ),
	},
	[ constants.FEATURE_BACKUP_ARCHIVE_UNLIMITED ]: {
		getSlug: () => constants.FEATURE_BACKUP_ARCHIVE_UNLIMITED,
		getTitle: () => translate( 'Unlimited Backup Archive' ),
		getDescription: () =>
			translate( 'Browse or restore any backup made since you activated the service.' ),
	},
	[ constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED ]: {
		getSlug: () => constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
		getTitle: () => translate( 'Unlimited Backup Storage Space' ),
		getDescription: () => translate( 'Absolutely no limits on storage space for your backups.' ),
	},
	[ constants.FEATURE_AUTOMATED_RESTORES ]: {
		getSlug: () => constants.FEATURE_AUTOMATED_RESTORES,
		getTitle: () => translate( 'Automated Restores' ),
		getDescription: () =>
			translate( 'Restore your site from any available backup with a single click.' ),
	},
	[ constants.FEATURE_EASY_SITE_MIGRATION ]: {
		getSlug: () => constants.FEATURE_EASY_SITE_MIGRATION,
		getTitle: () => translate( 'Easy Site Migration' ),
		getDescription: () =>
			translate( 'Easily and quickly move or duplicate your site to any location.' ),
	},
	[ constants.FEATURE_MALWARE_SCANNING_DAILY ]: {
		getSlug: () => constants.FEATURE_MALWARE_SCANNING_DAILY,
		getTitle: () =>
			translate( '{{strong}}Daily{{/strong}} Malware Scanning', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			translate(
				'Comprehensive, automated scanning for security vulnerabilities or threats on your site.'
			),
	},
	[ constants.FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND ]: {
		getSlug: () => constants.FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
		getTitle: () => translate( 'Daily and On-demand Malware Scanning' ),
		getDescription: () =>
			translate(
				'Automated security scanning with the option to run complete site scans at any time.'
			),
	},
	[ constants.FEATURE_ONE_CLICK_THREAT_RESOLUTION ]: {
		getSlug: () => constants.FEATURE_ONE_CLICK_THREAT_RESOLUTION,
		getTitle: () => translate( 'One-click Threat Resolution' ),
		getDescription: () =>
			translate( 'Repair any security issues found on your site with just a single click.' ),
	},
	[ constants.FEATURE_AUTOMATIC_SECURITY_FIXES ]: {
		getSlug: () => constants.FEATURE_AUTOMATIC_SECURITY_FIXES,
		getTitle: () =>
			translate( '{{strong}}Automatic{{/strong}} Security Fixes', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			translate(
				'Automated and immediate resolution for a large percentage of known security vulnerabilities or threats.'
			),
	},
	[ constants.FEATURE_ACTIVITY_LOG ]: {
		getSlug: () => constants.FEATURE_ACTIVITY_LOG,
		getTitle: () => translate( 'Expanded Site Activity' ),
		getDescription: () =>
			translate(
				'Take the guesswork out of site management and debugging with a filterable record of all the activity happening on your site.'
			),
	},
	[ constants.FEATURE_POLLS_PRO ]: {
		getSlug: () => constants.FEATURE_POLLS_PRO,
		getTitle: () => translate( 'Advanced Polls and Ratings' ),
		getDescription: () =>
			translate(
				'Custom polls, surveys, ratings, and quizzes for the ultimate in customer and reader engagement.'
			),
	},

	[ constants.FEATURE_CORE_JETPACK ]: {
		getSlug: () => constants.FEATURE_CORE_JETPACK,
		getTitle: () => translate( 'Core Jetpack Services' ),
		getDescription: () => translate( 'Stats, themes, and promotion tools.' ),
		hideInfoPopover: true,
	},
	[ constants.FEATURE_BASIC_SECURITY_JETPACK ]: {
		getSlug: () => constants.FEATURE_BASIC_SECURITY_JETPACK,
		getTitle: () => translate( 'Basic Security' ),
		getDescription: () =>
			translate( 'Brute force protection, monitoring, secure logins, updates.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_BASIC_SUPPORT_JETPACK ]: {
		getSlug: () => constants.FEATURE_BASIC_SUPPORT_JETPACK,
		getTitle: () => translate( 'Basic Support' ),
		getDescription: () => translate( 'Free support to help you make the most of Jetpack.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SPEED_JETPACK ]: {
		getSlug: () => constants.FEATURE_SPEED_JETPACK,
		getTitle: () => translate( 'Speed and Storage' ),
		getDescription: () =>
			translate( 'Unlimited use of our high speed image content delivery network.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SPEED_ADVANCED_JETPACK ]: {
		getSlug: () => constants.FEATURE_SPEED_ADVANCED_JETPACK,
		getTitle: () => translate( 'Speed and Storage' ),
		getDescription: () => translate( 'Also includes 13Gb of high-speed, ad-free video hosting.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SPEED_UNLIMITED_JETPACK ]: {
		getSlug: () => constants.FEATURE_SPEED_UNLIMITED_JETPACK,
		getTitle: () => translate( 'Speed and Storage' ),
		getDescription: () =>
			translate( 'Also includes unlimited, high-speed, ad-free video hosting.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SITE_BACKUPS_JETPACK ]: {
		getSlug: () => constants.FEATURE_SITE_BACKUPS_JETPACK,
		getTitle: () => translate( 'Site Backups' ),
		getDescription: () =>
			translate(
				'Automated daily backups (unlimited storage), one-click restores, and 30-day archive.'
			),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SECURITY_SCANNING_JETPACK ]: {
		getSlug: () => constants.FEATURE_SECURITY_SCANNING_JETPACK,
		getTitle: () => translate( 'Advanced Security' ),
		getDescription: () =>
			translate( 'Also includes daily scans for malware and security threats.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_REVENUE_GENERATION_JETPACK ]: {
		getSlug: () => constants.FEATURE_REVENUE_GENERATION_JETPACK,
		getTitle: () => translate( 'Revenue Generation' ),
		getDescription: () => translate( 'High-quality ads to generate income from your site.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_VIDEO_HOSTING_JETPACK ]: {
		getSlug: () => constants.FEATURE_VIDEO_HOSTING_JETPACK,
		getTitle: () => translate( 'Video Hosting' ),
		getDescription: () => translate( '13Gb of high-speed, HD, and ad-free video hosting.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SECURITY_ESSENTIALS_JETPACK ]: {
		getSlug: () => constants.FEATURE_SECURITY_ESSENTIALS_JETPACK,
		getTitle: () => translate( 'Essential Security' ),
		getDescription: () =>
			translate( 'Daily backups, unlimited storage, one-click restores, spam filtering.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_PRIORITY_SUPPORT_JETPACK ]: {
		getSlug: () => constants.FEATURE_PRIORITY_SUPPORT_JETPACK,
		getTitle: () => translate( 'Priority Support' ),
		getDescription: () => translate( 'Faster response times from our security experts.' ),
		hideInfoPopover: true,
	},
	[ constants.FEATURE_TRAFFIC_TOOLS_JETPACK ]: {
		getSlug: () => constants.FEATURE_TRAFFIC_TOOLS_JETPACK,
		getTitle: () => translate( 'Advanced Traffic Tools' ),
		getDescription: () => translate( 'Automatically re-promote existing content to social media.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_ADVANCED_TRAFFIC_TOOLS_JETPACK ]: {
		getSlug: () => constants.FEATURE_ADVANCED_TRAFFIC_TOOLS_JETPACK,
		getTitle: () => translate( 'Advanced Traffic Tools' ),
		getDescription: () => translate( 'Also includes SEO previews and Google Analytics.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_CONCIERGE_SETUP ]: {
		getSlug: () => constants.FEATURE_CONCIERGE_SETUP,
		getTitle: () => translate( 'Concierge Setup' ),
		getDescription: () =>
			translate( 'A complimentary one-on-one orientation session with a Jetpack expert.' ),
	},

	[ constants.FEATURE_MARKETING_AUTOMATION ]: {
		getSlug: () => constants.FEATURE_MARKETING_AUTOMATION,
		getTitle: () => translate( 'Social Media Automation' ),
		getDescription: () =>
			translate(
				'Re-share previously published content on social media, or schedule new shares in advance.'
			),
	},

	[ constants.FEATURE_SEARCH ]: {
		getSlug: () => constants.FEATURE_SEARCH,
		getTitle: () =>
			translate( '{{strong}}Enhanced{{/strong}} Site-wide Search', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			translate( 'Fast, relevant search results with custom filtering, powered by Elasticsearch.' ),
	},

	[ constants.FEATURE_ACCEPT_PAYMENTS ]: {
		getSlug: () => constants.FEATURE_ACCEPT_PAYMENTS,
		getTitle: () => translate( 'Accept Payments in 60+ Countries' ),
		getDescription: () =>
			translate(
				'Built-in payment processing from leading providers like Stripe, PayPal, and more. Accept payments from customers all over the world.'
			),
	},

	[ constants.FEATURE_SHIPPING_CARRIERS ]: {
		getSlug: () => constants.FEATURE_SHIPPING_CARRIERS,
		getTitle: () => translate( 'Integrations with Top Shipping Carriers' ),
		getDescription: () =>
			translate(
				'Ship physical products in a snap - show live rates from shipping carriers like UPS and other shipping options.'
			),
	},

	[ constants.FEATURE_UNLIMITED_PRODUCTS_SERVICES ]: {
		getSlug: () => constants.FEATURE_UNLIMITED_PRODUCTS_SERVICES,
		getTitle: () => translate( 'Unlimited Products or Services' ),
		getDescription: () =>
			translate(
				'Grow your store as big as you want with the ability to add and sell unlimited products and services.'
			),
	},

	[ constants.FEATURE_ECOMMERCE_MARKETING ]: {
		getSlug: () => constants.FEATURE_ECOMMERCE_MARKETING,
		getTitle: () => translate( 'eCommerce Marketing Tools' ),
		getDescription: () =>
			translate(
				'Optimize your store for sales by adding in email and social integrations with Facebook and Mailchimp, and more.'
			),
	},

	[ constants.FEATURE_PREMIUM_CUSTOMIZABE_THEMES ]: {
		getSlug: () => constants.FEATURE_PREMIUM_CUSTOMIZABE_THEMES,
		getTitle: () => translate( 'Premium Customizable Starter Themes' ),
		getDescription: () =>
			translate(
				'Quickly get up and running with a beautiful store theme and additional design options that you can easily make your own.'
			),
	},

	[ constants.FEATURE_ALL_BUSINESS_FEATURES ]: {
		getSlug: () => constants.FEATURE_ALL_BUSINESS_FEATURES,
		getTitle: () => translate( 'All Business Features' ),
		getDescription: () =>
			translate(
				'Including the ability to upload plugins and themes, priority support, advanced monetization options, and unlimited premium themes.'
			),
	},
};

export const getPlanFeaturesObject = planFeaturesList => {
	return planFeaturesList.map( featuresConst => FEATURES_LIST[ featuresConst ] );
};

export function getValidFeatureKeys() {
	return Object.keys( FEATURES_LIST );
}

export function isValidFeatureKey( feature ) {
	return !! FEATURES_LIST[ feature ];
}

export function getFeatureByKey( feature ) {
	return FEATURES_LIST[ feature ];
}

export function getFeatureTitle( feature ) {
	return invoke( FEATURES_LIST, [ feature, 'getTitle' ] );
}
