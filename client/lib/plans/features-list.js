/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';
import { invoke } from 'lodash';

/**
 * Internal dependencies
 */
import * as constants from './constants';
import { DOMAIN_PRICING_AND_AVAILABLE_TLDS } from 'lib/url/support';
import ExternalLinkWithTracking from 'components/external-link/with-tracking';

export const FEATURES_LIST = {
	[ constants.FEATURE_BLANK ]: {
		getSlug: () => constants.FEATURE_BLANK,
		getTitle: () => '',
	},

	[ constants.FEATURE_ALL_FREE_FEATURES_JETPACK ]: {
		getSlug: () => constants.FEATURE_ALL_FREE_FEATURES_JETPACK,
		getTitle: () =>
			i18n.translate( '{{a}}All free features{{/a}}', {
				components: {
					a: (
						<ExternalLinkWithTracking
							href="https://jetpack.com/features/comparison"
							target="_blank"
							tracksEventName="calypso_plan_link_click"
							tracksEventProps={ {
								link_location: 'plan_features_list_item',
								link_slug: constants.FEATURE_ALL_FREE_FEATURES_JETPACK,
							} }
						/>
					),
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Also includes all features offered in the free version of Jetpack.' ),
	},

	[ constants.FEATURE_ALL_FREE_FEATURES ]: {
		getSlug: () => constants.FEATURE_ALL_FREE_FEATURES,
		getTitle: () => i18n.translate( 'All free features' ),
		getDescription: () => i18n.translate( 'Also includes all features offered in the free plan.' ),
	},

	[ constants.FEATURE_ALL_PERSONAL_FEATURES_JETPACK ]: {
		getSlug: () => constants.FEATURE_ALL_PERSONAL_FEATURES_JETPACK,
		getTitle: () =>
			i18n.translate( '{{a}}All Personal features{{/a}}', {
				components: {
					a: (
						<ExternalLinkWithTracking
							href="https://jetpack.com/features/comparison"
							target="_blank"
							tracksEventName="calypso_plan_link_click"
							tracksEventProps={ {
								link_location: 'plan_features_list_item',
								link_slug: constants.FEATURE_ALL_PERSONAL_FEATURES_JETPACK,
							} }
						/>
					),
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Also includes all features offered in the Personal plan.' ),
	},

	[ constants.FEATURE_ALL_PERSONAL_FEATURES ]: {
		getSlug: () => constants.FEATURE_ALL_PERSONAL_FEATURES,
		getTitle: () => i18n.translate( 'All Personal features' ),
		getDescription: () =>
			i18n.translate(
				'Including email and live chat support, an ad-free experience for your visitors, increased storage space, and a custom domain name for one year.'
			),
	},

	[ constants.FEATURE_ALL_PREMIUM_FEATURES_JETPACK ]: {
		getSlug: () => constants.FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
		getTitle: () =>
			i18n.translate( '{{a}}All Premium features{{/a}}', {
				components: {
					a: (
						<ExternalLinkWithTracking
							href="https://jetpack.com/features/comparison"
							target="_blank"
							tracksEventName="calypso_plan_link_click"
							tracksEventProps={ {
								link_location: 'plan_features_list_item',
								link_slug: constants.FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
							} }
						/>
					),
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Also includes all features offered in the Premium plan.' ),
	},

	[ constants.FEATURE_ALL_PREMIUM_FEATURES ]: {
		getSlug: () => constants.FEATURE_ALL_PREMIUM_FEATURES,
		getTitle: () => i18n.translate( 'All Premium features' ),
		getDescription: () =>
			i18n.translate(
				'Including unlimited premium themes, advanced design and monetization options, simple payment buttons, and a custom domain name for one year.'
			),
	},

	[ constants.FEATURE_ADVANCED_CUSTOMIZATION ]: {
		getSlug: () => constants.FEATURE_ADVANCED_CUSTOMIZATION,
		getTitle: () => i18n.translate( 'Advanced customization' ),
		getDescription: () =>
			i18n.translate(
				'Access extended color schemes, backgrounds, and CSS, giving you complete control over how your site looks.'
			),
	},

	[ constants.FEATURE_FREE_BLOG_DOMAIN ]: {
		getSlug: () => constants.FEATURE_FREE_BLOG_DOMAIN,
		getTitle: () => i18n.translate( 'Free .blog domain for one year' ),
		getDescription: () =>
			i18n.translate(
				'Get a free custom .blog domain for one year. Premium domains not included. Your domain will renew at its regular price.'
			),
	},

	[ constants.FEATURE_FREE_DOMAIN ]: {
		getSlug: () => constants.FEATURE_FREE_DOMAIN,
		getTitle: () => i18n.translate( 'Free Domain for One Year' ),
		getDescription: () =>
			i18n.translate(
				'Get a free domain for one year. ' +
					'Doesn’t apply to plan upgrades, renewals, or to premium domains. ' +
					'After one year, domain renews at its {{a}}regular price{{/a}}.',
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
		getTitle: () => i18n.translate( 'Unlimited premium themes' ),
		getDescription: () =>
			i18n.translate(
				'Unlimited access to all of our advanced premium themes, including designs specifically tailored for businesses.'
			),
	},

	[ constants.FEATURE_MONETISE ]: {
		getSlug: () => constants.FEATURE_MONETISE,
		getTitle: () => i18n.translate( 'Monetize your site with ads' ),
		getDescription: () =>
			i18n.translate(
				'Add advertising to your site through our WordAds program and earn money from impressions.'
			),
	},

	[ constants.FEATURE_UPLOAD_THEMES_PLUGINS ]: {
		getSlug: () => constants.FEATURE_UPLOAD_THEMES_PLUGINS,
		getTitle: () => i18n.translate( 'Upload Themes and Plugins' ),
		getDescription: () => i18n.translate( 'Upload custom themes and plugins on your site.' ),
	},

	[ constants.FEATURE_GOOGLE_ANALYTICS_SIGNUP ]: {
		getSlug: () => constants.FEATURE_GOOGLE_ANALYTICS_SIGNUP,
		getTitle: () => i18n.translate( 'Google Analytics' ),
	},

	[ constants.FEATURE_EMAIL_SUPPORT_SIGNUP ]: {
		getSlug: () => constants.FEATURE_EMAIL_SUPPORT_SIGNUP,
		getTitle: () => i18n.translate( 'Email support' ),
		getDescription: () =>
			i18n.translate(
				'High quality email support to help you get your website up and running and working how you want it.'
			),
	},

	[ constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_SIGNUP ]: {
		getSlug: () => constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_SIGNUP,
		getTitle: () => i18n.translate( 'Email and live chat support' ),
		getDescription: () =>
			i18n.translate(
				'High quality support to help you get your website up and running and working how you want it.'
			),
	},

	[ constants.FEATURE_FREE_THEMES_SIGNUP ]: {
		getSlug: () => constants.FEATURE_FREE_THEMES_SIGNUP,
		getTitle: () => i18n.translate( 'Dozens of Free Themes' ),
		getDescription: () =>
			i18n.translate(
				"Access to a wide range of professional themes so you can find a design that's just right for your site."
			),
	},

	[ constants.FEATURE_WP_SUBDOMAIN_SIGNUP ]: {
		getSlug: () => constants.FEATURE_WP_SUBDOMAIN_SIGNUP,
		getTitle: () => i18n.translate( 'WordPress.com subdomain' ),
		getDescription: () =>
			i18n.translate(
				'Your site address will use a WordPress.com subdomain (sitename.wordpress.com).'
			),
	},

	[ constants.FEATURE_UNLIMITED_STORAGE_SIGNUP ]: {
		getSlug: () => constants.FEATURE_UNLIMITED_STORAGE_SIGNUP,
		getTitle: () => i18n.translate( '200 GB storage' ),
		getDescription: () =>
			i18n.translate( 'Upload more images, videos, audio, and documents to your website.' ),
	},

	[ constants.FEATURE_ADVANCED_SEO_TOOLS ]: {
		getSlug: () => constants.FEATURE_ADVANCED_SEO_TOOLS,
		getTitle: () => i18n.translate( 'Advanced SEO tools' ),
		getDescription: () =>
			i18n.translate(
				'Boost traffic to your site with tools that make your content more findable on search engines and social media.'
			),
	},

	[ constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED_SIGNUP ]: {
		getSlug: () => constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED_SIGNUP,
		getTitle: () => i18n.translate( 'Unlimited Backup Space' ),
	},

	[ constants.FEATURE_FREE_WORDPRESS_THEMES ]: {
		getSlug: () => constants.FEATURE_FREE_WORDPRESS_THEMES,
		getTitle: () => i18n.translate( 'Free WordPress Themes' ),
	},

	[ constants.FEATURE_VIDEO_CDN_LIMITED ]: {
		getSlug: () => constants.FEATURE_VIDEO_CDN_LIMITED,
		getTitle: () => i18n.translate( '13 GB Video Storage' ),
		getDescription: () =>
			i18n.translate(
				'High-speed video hosting on our CDN, free of ads and watermarks, fully optimized for WordPress.'
			),
	},

	[ constants.FEATURE_VIDEO_CDN_UNLIMITED ]: {
		getSlug: () => constants.FEATURE_VIDEO_CDN_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited Video Storage' ),
	},

	[ constants.FEATURE_SEO_PREVIEW_TOOLS ]: {
		getSlug: () => constants.FEATURE_SEO_PREVIEW_TOOLS,
		getTitle: () => i18n.translate( 'SEO Tools' ),
		getDescription: () =>
			i18n.translate(
				'Edit your page titles and meta descriptions, and preview how your content will appear on social media.'
			),
	},

	[ constants.FEATURE_GOOGLE_ANALYTICS ]: {
		getSlug: () => constants.FEATURE_GOOGLE_ANALYTICS,
		getTitle: () => i18n.translate( 'Google Analytics Integration' ),
		getDescription: () =>
			i18n.translate(
				"Track your site's stats with Google Analytics for a " +
					'deeper understanding of your visitors and customers.'
			),
	},

	[ constants.FEATURE_GOOGLE_MY_BUSINESS ]: {
		getSlug: () => constants.FEATURE_GOOGLE_MY_BUSINESS,
		getTitle: () => i18n.translate( 'Google My Business' ),
		getDescription: () =>
			i18n.translate(
				'See how customers find you on Google -- and whether they visited your site ' +
					'and looked for more info on your business -- by connecting to a Google My Business location.'
			),
	},

	[ constants.FEATURE_UNLIMITED_STORAGE ]: {
		getSlug: () => constants.FEATURE_UNLIMITED_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}200 GB{{/strong}} Storage Space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Upload more images, videos, audio, and documents to your website.' ),
		getStoreSlug: () => 'unlimited_space',
	},

	[ constants.FEATURE_BLOG_DOMAIN ]: {
		getSlug: () => constants.FEATURE_BLOG_DOMAIN,
		getTitle: () =>
			i18n.translate( 'Free .blog Domain for One Year', {
				context: 'title',
			} ),
		getDescription: ( abtest, domainName ) => {
			if ( domainName ) {
				return i18n.translate( 'Your domain (%s) is included with this plan.', {
					args: domainName,
				} );
			}

			return i18n.translate(
				'Get a free custom .blog domain for one year. Premium domains not included. Your domain will renew at its regular price.'
			);
		},
	},

	[ constants.FEATURE_CUSTOM_DOMAIN ]: {
		getSlug: () => constants.FEATURE_CUSTOM_DOMAIN,
		getTitle: () =>
			i18n.translate( 'Free Domain for One Year', {
				context: 'title',
			} ),
		getDescription: ( abtest, domainName ) => {
			if ( domainName ) {
				return i18n.translate( 'Your domain (%s) is included with this plan.', {
					args: domainName,
				} );
			}

			return i18n.translate(
				'Get a free domain for one year. ' +
					'Doesn’t apply to plan upgrades, renewals, or to premium domains. ' +
					'After one year, domain renews at its {{a}}regular price{{/a}}.',
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
		getTitle: () => i18n.translate( 'Jetpack Essential Features' ),
		getDescription: () =>
			i18n.translate(
				'Optimize your site for better SEO, faster-loading pages, and protection from spam.'
			),
	},

	[ constants.FEATURE_JETPACK_ADVANCED ]: {
		getSlug: () => constants.FEATURE_JETPACK_ADVANCED,
		getTitle: () => i18n.translate( 'Jetpack Advanced Features' ),
		getDescription: () =>
			i18n.translate(
				'Speed up your site’s performance and protect it from spammers. ' +
					'Access detailed records of all activity on your site and restore your site ' +
					'to a previous point in time with just a click! While you’re at it, ' +
					'improve your SEO with our Advanced SEO tools and automate social media sharing.'
			),
	},

	[ constants.FEATURE_UNLIMITED_PREMIUM_THEMES ]: {
		getSlug: () => constants.FEATURE_UNLIMITED_PREMIUM_THEMES,
		getTitle: () =>
			i18n.translate( '{{strong}}Unlimited{{/strong}} Premium Themes', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Unlimited access to all of our advanced premium themes, ' +
					'including designs specifically tailored for businesses.'
			),
		getStoreSlug: () => 'unlimited_themes',
	},

	[ constants.FEATURE_VIDEO_UPLOADS ]: {
		getSlug: () => constants.FEATURE_VIDEO_UPLOADS,
		getTitle: () => i18n.translate( 'VideoPress Support' ),
		getDescription: () =>
			i18n.translate(
				'The easiest way to upload videos to your website and display them ' +
					'using a fast, unbranded, customizable player with rich stats.'
			),
		getStoreSlug: () => 'videopress',
	},

	[ constants.FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM ]: {
		getSlug: () => constants.FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM,
		getTitle: () => i18n.translate( 'VideoPress Support' ),
		getDescription: () =>
			i18n.translate(
				'Easy video uploads, and a fast, unbranded, customizable video player, ' +
					'enhanced with rich stats and unlimited storage space. '
			),
		getStoreSlug: () => 'videopress',
	},

	[ constants.FEATURE_VIDEO_UPLOADS_JETPACK_PRO ]: {
		getSlug: () => constants.FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
		getTitle: () =>
			i18n.translate( '{{strong}}Unlimited{{/strong}} Video Hosting', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Easy video uploads, and a fast, unbranded, customizable video player, ' +
					'enhanced with rich stats and unlimited storage space. '
			),
		getStoreSlug: () => 'videopress',
	},

	[ constants.FEATURE_AUDIO_UPLOADS ]: {
		getSlug: () => constants.FEATURE_AUDIO_UPLOADS,
		getTitle: () => i18n.translate( 'Audio Upload Support' ),
		getDescription: () =>
			i18n.translate(
				'The easiest way to upload audio files that use any major audio file format. '
			),
		getStoreSlug: () => 'videopress',
	},

	[ constants.FEATURE_BASIC_DESIGN ]: {
		getSlug: () => constants.FEATURE_BASIC_DESIGN,
		getTitle: () => i18n.translate( 'Basic Design Customization' ),
		getDescription: () =>
			i18n.translate(
				'Customize your selected theme with pre-set color schemes, ' +
					'background designs, and font styles.'
			),
		getStoreSlug: () => constants.FEATURE_ADVANCED_DESIGN,
	},

	[ constants.FEATURE_ADVANCED_DESIGN ]: {
		getSlug: () => constants.FEATURE_ADVANCED_DESIGN,
		getTitle: () =>
			i18n.translate( '{{strong}}Advanced{{/strong}} Design Customization', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Access extended color schemes, backgrounds, and CSS, giving you complete control over how your site looks.'
			),
		getStoreSlug: () => constants.FEATURE_ADVANCED_DESIGN,
	},

	[ constants.FEATURE_NO_ADS ]: {
		getSlug: () => constants.FEATURE_NO_ADS,
		getTitle: () => i18n.translate( 'Remove WordPress.com Ads' ),
		getDescription: () =>
			i18n.translate(
				'Allow your visitors to visit and read your website without ' +
					'seeing any WordPress.com advertising.'
			),
		getStoreSlug: () => 'no-adverts/no-adverts.php',
	},
	[ constants.FEATURE_REPUBLICIZE ]: {
		getSlug: () => constants.FEATURE_REPUBLICIZE,
		getTitle: () => i18n.translate( 'Advanced Social Media' ),
		getDescription: () =>
			i18n.translate(
				"Schedule your social media updates in advance and promote your posts when it's best for you."
			),
	},
	[ constants.FEATURE_SIMPLE_PAYMENTS ]: {
		getSlug: () => constants.FEATURE_SIMPLE_PAYMENTS,
		getTitle: () => i18n.translate( 'Simple Payments' ),
		getDescription: () => i18n.translate( 'Sell anything with a simple PayPal button.' ),
	},
	[ constants.FEATURE_NO_BRANDING ]: {
		getSlug: () => constants.FEATURE_NO_BRANDING,
		getTitle: () => i18n.translate( 'Remove WordPress.com Branding' ),
		getDescription: () =>
			i18n.translate(
				"Keep the focus on your site's brand by removing the WordPress.com footer branding."
			),
		getStoreSlug: () => 'no-adverts/no-adverts.php',
	},

	[ constants.FEATURE_BUSINESS_ONBOARDING ]: {
		getSlug: () => constants.FEATURE_BUSINESS_ONBOARDING,
		getTitle: () => i18n.translate( 'Get Personalized Help' ),
		getDescription: () =>
			i18n.translate(
				"Meet one-on-one with a WordPress.com expert who'll help you set up your site exactly as you need it."
			),
	},

	[ constants.FEATURE_ADVANCED_SEO ]: {
		getSlug: () => constants.FEATURE_ADVANCED_SEO,
		getTitle: () => i18n.translate( 'SEO Tools' ),
		getDescription: () =>
			i18n.translate(
				'Boost traffic to your site with tools that make your content more findable on search engines and social media.'
			),
	},

	[ constants.FEATURE_UPLOAD_PLUGINS ]: {
		getSlug: () => constants.FEATURE_UPLOAD_PLUGINS,
		getTitle: () => i18n.translate( 'Install Plugins' ),
		getDescription: () =>
			i18n.translate(
				'Plugins extend the functionality of your site and ' +
					'open up endless possibilities for presenting your content and interacting with visitors.'
			),
	},

	[ constants.FEATURE_UPLOAD_THEMES ]: {
		getSlug: () => constants.FEATURE_UPLOAD_THEMES,
		getTitle: () => i18n.translate( 'Install Themes' ),
		getDescription: () =>
			i18n.translate(
				'With the option to upload themes, you can give your site a professional polish ' +
					'that will help it stand out among the rest.'
			),
	},

	[ constants.FEATURE_WORDADS_INSTANT ]: {
		getSlug: () => constants.FEATURE_WORDADS_INSTANT,
		getTitle: () => i18n.translate( 'Site Monetization' ),
		getDescription: () =>
			i18n.translate(
				'Earn money on your site by displaying ads and collecting recurring payments or donations.'
			),
	},

	[ constants.FEATURE_WP_SUBDOMAIN ]: {
		getSlug: () => constants.FEATURE_WP_SUBDOMAIN,
		getTitle: () => i18n.translate( 'WordPress.com Subdomain' ),
		getDescription: () =>
			i18n.translate(
				'Your site address will use a WordPress.com subdomain (sitename.wordpress.com).'
			),
	},

	[ constants.FEATURE_FREE_THEMES ]: {
		getSlug: () => constants.FEATURE_FREE_THEMES,
		getTitle: () => i18n.translate( 'Dozens of Free Themes' ),
		getDescription: () =>
			i18n.translate(
				'Access to a wide range of professional themes ' +
					"so you can find a design that's just right for your site."
			),
	},

	[ constants.FEATURE_3GB_STORAGE ]: {
		getSlug: () => constants.FEATURE_3GB_STORAGE,
		getTitle: () => i18n.translate( '3 GB Storage Space' ),
		getDescription: () =>
			i18n.translate( 'Storage space for adding images and documents to your website.' ),
	},

	[ constants.FEATURE_6GB_STORAGE ]: {
		getSlug: () => constants.FEATURE_6GB_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}6 GB{{/strong}} Storage Space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Upload more images, audio, and documents to your website.' ),
	},

	[ constants.FEATURE_13GB_STORAGE ]: {
		getSlug: () => constants.FEATURE_13GB_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}13 GB{{/strong}} Storage Space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Upload more images, videos, audio, and documents to your website.' ),
	},

	[ constants.FEATURE_200GB_STORAGE ]: {
		getSlug: () => constants.FEATURE_200GB_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}200 GB{{/strong}} Storage Space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Upload more images, videos, audio, and documents to your website.' ),
	},

	[ constants.FEATURE_COMMUNITY_SUPPORT ]: {
		getSlug: () => constants.FEATURE_COMMUNITY_SUPPORT,
		getTitle: () => i18n.translate( 'Community support' ),
		getDescription: () => i18n.translate( 'Get support through our ' + 'user community forums.' ),
	},

	[ constants.FEATURE_EMAIL_SUPPORT ]: {
		getSlug: () => constants.FEATURE_EMAIL_SUPPORT,
		getTitle: () => i18n.translate( 'Email Support' ),
		getDescription: () =>
			i18n.translate(
				'High quality email support to help you get your website up and running and working how you want it.'
			),
	},

	[ constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT ]: {
		getSlug: () => constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT,
		getTitle: () => i18n.translate( 'Email & Live Chat Support' ),
		getDescription: () =>
			i18n.translate( 'Live chat support to help you get started with your site.' ),
	},

	[ constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_BUSINESS_DAYS ]: {
		getSlug: () => constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
		getTitle: () => i18n.translate( 'Email & Live Chat Support' ),
		getDescription: () =>
			i18n.translate(
				'Live chat is available 24 hours a day from Monday through Friday. ' +
					'You can also email us any day of the week for personalized support.'
			),
	},

	[ constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS ]: {
		getSlug: () => constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS,
		getTitle: () => i18n.translate( 'Email & Live Chat Support' ),
		getDescription: () =>
			i18n.translate(
				'Live chat is available 24/7. ' +
					'You can also email us any day of the week for personalized support.'
			),
	},

	[ constants.FEATURE_PREMIUM_SUPPORT ]: {
		getSlug: () => constants.FEATURE_PREMIUM_SUPPORT,
		getTitle: () => i18n.translate( 'Priority Support' ),
		getDescription: () =>
			i18n.translate( 'Live chat support to help you get started with Jetpack.' ),
	},

	[ constants.FEATURE_STANDARD_SECURITY_TOOLS ]: {
		getSlug: () => constants.FEATURE_STANDARD_SECURITY_TOOLS,
		getTitle: () => i18n.translate( 'Standard Security Tools' ),
		getDescription: () =>
			i18n.translate(
				'Brute force protection, downtime monitoring, secure sign on, ' +
					'and automatic updates for your plugins.'
			),
	},
	[ constants.FEATURE_SITE_STATS ]: {
		getSlug: () => constants.FEATURE_SITE_STATS,
		getTitle: () => i18n.translate( 'Site Stats and Analytics' ),
		getDescription: () => i18n.translate( 'The most important metrics for your site.' ),
	},
	[ constants.FEATURE_TRAFFIC_TOOLS ]: {
		getSlug: () => constants.FEATURE_TRAFFIC_TOOLS,
		getTitle: () => i18n.translate( 'Traffic and Promotion Tools' ),
		getDescription: () =>
			i18n.translate( 'Build and engage your audience with more than a dozen optimization tools.' ),
	},
	[ constants.FEATURE_MANAGE ]: {
		getSlug: () => constants.FEATURE_MANAGE,
		getTitle: () => i18n.translate( 'Centralized Dashboard' ),
		getDescription: () => i18n.translate( 'Manage all of your WordPress sites from one location.' ),
	},
	[ constants.FEATURE_SPAM_AKISMET_PLUS ]: {
		getSlug: () => constants.FEATURE_SPAM_AKISMET_PLUS,
		getTitle: () => i18n.translate( 'Spam Protection' ),
		getDescription: () => i18n.translate( 'State-of-the-art spam defense, powered by Akismet.' ),
	},
	[ constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY ]: {
		getSlug: () => constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
		getTitle: () =>
			i18n.translate( '{{strong}}Daily{{/strong}} Backups', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Automatic daily backups of your entire site, with ' +
					'unlimited, WordPress-optimized secure storage.'
			),
	},
	[ constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME ]: {
		getSlug: () => constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
		getTitle: () =>
			i18n.translate( '{{strong}}Real-time{{/strong}} Backups', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Automatic real-time backups of every single aspect of your site. ' +
					'Stored safely and optimized for WordPress.'
			),
	},
	[ constants.FEATURE_BACKUP_ARCHIVE_30 ]: {
		getSlug: () => constants.FEATURE_BACKUP_ARCHIVE_30,
		getTitle: () => i18n.translate( '30-day Backup Archive' ),
		getDescription: () =>
			i18n.translate( 'Browse or restore any backup made within the past 30 days.' ),
	},
	[ constants.FEATURE_BACKUP_ARCHIVE_15 ]: {
		getSlug: () => constants.FEATURE_BACKUP_ARCHIVE_15,
		getTitle: () => i18n.translate( '15-day Backup Archive' ),
		getDescription: () =>
			i18n.translate( 'Browse or restore any backup made within the past 15 days.' ),
	},
	[ constants.FEATURE_BACKUP_ARCHIVE_UNLIMITED ]: {
		getSlug: () => constants.FEATURE_BACKUP_ARCHIVE_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited Backup Archive' ),
		getDescription: () =>
			i18n.translate( 'Browse or restore any backup made since you activated the service.' ),
	},
	[ constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED ]: {
		getSlug: () => constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited Backup Storage Space' ),
		getDescription: () =>
			i18n.translate( 'Absolutely no limits on storage space for your backups.' ),
	},
	[ constants.FEATURE_AUTOMATED_RESTORES ]: {
		getSlug: () => constants.FEATURE_AUTOMATED_RESTORES,
		getTitle: () => i18n.translate( 'Automated Restores' ),
		getDescription: () =>
			i18n.translate( 'Restore your site from any available backup with a single click.' ),
	},
	[ constants.FEATURE_EASY_SITE_MIGRATION ]: {
		getSlug: () => constants.FEATURE_EASY_SITE_MIGRATION,
		getTitle: () => i18n.translate( 'Easy Site Migration' ),
		getDescription: () =>
			i18n.translate( 'Easily and quickly move or duplicate your site to any location.' ),
	},
	[ constants.FEATURE_MALWARE_SCANNING_DAILY ]: {
		getSlug: () => constants.FEATURE_MALWARE_SCANNING_DAILY,
		getTitle: () =>
			i18n.translate( '{{strong}}Daily{{/strong}} Malware Scanning', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Comprehensive, automated scanning for security vulnerabilities or threats on your site.'
			),
	},
	[ constants.FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND ]: {
		getSlug: () => constants.FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
		getTitle: () => i18n.translate( 'Daily and On-demand Malware Scanning' ),
		getDescription: () =>
			i18n.translate(
				'Automated security scanning with the option to run complete site scans at any time.'
			),
	},
	[ constants.FEATURE_ONE_CLICK_THREAT_RESOLUTION ]: {
		getSlug: () => constants.FEATURE_ONE_CLICK_THREAT_RESOLUTION,
		getTitle: () => i18n.translate( 'One-click Threat Resolution' ),
		getDescription: () =>
			i18n.translate( 'Repair any security issues found on your site with just a single click.' ),
	},
	[ constants.FEATURE_AUTOMATIC_SECURITY_FIXES ]: {
		getSlug: () => constants.FEATURE_AUTOMATIC_SECURITY_FIXES,
		getTitle: () =>
			i18n.translate( '{{strong}}Automatic{{/strong}} Security Fixes', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Automated and immediate resolution for a large percentage of known security vulnerabilities or threats.'
			),
	},
	[ constants.FEATURE_ACTIVITY_LOG ]: {
		getSlug: () => constants.FEATURE_ACTIVITY_LOG,
		getTitle: () => i18n.translate( 'Expanded Site Activity' ),
		getDescription: () =>
			i18n.translate(
				'Take the guesswork out of site management and debugging with a filterable record of all the activity happening on your site.'
			),
	},
	[ constants.FEATURE_POLLS_PRO ]: {
		getSlug: () => constants.FEATURE_POLLS_PRO,
		getTitle: () => i18n.translate( 'Advanced Polls and Ratings' ),
		getDescription: () =>
			i18n.translate(
				'Custom polls, surveys, ratings, and quizzes for the ultimate in customer and reader engagement.'
			),
	},

	[ constants.FEATURE_CORE_JETPACK ]: {
		getSlug: () => constants.FEATURE_CORE_JETPACK,
		getTitle: () => i18n.translate( 'Core Jetpack Services' ),
		getDescription: () => i18n.translate( 'Stats, themes, and promotion tools.' ),
		hideInfoPopover: true,
	},
	[ constants.FEATURE_BASIC_SECURITY_JETPACK ]: {
		getSlug: () => constants.FEATURE_BASIC_SECURITY_JETPACK,
		getTitle: () => i18n.translate( 'Basic Security' ),
		getDescription: () =>
			i18n.translate( 'Brute force protection, monitoring, secure logins, updates.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_BASIC_SUPPORT_JETPACK ]: {
		getSlug: () => constants.FEATURE_BASIC_SUPPORT_JETPACK,
		getTitle: () => i18n.translate( 'Basic Support' ),
		getDescription: () => i18n.translate( 'Free support to help you make the most of Jetpack.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SPEED_JETPACK ]: {
		getSlug: () => constants.FEATURE_SPEED_JETPACK,
		getTitle: () => i18n.translate( 'Speed and Storage' ),
		getDescription: () =>
			i18n.translate( 'Unlimited use of our high speed image content delivery network.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SPEED_ADVANCED_JETPACK ]: {
		getSlug: () => constants.FEATURE_SPEED_ADVANCED_JETPACK,
		getTitle: () => i18n.translate( 'Speed and Storage' ),
		getDescription: () =>
			i18n.translate( 'Also includes 13 GB of high-speed, ad-free video hosting.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SPEED_UNLIMITED_JETPACK ]: {
		getSlug: () => constants.FEATURE_SPEED_UNLIMITED_JETPACK,
		getTitle: () => i18n.translate( 'Speed and Storage' ),
		getDescription: () =>
			i18n.translate( 'Also includes unlimited, high-speed, ad-free video hosting.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SITE_BACKUPS_JETPACK ]: {
		getSlug: () => constants.FEATURE_SITE_BACKUPS_JETPACK,
		getTitle: () => i18n.translate( 'Site Backups' ),
		getDescription: () =>
			i18n.translate(
				'Automated daily backups (unlimited storage), one-click restores, and 30-day archive.'
			),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SECURITY_SCANNING_JETPACK ]: {
		getSlug: () => constants.FEATURE_SECURITY_SCANNING_JETPACK,
		getTitle: () => i18n.translate( 'Advanced Security' ),
		getDescription: () =>
			i18n.translate( 'Also includes daily scans for malware and security threats.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_REVENUE_GENERATION_JETPACK ]: {
		getSlug: () => constants.FEATURE_REVENUE_GENERATION_JETPACK,
		getTitle: () => i18n.translate( 'Revenue Generation' ),
		getDescription: () => i18n.translate( 'High-quality ads to generate income from your site.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_VIDEO_HOSTING_JETPACK ]: {
		getSlug: () => constants.FEATURE_VIDEO_HOSTING_JETPACK,
		getTitle: () => i18n.translate( 'Video Hosting' ),
		getDescription: () => i18n.translate( '13 GB of high-speed, HD, and ad-free video hosting.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SECURITY_ESSENTIALS_JETPACK ]: {
		getSlug: () => constants.FEATURE_SECURITY_ESSENTIALS_JETPACK,
		getTitle: () => i18n.translate( 'Essential Security' ),
		getDescription: () =>
			i18n.translate( 'Daily backups, unlimited storage, one-click restores, spam filtering.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_PRIORITY_SUPPORT_JETPACK ]: {
		getSlug: () => constants.FEATURE_PRIORITY_SUPPORT_JETPACK,
		getTitle: () => i18n.translate( 'Priority Support' ),
		getDescription: () => i18n.translate( 'Faster response times from our security experts.' ),
		hideInfoPopover: true,
	},
	[ constants.FEATURE_TRAFFIC_TOOLS_JETPACK ]: {
		getSlug: () => constants.FEATURE_TRAFFIC_TOOLS_JETPACK,
		getTitle: () => i18n.translate( 'Advanced Traffic Tools' ),
		getDescription: () =>
			i18n.translate( 'Automatically re-promote existing content to social media.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_ADVANCED_TRAFFIC_TOOLS_JETPACK ]: {
		getSlug: () => constants.FEATURE_ADVANCED_TRAFFIC_TOOLS_JETPACK,
		getTitle: () => i18n.translate( 'Advanced Traffic Tools' ),
		getDescription: () => i18n.translate( 'Also includes SEO previews and Google Analytics.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_CONCIERGE_SETUP ]: {
		getSlug: () => constants.FEATURE_CONCIERGE_SETUP,
		getTitle: () => i18n.translate( 'Concierge Setup' ),
		getDescription: () =>
			i18n.translate( 'A complimentary one-on-one orientation session with a Jetpack expert.' ),
	},

	[ constants.FEATURE_MARKETING_AUTOMATION ]: {
		getSlug: () => constants.FEATURE_MARKETING_AUTOMATION,
		getTitle: () => i18n.translate( 'Social Media Automation' ),
		getDescription: () =>
			i18n.translate(
				'Re-share previously published content on social media, or schedule new shares in advance.'
			),
	},

	[ constants.FEATURE_ACCEPT_PAYMENTS ]: {
		getSlug: () => constants.FEATURE_ACCEPT_PAYMENTS,
		getTitle: () => i18n.translate( 'Accept Payments in 60+ Countries' ),
		getDescription: () =>
			i18n.translate(
				'Built-in payment processing from leading providers like Stripe, PayPal, and more. Accept payments from customers all over the world.'
			),
	},

	[ constants.FEATURE_SHIPPING_CARRIERS ]: {
		getSlug: () => constants.FEATURE_SHIPPING_CARRIERS,
		getTitle: () => i18n.translate( 'Integrations with Top Shipping Carriers' ),
		getDescription: () =>
			i18n.translate(
				'Ship physical products in a snap - show live rates from shipping carriers like UPS and other shipping options.'
			),
	},

	[ constants.FEATURE_UNLIMITED_PRODUCTS_SERVICES ]: {
		getSlug: () => constants.FEATURE_UNLIMITED_PRODUCTS_SERVICES,
		getTitle: () => i18n.translate( 'Unlimited Products or Services' ),
		getDescription: () =>
			i18n.translate(
				'Grow your store as big as you want with the ability to add and sell unlimited products and services.'
			),
	},

	[ constants.FEATURE_ECOMMERCE_MARKETING ]: {
		getSlug: () => constants.FEATURE_ECOMMERCE_MARKETING,
		getTitle: () => i18n.translate( 'eCommerce Marketing Tools' ),
		getDescription: () =>
			i18n.translate(
				'Optimize your store for sales by adding in email and social integrations with Facebook and Mailchimp, and more.'
			),
	},

	[ constants.FEATURE_PREMIUM_CUSTOMIZABE_THEMES ]: {
		getSlug: () => constants.FEATURE_PREMIUM_CUSTOMIZABE_THEMES,
		getTitle: () => i18n.translate( 'Premium Customizable Starter Themes' ),
		getDescription: () =>
			i18n.translate(
				'Quickly get up and running with a beautiful store theme and additional design options that you can easily make your own.'
			),
	},

	[ constants.FEATURE_ALL_BUSINESS_FEATURES ]: {
		getSlug: () => constants.FEATURE_ALL_BUSINESS_FEATURES,
		getTitle: () => i18n.translate( 'All Business Features' ),
		getDescription: () =>
			i18n.translate(
				'Including the ability to upload plugins and themes, priority support, advanced monetization options, and unlimited premium themes.'
			),
	},
};

export const getPlanFeaturesObject = ( planFeaturesList ) => {
	return planFeaturesList.map( ( featuresConst ) => FEATURES_LIST[ featuresConst ] );
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
