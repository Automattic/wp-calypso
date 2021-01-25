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
import MaterialIcon from 'calypso/components/material-icon';
import ExternalLink from 'calypso/components/external-link';
import ExternalLinkWithTracking from 'calypso/components/external-link/with-tracking';
import { DOMAIN_PRICING_AND_AVAILABLE_TLDS } from 'calypso/lib/url/support';

export const FEATURE_CATEGORIES = {
	[ constants.FEATURE_CATEGORY_SECURITY ]: {
		getSlug: () => constants.FEATURE_CATEGORY_SECURITY,
		getTitle: () => i18n.translate( 'Security' ),
	},
	[ constants.FEATURE_CATEGORY_PERFORMANCE ]: {
		getSlug: () => constants.FEATURE_CATEGORY_PERFORMANCE,
		getTitle: () => i18n.translate( 'Performance' ),
	},
	[ constants.FEATURE_CATEGORY_GROWTH ]: {
		getSlug: () => constants.FEATURE_CATEGORY_GROWTH,
		getTitle: () => i18n.translate( 'Growth' ),
	},
	[ constants.FEATURE_CATEGORY_DESIGN ]: {
		getSlug: () => constants.FEATURE_CATEGORY_DESIGN,
		getTitle: () => i18n.translate( 'Design' ),
	},
	[ constants.FEATURE_CATEGORY_OTHER ]: {
		getSlug: () => constants.FEATURE_CATEGORY_OTHER,
		getTitle: () => i18n.translate( 'Other' ),
	},
};

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
		getDescription: () => {
			return i18n.translate(
				'Including unlimited premium themes, advanced design and monetization options, Pay with PayPal buttons, and a custom domain name for one year.'
			);
		},
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
		getTitle: () => i18n.translate( 'Free domain for one year' ),
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
		getTitle: () => i18n.translate( 'Upload themes and plugins' ),
		getDescription: () => i18n.translate( 'Upload custom themes and plugins on your site.' ),
	},

	[ constants.FEATURE_GOOGLE_ANALYTICS_SIGNUP ]: {
		getSlug: () => constants.FEATURE_GOOGLE_ANALYTICS_SIGNUP,
		getTitle: () => i18n.translate( 'Google Analytics' ),
	},

	[ constants.FEATURE_EMAIL_SUPPORT_SIGNUP ]: {
		getSlug: () => constants.FEATURE_EMAIL_SUPPORT_SIGNUP,
		getTitle: () => i18n.translate( 'Unlimited email support' ),
		getDescription: () =>
			i18n.translate( 'Email us any time, any day of the week for personalized, expert support.' ),
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
		getTitle: () => i18n.translate( 'Dozens of free themes' ),
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
		getTitle: () => i18n.translate( 'Unlimited backup space' ),
	},

	[ constants.FEATURE_FREE_WORDPRESS_THEMES ]: {
		getSlug: () => constants.FEATURE_FREE_WORDPRESS_THEMES,
		getTitle: () => i18n.translate( 'Free WordPress Themes' ),
	},

	[ constants.FEATURE_VIDEO_CDN_LIMITED ]: {
		getSlug: () => constants.FEATURE_VIDEO_CDN_LIMITED,
		getTitle: () => i18n.translate( '13 GB video storage' ),
		getDescription: () =>
			i18n.translate(
				'High-speed video hosting on our CDN, free of ads and watermarks, fully optimized for WordPress.'
			),
	},

	[ constants.FEATURE_VIDEO_CDN_UNLIMITED ]: {
		getSlug: () => constants.FEATURE_VIDEO_CDN_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited video storage' ),
	},

	[ constants.FEATURE_SEO_PREVIEW_TOOLS ]: {
		getSlug: () => constants.FEATURE_SEO_PREVIEW_TOOLS,
		getTitle: () => i18n.translate( 'SEO tools' ),
		getDescription: () =>
			i18n.translate(
				'Edit your page titles and meta descriptions, and preview how your content will appear on social media.'
			),
	},

	[ constants.FEATURE_GOOGLE_ANALYTICS ]: {
		getSlug: () => constants.FEATURE_GOOGLE_ANALYTICS,
		getTitle: () => i18n.translate( 'Google Analytics integration' ),
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
			i18n.translate( '{{strong}}200 GB{{/strong}} storage space', {
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
			i18n.translate( 'Free .blog Domain for one year', {
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
			i18n.translate( 'Free domain for one year', {
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
		getTitle: () => i18n.translate( 'Jetpack essential features' ),
		getDescription: () =>
			i18n.translate(
				'Optimize your site for better SEO, faster-loading pages, and protection from spam.'
			),
	},

	[ constants.FEATURE_JETPACK_ADVANCED ]: {
		getSlug: () => constants.FEATURE_JETPACK_ADVANCED,
		getTitle: () => i18n.translate( 'Jetpack advanced features' ),
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
			i18n.translate( '{{strong}}Unlimited{{/strong}} Premium themes', {
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
		getTitle: () => i18n.translate( 'VideoPress support' ),
		getDescription: () =>
			i18n.translate(
				'The easiest way to upload videos to your website and display them ' +
					'using a fast, unbranded, customizable player with rich stats.'
			),
		getStoreSlug: () => 'videopress',
	},

	[ constants.FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM ]: {
		getSlug: () => constants.FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM,
		getTitle: () => i18n.translate( 'VideoPress support' ),
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
			i18n.translate( '{{strong}}Unlimited{{/strong}} Video hosting', {
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
		getTitle: () => i18n.translate( 'Audio upload support' ),
		getDescription: () =>
			i18n.translate(
				'The easiest way to upload audio files that use any major audio file format. '
			),
		getStoreSlug: () => 'videopress',
	},

	[ constants.FEATURE_BASIC_DESIGN ]: {
		getSlug: () => constants.FEATURE_BASIC_DESIGN,
		getTitle: () => i18n.translate( 'Basic design customization' ),
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
			i18n.translate( '{{strong}}Advanced{{/strong}} design customization', {
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
		getTitle: () => i18n.translate( 'Remove WordPress.com ads' ),
		getDescription: () =>
			i18n.translate(
				'Allow your visitors to visit and read your website without ' +
					'seeing any WordPress.com advertising.'
			),
		getStoreSlug: () => 'no-adverts/no-adverts.php',
	},
	[ constants.FEATURE_REPUBLICIZE ]: {
		getSlug: () => constants.FEATURE_REPUBLICIZE,
		getTitle: () => i18n.translate( 'Advanced social media' ),
		getDescription: () =>
			i18n.translate(
				"Schedule your social media updates in advance and promote your posts when it's best for you."
			),
	},
	[ constants.FEATURE_SIMPLE_PAYMENTS ]: {
		getSlug: () => constants.FEATURE_SIMPLE_PAYMENTS,
		getTitle: () => i18n.translate( 'Pay with PayPal' ),
		getDescription: () => i18n.translate( 'Sell anything with a simple PayPal button.' ),
	},
	[ constants.FEATURE_NO_BRANDING ]: {
		getSlug: () => constants.FEATURE_NO_BRANDING,
		getTitle: () => i18n.translate( 'Remove WordPress.com branding' ),
		getDescription: () =>
			i18n.translate(
				"Keep the focus on your site's brand by removing the WordPress.com footer branding."
			),
		getStoreSlug: () => 'no-adverts/no-adverts.php',
	},

	[ constants.FEATURE_BUSINESS_ONBOARDING ]: {
		getSlug: () => constants.FEATURE_BUSINESS_ONBOARDING,
		getTitle: () => i18n.translate( 'Get personalized help' ),
		getDescription: () =>
			i18n.translate(
				"Meet one-on-one with a WordPress.com expert who'll help you set up your site exactly as you need it."
			),
	},

	[ constants.FEATURE_ADVANCED_SEO ]: {
		getSlug: () => constants.FEATURE_ADVANCED_SEO,
		getTitle: () => i18n.translate( 'SEO tools' ),
		getDescription: () =>
			i18n.translate(
				'Boost traffic to your site with tools that make your content more findable on search engines and social media.'
			),
	},

	[ constants.FEATURE_UPLOAD_PLUGINS ]: {
		getSlug: () => constants.FEATURE_UPLOAD_PLUGINS,
		getTitle: () => i18n.translate( 'Install plugins' ),
		getDescription: () =>
			i18n.translate(
				'Plugins extend the functionality of your site and ' +
					'open up endless possibilities for presenting your content and interacting with visitors.'
			),
	},

	[ constants.FEATURE_UPLOAD_THEMES ]: {
		getSlug: () => constants.FEATURE_UPLOAD_THEMES,
		getTitle: () => i18n.translate( 'Install themes' ),
		getDescription: () =>
			i18n.translate(
				'With the option to upload themes, you can give your site a professional polish ' +
					'that will help it stand out among the rest.'
			),
	},

	[ constants.FEATURE_WORDADS_INSTANT ]: {
		getSlug: () => constants.FEATURE_WORDADS_INSTANT,
		getTitle: () => i18n.translate( 'Site monetization' ),
		getDescription: () =>
			i18n.translate(
				'Earn money on your site by displaying ads and collecting payments or donations.'
			),
	},

	[ constants.FEATURE_WP_SUBDOMAIN ]: {
		getSlug: () => constants.FEATURE_WP_SUBDOMAIN,
		getTitle: () => i18n.translate( 'WordPress.com subdomain' ),
		getDescription: () =>
			i18n.translate(
				'Your site address will use a WordPress.com subdomain (sitename.wordpress.com).'
			),
	},

	[ constants.FEATURE_FREE_THEMES ]: {
		getSlug: () => constants.FEATURE_FREE_THEMES,
		getTitle: () => i18n.translate( 'Dozens of free themes' ),
		getDescription: () =>
			i18n.translate(
				'Access to a wide range of professional themes ' +
					"so you can find a design that's just right for your site."
			),
	},

	[ constants.FEATURE_3GB_STORAGE ]: {
		getSlug: () => constants.FEATURE_3GB_STORAGE,
		getTitle: () => i18n.translate( '3 GB storage space' ),
		getDescription: () =>
			i18n.translate( 'Storage space for adding images and documents to your website.' ),
	},

	[ constants.FEATURE_6GB_STORAGE ]: {
		getSlug: () => constants.FEATURE_6GB_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}6 GB{{/strong}} storage space', {
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
			i18n.translate( '{{strong}}13 GB{{/strong}} storage space', {
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
			i18n.translate( '{{strong}}200 GB{{/strong}} storage space', {
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
		getTitle: () => i18n.translate( 'Unlimited email support' ),
		getDescription: () =>
			i18n.translate( 'Email us any time, any day of the week for personalized, expert support.' ),
	},

	[ constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT ]: {
		getSlug: () => constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT,
		getTitle: () => i18n.translate( 'Email & live chat support' ),
		getDescription: () =>
			i18n.translate( 'Live chat support to help you get started with your site.' ),
	},

	[ constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_BUSINESS_DAYS ]: {
		getSlug: () => constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
		getTitle: () => i18n.translate( 'Email & live chat support' ),
		getDescription: () =>
			i18n.translate(
				'Live chat is available 24 hours a day from Monday through Friday. ' +
					'You can also email us any day of the week for personalized support.'
			),
	},

	[ constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS ]: {
		getSlug: () => constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS,
		getTitle: () => i18n.translate( 'Email & live chat support' ),
		getDescription: () =>
			i18n.translate(
				'Live chat is available 24/7. ' +
					'You can also email us any day of the week for personalized support.'
			),
	},

	[ constants.FEATURE_LIVE_CHAT_SUPPORT ]: {
		getSlug: () => constants.FEATURE_LIVE_CHAT_SUPPORT,
		getTitle: () => i18n.translate( 'Live chat support' ),
		getDescription: () =>
			i18n.translate( 'Live chat is available 24 hours a day from Monday through Friday.' ),
	},

	[ constants.FEATURE_PREMIUM_SUPPORT ]: {
		getSlug: () => constants.FEATURE_PREMIUM_SUPPORT,
		getTitle: () => i18n.translate( 'Priority Support' ),
		getDescription: () =>
			i18n.translate( 'Live chat support to help you get started with Jetpack.' ),
	},

	[ constants.FEATURE_STANDARD_SECURITY_TOOLS ]: {
		getSlug: () => constants.FEATURE_STANDARD_SECURITY_TOOLS,
		getTitle: () => i18n.translate( 'Standard security tools' ),
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
			i18n.translate( '{{strong}}Daily{{/strong}} backups', {
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
			i18n.translate( '{{strong}}Real-time{{/strong}} backups', {
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
		getTitle: () => i18n.translate( '30-day backup archive' ),
		getDescription: () =>
			i18n.translate( 'Browse or restore any backup made within the past 30 days.' ),
	},
	[ constants.FEATURE_BACKUP_ARCHIVE_15 ]: {
		getSlug: () => constants.FEATURE_BACKUP_ARCHIVE_15,
		getTitle: () => i18n.translate( '15-day backup archive' ),
		getDescription: () =>
			i18n.translate( 'Browse or restore any backup made within the past 15 days.' ),
	},
	[ constants.FEATURE_BACKUP_ARCHIVE_UNLIMITED ]: {
		getSlug: () => constants.FEATURE_BACKUP_ARCHIVE_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited backup archive' ),
		getDescription: () =>
			i18n.translate( 'Browse or restore any backup made since you activated the service.' ),
	},
	[ constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED ]: {
		getSlug: () => constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited backup storage space' ),
		getDescription: () =>
			i18n.translate( 'Absolutely no limits on storage space for your backups.' ),
	},
	[ constants.FEATURE_AUTOMATED_RESTORES ]: {
		getSlug: () => constants.FEATURE_AUTOMATED_RESTORES,
		getTitle: () => i18n.translate( 'Automated restores' ),
		getDescription: () =>
			i18n.translate( 'Restore your site from any available backup with a single click.' ),
	},
	[ constants.FEATURE_EASY_SITE_MIGRATION ]: {
		getSlug: () => constants.FEATURE_EASY_SITE_MIGRATION,
		getTitle: () => i18n.translate( 'Easy site migration' ),
		getDescription: () =>
			i18n.translate( 'Easily and quickly move or duplicate your site to any location.' ),
	},
	[ constants.FEATURE_MALWARE_SCANNING_DAILY ]: {
		getSlug: () => constants.FEATURE_MALWARE_SCANNING_DAILY,
		getTitle: () =>
			i18n.translate( '{{strong}}Daily{{/strong}} malware scanning', {
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
		getTitle: () => i18n.translate( 'Daily and on-demand malware scanning' ),
		getDescription: () =>
			i18n.translate(
				'Automated security scanning with the option to run complete site scans at any time.'
			),
	},
	[ constants.FEATURE_ONE_CLICK_THREAT_RESOLUTION ]: {
		getSlug: () => constants.FEATURE_ONE_CLICK_THREAT_RESOLUTION,
		getTitle: () => i18n.translate( 'One-click threat resolution' ),
		getDescription: () =>
			i18n.translate( 'Repair any security issues found on your site with just a single click.' ),
	},
	[ constants.FEATURE_AUTOMATIC_SECURITY_FIXES ]: {
		getSlug: () => constants.FEATURE_AUTOMATIC_SECURITY_FIXES,
		getTitle: () =>
			i18n.translate( '{{strong}}Automatic{{/strong}} security fixes', {
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
		getTitle: () => i18n.translate( 'Expanded site activity' ),
		getDescription: () =>
			i18n.translate(
				'Take the guesswork out of site management and debugging with a filterable record of all the activity happening on your site.'
			),
	},
	[ constants.FEATURE_POLLS_PRO ]: {
		getSlug: () => constants.FEATURE_POLLS_PRO,
		getTitle: () => i18n.translate( 'Advanced polls and ratings' ),
		getDescription: () =>
			i18n.translate(
				'Custom polls, surveys, ratings, and quizzes for the ultimate in customer and reader engagement.'
			),
	},

	[ constants.FEATURE_CORE_JETPACK ]: {
		getSlug: () => constants.FEATURE_CORE_JETPACK,
		getTitle: () => i18n.translate( 'Core Jetpack services' ),
		getDescription: () => i18n.translate( 'Stats, themes, and promotion tools.' ),
		hideInfoPopover: true,
	},
	[ constants.FEATURE_BASIC_SECURITY_JETPACK ]: {
		getSlug: () => constants.FEATURE_BASIC_SECURITY_JETPACK,
		getTitle: () => i18n.translate( 'Basic security' ),
		getDescription: () =>
			i18n.translate( 'Brute force protection, monitoring, secure logins, updates.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_BASIC_SUPPORT_JETPACK ]: {
		getSlug: () => constants.FEATURE_BASIC_SUPPORT_JETPACK,
		getTitle: () => i18n.translate( 'Basic support' ),
		getDescription: () => i18n.translate( 'Free support to help you make the most of Jetpack.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SPEED_JETPACK ]: {
		getSlug: () => constants.FEATURE_SPEED_JETPACK,
		getTitle: () => i18n.translate( 'Speed and storage' ),
		getDescription: () =>
			i18n.translate( 'Unlimited use of our high speed image content delivery network.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SPEED_ADVANCED_JETPACK ]: {
		getSlug: () => constants.FEATURE_SPEED_ADVANCED_JETPACK,
		getTitle: () => i18n.translate( 'Speed and storage' ),
		getDescription: () =>
			i18n.translate( 'Also includes 13 GB of high-speed, ad-free video hosting.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SPEED_UNLIMITED_JETPACK ]: {
		getSlug: () => constants.FEATURE_SPEED_UNLIMITED_JETPACK,
		getTitle: () => i18n.translate( 'Speed and storage' ),
		getDescription: () =>
			i18n.translate( 'Also includes unlimited, high-speed, ad-free video hosting.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SITE_BACKUPS_JETPACK ]: {
		getSlug: () => constants.FEATURE_SITE_BACKUPS_JETPACK,
		getTitle: () => i18n.translate( 'Site backups' ),
		getDescription: () =>
			i18n.translate(
				'Automated daily backups (unlimited storage), one-click restores, and 30-day archive.'
			),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SECURITY_SCANNING_JETPACK ]: {
		getSlug: () => constants.FEATURE_SECURITY_SCANNING_JETPACK,
		getTitle: () => i18n.translate( 'Advanced security' ),
		getDescription: () =>
			i18n.translate( 'Also includes daily scans for malware and security threats.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_REVENUE_GENERATION_JETPACK ]: {
		getSlug: () => constants.FEATURE_REVENUE_GENERATION_JETPACK,
		getTitle: () => i18n.translate( 'Revenue generation' ),
		getDescription: () => i18n.translate( 'High-quality ads to generate income from your site.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_VIDEO_HOSTING_JETPACK ]: {
		getSlug: () => constants.FEATURE_VIDEO_HOSTING_JETPACK,
		getTitle: () => i18n.translate( 'Video hosting' ),
		getDescription: () => i18n.translate( '13 GB of high-speed, HD, and ad-free video hosting.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_SECURITY_ESSENTIALS_JETPACK ]: {
		getSlug: () => constants.FEATURE_SECURITY_ESSENTIALS_JETPACK,
		getTitle: () => i18n.translate( 'Essential security' ),
		getDescription: () =>
			i18n.translate( 'Daily backups, unlimited storage, one-click restores, spam filtering.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_PRIORITY_SUPPORT_JETPACK ]: {
		getSlug: () => constants.FEATURE_PRIORITY_SUPPORT_JETPACK,
		getTitle: () => i18n.translate( 'Priority support' ),
		getDescription: () => i18n.translate( 'Faster response times from our security experts.' ),
		hideInfoPopover: true,
	},
	[ constants.FEATURE_TRAFFIC_TOOLS_JETPACK ]: {
		getSlug: () => constants.FEATURE_TRAFFIC_TOOLS_JETPACK,
		getTitle: () => i18n.translate( 'Advanced traffic tools' ),
		getDescription: () =>
			i18n.translate( 'Automatically re-promote existing content to social media.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_ADVANCED_TRAFFIC_TOOLS_JETPACK ]: {
		getSlug: () => constants.FEATURE_ADVANCED_TRAFFIC_TOOLS_JETPACK,
		getTitle: () => i18n.translate( 'Advanced traffic tools' ),
		getDescription: () => i18n.translate( 'Also includes SEO previews and Google Analytics.' ),
		hideInfoPopover: true,
	},

	[ constants.FEATURE_CONCIERGE_SETUP ]: {
		getSlug: () => constants.FEATURE_CONCIERGE_SETUP,
		getTitle: () => i18n.translate( 'Concierge setup' ),
		getDescription: () =>
			i18n.translate( 'A complimentary one-on-one orientation session with a Jetpack expert.' ),
	},

	[ constants.FEATURE_MARKETING_AUTOMATION ]: {
		getSlug: () => constants.FEATURE_MARKETING_AUTOMATION,
		getTitle: () => i18n.translate( 'Social media automation' ),
		getDescription: () =>
			i18n.translate(
				'Re-share previously published content on social media, or schedule new shares in advance.'
			),
	},

	[ constants.FEATURE_ACCEPT_PAYMENTS ]: {
		getSlug: () => constants.FEATURE_ACCEPT_PAYMENTS,
		getTitle: () => i18n.translate( 'Accept payments in 60+ countries' ),
		getDescription: () =>
			i18n.translate(
				'Built-in payment processing from leading providers like Stripe, PayPal, and more. Accept payments from customers all over the world.'
			),
	},

	[ constants.FEATURE_SHIPPING_CARRIERS ]: {
		getSlug: () => constants.FEATURE_SHIPPING_CARRIERS,
		getTitle: () => i18n.translate( 'Integrations with top shipping carriers' ),
		getDescription: () =>
			i18n.translate(
				'Ship physical products in a snap - show live rates from shipping carriers like UPS and other shipping options.'
			),
	},

	[ constants.FEATURE_UNLIMITED_PRODUCTS_SERVICES ]: {
		getSlug: () => constants.FEATURE_UNLIMITED_PRODUCTS_SERVICES,
		getTitle: () => i18n.translate( 'Unlimited products or services' ),
		getDescription: () =>
			i18n.translate(
				'Grow your store as big as you want with the ability to add and sell unlimited products and services.'
			),
	},

	[ constants.FEATURE_ECOMMERCE_MARKETING ]: {
		getSlug: () => constants.FEATURE_ECOMMERCE_MARKETING,
		getTitle: () => i18n.translate( 'eCommerce marketing tools' ),
		getDescription: () =>
			i18n.translate(
				'Optimize your store for sales by adding in email and social integrations with Facebook and Mailchimp, and more.'
			),
	},

	[ constants.FEATURE_PREMIUM_CUSTOMIZABE_THEMES ]: {
		getSlug: () => constants.FEATURE_PREMIUM_CUSTOMIZABE_THEMES,
		getTitle: () => i18n.translate( 'Premium customizable starter themes' ),
		getDescription: () =>
			i18n.translate(
				'Quickly get up and running with a beautiful store theme and additional design options that you can easily make your own.'
			),
	},

	[ constants.FEATURE_ALL_BUSINESS_FEATURES ]: {
		getSlug: () => constants.FEATURE_ALL_BUSINESS_FEATURES,
		getTitle: () => i18n.translate( 'All Business features' ),
		getDescription: () =>
			i18n.translate(
				'Including the ability to upload plugins and themes, priority support, advanced monetization options, and unlimited premium themes.'
			),
	},

	[ constants.FEATURE_MEMBERSHIPS ]: {
		getSlug: () => constants.FEATURE_MEMBERSHIPS,
		getTitle: () => i18n.translate( 'Payments' ),
		getDescription: () =>
			i18n.translate( 'Accept one-time, monthly, or annual payments on your website.' ),
	},

	[ constants.FEATURE_PREMIUM_CONTENT_BLOCK ]: {
		getSlug: () => constants.FEATURE_PREMIUM_CONTENT_BLOCK,
		getTitle: () => i18n.translate( 'Subscriber-only content' ),
		getDescription: () => i18n.translate( 'Limit content to paying subscribers.' ),
	},

	[ constants.FEATURE_PLAN_SECURITY_DAILY ]: {
		getSlug: () => constants.FEATURE_PLAN_SECURITY_DAILY,
		getIcon: () => 'lock',
		getTitle: ( variation ) =>
			( {
				spp: i18n.translate( 'All Jetpack Security features' ),
			}[ variation ] || i18n.translate( 'All Security Daily features' ) ),
		isPlan: true,
	},

	[ constants.FEATURE_PLAN_SECURITY_REALTIME ]: {
		getSlug: () => constants.FEATURE_PLAN_SECURITY_REALTIME,
		getIcon: () => 'lock',
		getTitle: () =>
			i18n.translate( '{{strong}}All Security {{em}}Real{{nbh/}}time{{/em}}{{/strong}} features', {
				components: {
					em: <em />,
					strong: <strong />,
					nbh: <>&#8209;</>,
				},
				comment: '{{nbh}} represents a non breakable hyphen',
			} ),
		isPlan: true,
	},

	[ constants.FEATURE_SECURITY_REALTIME_V2 ]: {
		getSlug: () => constants.FEATURE_SECURITY_REALTIME_V2,
		getIcon: () => 'lock',
		getTitle: () =>
			i18n.translate( 'Security {{em}}Real-time{{/em}}', {
				components: {
					em: <em />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Includes all Jetpack security features to protect your site in real-time: backups, malware scanning, spam protection. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/features/security/" />,
					},
				}
			),
	},

	[ constants.FEATURE_BACKUP_V2 ]: {
		getSlug: () => constants.FEATURE_BACKUP_V2,
		getTitle: () => i18n.translate( 'Automated WordPress backups' ),
	},

	[ constants.FEATURE_BACKUP_DAILY_V2 ]: {
		getSlug: () => constants.FEATURE_BACKUP_DAILY_V2,
		getTitle: () => i18n.translate( 'Automated daily backups (off-site)' ),
	},

	[ constants.FEATURE_BACKUP_REALTIME_V2 ]: {
		getSlug: () => constants.FEATURE_BACKUP_REALTIME_V2,
		getTitle: ( variation ) =>
			( {
				i5: i18n.translate( 'Backup (real-time, off-site)' ),
				spp: i18n.translate( 'Backup (real-time, off-site)' ),
			}[ variation ] || i18n.translate( 'Automated real-time site backups' ) ),
	},

	[ constants.FEATURE_PRODUCT_BACKUP_V2 ]: {
		getSlug: () => constants.FEATURE_PRODUCT_BACKUP_V2,
		getIcon: () => 'cloud-upload',
		getTitle: () => i18n.translate( 'Backup' ),
		getDescription: () =>
			i18n.translate(
				'Automatic backups of your entire site, with unlimited, WordPress-optimized secure storage. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/backup/" />,
					},
				}
			),
		isProduct: ( variation ) => variation === 'v2',
	},

	[ constants.FEATURE_PRODUCT_BACKUP_DAILY_V2 ]: {
		getSlug: () => constants.FEATURE_PRODUCT_BACKUP_DAILY_V2,
		getIcon: () => 'cloud-upload',
		getTitle: ( variation ) =>
			( {
				v2: i18n.translate( 'Backup {{strong}}{{em}}Daily{{/em}}{{/strong}}', {
					components: {
						em: <em />,
						strong: <strong />,
					},
				} ),
				i5: i18n.translate( 'All Backup Daily features' ),
				spp: i18n.translate( 'All Jetpack Backup features' ),
			}[ variation ] ||
			i18n.translate( 'Backup {{em}}Daily{{/em}}', {
				components: {
					em: <em />,
				},
			} ) ),
		getDescription: () =>
			i18n.translate(
				'Automatic daily backups of your entire site, with unlimited, WordPress-optimized secure storage. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/backup/" />,
					},
				}
			),
		isProduct: ( variation ) => variation === 'v2',
	},

	[ constants.FEATURE_PRODUCT_BACKUP_REALTIME_V2 ]: {
		getSlug: () => constants.FEATURE_PRODUCT_BACKUP_REALTIME_V2,
		getIcon: () => 'cloud-upload',
		getTitle: ( variation ) =>
			( {
				v2: i18n.translate( 'Backup {{strong}}{{em}}Real{{nbh/}}time{{/em}}{{/strong}}', {
					components: {
						em: <em />,
						strong: <strong />,
						nbh: <>&#8209;</>,
					},
					comment: '{{nbh}} represents a non breakable hyphen',
				} ),
				i5: i18n.translate( 'Backup Real-time (off-site)' ),
			}[ variation ] ||
			i18n.translate( 'Backup {{em}}Real-time{{/em}}', {
				components: {
					em: <em />,
				},
			} ) ),
		getDescription: () =>
			i18n.translate(
				'Real-time backups of your entire site and database with unlimited secure storage. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/backup/" />,
					},
				}
			),
		isProduct: ( variation ) => variation === 'v2',
	},

	[ constants.FEATURE_SCAN_V2 ]: {
		getSlug: () => constants.FEATURE_SCAN_V2,
		getTitle: () => i18n.translate( 'Automated daily scanning' ),
	},

	[ constants.FEATURE_PRODUCT_SCAN_V2 ]: {
		getSlug: () => constants.FEATURE_PRODUCT_SCAN_V2,
		getIcon: () => ( { icon: 'security', component: MaterialIcon } ),
		getTitle: () => i18n.translate( 'Scan' ),
		getDescription: () =>
			i18n.translate(
				'Automated scanning for security vulnerabilities or threats on your site. Includes instant notifications and automatic security fixes. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/scan/" />,
					},
				}
			),
		isProduct: ( variation ) => variation === 'v2',
	},

	/**
	 * This is a special feature that is defined in order to be able to specifically exclude it from rendering the product slide-out
	 * in Jetpack Security real-time plan only (in the alt-v2 plans grid page)
	 */
	[ constants.FEATURE_PRODUCT_SCAN_V2_NO_SLIDEOUT ]: {
		getSlug: () => constants.FEATURE_PRODUCT_SCAN_V2_NO_SLIDEOUT,
		getIcon: () => ( { icon: 'security', component: MaterialIcon } ),
		getTitle: () => i18n.translate( 'Scan' ),
		getDescription: () =>
			i18n.translate(
				'Automated scanning for security vulnerabilities or threats on your site. Includes instant notifications and automatic security fixes. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/scan/" />,
					},
				}
			),
		isProduct: ( variation ) => variation === 'v2',
	},

	// * Scan Daily *
	// Currently we're not distinguishing between Scan 'Daily' or 'Real-time',
	// but leaving this here because we may be implementing Scan 'Daily' and 'Real-time'
	// in the near future.
	[ constants.FEATURE_PRODUCT_SCAN_DAILY_V2 ]: {
		getSlug: () => constants.FEATURE_PRODUCT_SCAN_DAILY_V2,
		getIcon: () => ( { icon: 'security', component: MaterialIcon } ),
		getTitle: ( variation ) =>
			( {
				i5: i18n.translate( 'Scan (daily, automated)' ),
				spp: i18n.translate( 'Scan (daily, automated)' ),
			}[ variation ] ||
			i18n.translate( 'Scan {{em}}Daily{{/em}}', {
				components: {
					em: <em />,
				},
			} ) ),
		getDescription: () =>
			i18n.translate(
				'Automated daily scanning for security vulnerabilities or threats on your site. Includes instant notifications and automatic security fixes. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/scan/" />,
					},
				}
			),
		isProduct: ( variation ) => variation === 'v2',
	},

	// * Scan Real-time *
	// Currently we're not distinguishing between Scan 'Daily' or 'Real-time',
	// but leaving this here because we may be implementing Scan 'Daily' and 'Real-time'
	// in the near future.
	[ constants.FEATURE_PRODUCT_SCAN_REALTIME_V2 ]: {
		getSlug: () => constants.FEATURE_PRODUCT_SCAN_REALTIME_V2,
		getIcon: () => ( { icon: 'security', component: MaterialIcon } ),
		getTitle: ( variation ) =>
			( {
				i5: i18n.translate( 'Scan (real-time, automated)' ),
				spp: i18n.translate( 'Scan (real-time, automated)' ),
			}[ variation ] ||
			i18n.translate( 'Scan {{em}}Real-time{{/em}}', {
				components: {
					em: <em />,
				},
			} ) ),
		getDescription: () =>
			i18n.translate(
				'Automated real-time scanning for security vulnerabilities or threats on your site. Includes instant notifications and automatic security fixes. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/scan/" />,
					},
				}
			),
		isProduct: ( variation ) => variation === 'v2',
	},

	[ constants.FEATURE_ANTISPAM_V2 ]: {
		getSlug: () => constants.FEATURE_ANTISPAM_V2,
		getTitle: () => i18n.translate( 'Comment and form protection' ),
	},

	[ constants.FEATURE_PRODUCT_ANTISPAM_V2 ]: {
		getSlug: () => constants.FEATURE_PRODUCT_ANTISPAM_V2,
		getIcon: () => 'bug',
		getTitle: () => i18n.translate( 'Anti-spam' ),
		getDescription: () =>
			i18n.translate(
				'Automated spam protection for comments and forms, powered by Akismet. Save time, get more responses, and give your visitors a better experience. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/anti-spam/" />,
					},
				}
			),
		isProduct: ( variation ) => variation === 'v2',
	},

	[ constants.FEATURE_ACTIVITY_LOG_V2 ]: {
		getSlug: () => constants.FEATURE_ACTIVITY_LOG_V2,
		getIcon: () => 'clipboard',
		getTitle: () => i18n.translate( 'Activity log' ),
		getDescription: () =>
			i18n.translate(
				'View every change to your site. Pairs with Backup to restore your site to any earlier version. {{link}}Learn more.{{/link}}',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/features/security/activity-log/" />,
					},
				}
			),
	},

	[ constants.FEATURE_ACTIVITY_LOG_30_DAYS_V2 ]: {
		getSlug: () => constants.FEATURE_ACTIVITY_LOG_30_DAYS_V2,
		getIcon: () => 'clipboard',
		getTitle: () => i18n.translate( 'Activity log: 30-day archive' ),
		getDescription: () =>
			i18n.translate(
				'View every change to your site in the last 30 days. Pairs with Backup to restore your site to any earlier version. {{link}}Learn more.{{/link}}',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/features/security/activity-log/" />,
					},
				}
			),
	},

	[ constants.FEATURE_ACTIVITY_LOG_1_YEAR_V2 ]: {
		getSlug: () => constants.FEATURE_ACTIVITY_LOG_1_YEAR_V2,
		getIcon: () => 'clipboard',
		getTitle: () => i18n.translate( 'Activity log: 1-year archive' ),
		getDescription: () =>
			i18n.translate(
				'View every change to your site in the last year. Pairs with Backup to restore your site to any earlier version. {{link}}Learn more.{{/link}}',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/features/security/activity-log/" />,
					},
				}
			),
	},

	[ constants.FEATURE_SEARCH_V2 ]: {
		getSlug: () => constants.FEATURE_SEARCH_V2,
		getTitle: () => i18n.translate( 'Instant search and indexing' ),
	},

	[ constants.FEATURE_PRODUCT_SEARCH_V2 ]: {
		getSlug: () => constants.FEATURE_PRODUCT_SEARCH_V2,
		getIcon: ( variation ) => ( variation === 'v2' ? 'search' : null ),
		getTitle: ( variation ) =>
			( {
				v2: i18n.translate( 'Jetpack Search {{strong}}{{em}}Up to 100k records{{/em}}{{/strong}}', {
					components: {
						em: <em />,
						strong: <strong />,
					},
				} ),
				i5: i18n.translate( 'Site Search: up to 100k records' ),
				spp: i18n.translate( 'Site Search: up to 100k records' ),
			}[ variation ] || i18n.translate( 'Search: up to 100k records' ) ),

		getDescription: () =>
			i18n.translate(
				'Help your site visitors find answers instantly so they keep reading and buying. Powerful filtering and customization options. {{link}}Learn more.{{/link}}',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/search/" />,
					},
				}
			),
		isProduct: ( variation ) => variation === 'v2',
	},

	[ constants.FEATURE_VIDEO_HOSTING_V2 ]: {
		getSlug: () => constants.FEATURE_VIDEO_HOSTING_V2,
		getTitle: () => i18n.translate( 'Unlimited video hosting' ),
		getDescription: () =>
			i18n.translate(
				'Easy video uploads through an unbranded, customizable video player, enhanced with rich stats and unlimited storage space. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/features/writing/video-hosting/" />,
					},
				}
			),
	},

	[ constants.FEATURE_CRM_V2 ]: {
		getSlug: () => constants.FEATURE_CRM_V2,
		getIcon: ( variation ) => ( variation === 'v2' ? 'multiple-users' : null ),
		getTitle: ( variation ) =>
			( {
				v2: i18n.translate( 'Jetpack CRM {{strong}}{{em}}Entrepreneur{{/em}}{{/strong}}', {
					components: {
						em: <em />,
						strong: <strong />,
					},
				} ),
			}[ variation ] || i18n.translate( 'CRM: Entrepreneur bundle' ) ),
		getDescription: () =>
			i18n.translate(
				'The most simple and powerful WordPress CRM. Improve customer relationships and increase profits. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpackcrm.com" />,
					},
				}
			),
		isProduct: ( variation ) => variation === 'v2',
	},

	[ constants.FEATURE_CRM_LEADS_AND_FUNNEL ]: {
		getSlug: () => constants.FEATURE_CRM_LEADS_AND_FUNNEL,
		getTitle: () => i18n.translate( 'Easily view leads and sales funnel' ),
	},

	[ constants.FEATURE_CRM_PROPOSALS_AND_INVOICES ]: {
		getSlug: () => constants.FEATURE_CRM_PROPOSALS_AND_INVOICES,
		getTitle: () => i18n.translate( 'Create proposals and invoices' ),
	},

	[ constants.FEATURE_CRM_TRACK_TRANSACTIONS ]: {
		getSlug: () => constants.FEATURE_CRM_TRACK_TRANSACTIONS,
		getTitle: () => i18n.translate( 'Track transactions' ),
	},

	[ constants.FEATURE_CRM_NO_CONTACT_LIMITS ]: {
		getSlug: () => constants.FEATURE_CRM_NO_CONTACT_LIMITS,
		getTitle: () => i18n.translate( 'No contact limits' ),
	},

	[ constants.FEATURE_CRM_PRIORITY_SUPPORT ]: {
		getSlug: () => constants.FEATURE_CRM_PRIORITY_SUPPORT,
		getTitle: () => i18n.translate( 'Priority support' ),
	},

	[ constants.FEATURE_SOCIAL_MEDIA_POSTING_V2 ]: {
		getSlug: () => constants.FEATURE_SOCIAL_MEDIA_POSTING_V2,
		getTitle: () => i18n.translate( 'Scheduled social media posting' ),
		getDescription: () =>
			i18n.translate(
				'Automate and schedule your social media content on Facebook, Instagram, Twitter, LinkedIn, and Tumblr. {{link}}Learn more.{{/link}}',
				{
					components: {
						link: (
							<ExternalLink
								icon
								href="https://jetpack.com/features/traffic/automatic-publishing/"
							/>
						),
					},
				}
			),
	},

	[ constants.FEATURE_COLLECT_PAYMENTS_V2 ]: {
		getSlug: () => constants.FEATURE_COLLECT_PAYMENTS_V2,
		getTitle: () => i18n.translate( 'Collect payments' ),
		getDescription: () =>
			i18n.translate(
				'Accept payments from credit or debit cards via Stripe. Sell products, collect donations, and set up recurring payments for subscriptions or memberships. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: (
							<ExternalLink
								icon
								href="https://jetpack.com/support/jetpack-blocks/payments-block/"
							/>
						),
					},
				}
			),
	},

	[ constants.FEATURE_SITE_MONETIZATION_V2 ]: {
		getSlug: () => constants.FEATURE_SITE_MONETIZATION_V2,
		getTitle: () => i18n.translate( 'Site monetization' ),
		getDescription: () =>
			i18n.translate(
				'Earn money on your site by displaying ads from the WordPress.com ad network. {{link}}Learn more.{{/link}}',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/features/traffic/ads/" />,
					},
				}
			),
	},

	[ constants.FEATURE_PREMIUM_THEMES_V2 ]: {
		getSlug: () => constants.FEATURE_PREMIUM_THEMES_V2,
		getTitle: () => i18n.translate( 'Unlimited premium themes' ),
		getDescription: () =>
			i18n.translate(
				'Unlimited access to all of our advanced premium themes, including designs specifically tailored for businesses. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/features/design/themes/" />,
					},
				}
			),
	},

	[ constants.FEATURE_PRIORITY_SUPPORT_V2 ]: {
		getSlug: () => constants.FEATURE_PRIORITY_SUPPORT_V2,
		getTitle: () => i18n.translate( 'Priority support' ),
		getDescription: () =>
			i18n.translate(
				'Get fast WordPress support from the WordPress experts. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: (
							<ExternalLink
								icon
								href="https://jetpack.com/features/security/expert-priority-support/"
							/>
						),
					},
				}
			),
	},

	[ constants.FEATURE_SECURE_STORAGE_V2 ]: {
		getSlug: () => constants.FEATURE_SECURE_STORAGE_V2,
		getTitle: () => i18n.translate( 'Unlimited site storage' ),
	},

	[ constants.FEATURE_ONE_CLICK_RESTORE_V2 ]: {
		getSlug: () => constants.FEATURE_ONE_CLICK_RESTORE_V2,
		getTitle: ( variation ) =>
			( {
				i5: i18n.translate( 'One-click restores' ),
				spp: i18n.translate( 'One-click restores' ),
			}[ variation ] || i18n.translate( 'One-click restores from desktop or mobile' ) ),
	},

	[ constants.FEATURE_ONE_CLICK_FIX_V2 ]: {
		getSlug: () => constants.FEATURE_ONE_CLICK_FIX_V2,
		getTitle: () => i18n.translate( 'One-click fixes for most issues' ),
	},

	[ constants.FEATURE_INSTANT_EMAIL_V2 ]: {
		getSlug: () => constants.FEATURE_INSTANT_EMAIL_V2,
		getTitle: () => i18n.translate( 'Instant email notifications' ),
	},

	[ constants.FEATURE_AKISMET_V2 ]: {
		getSlug: () => constants.FEATURE_AKISMET_V2,
		getTitle: () => i18n.translate( 'Powered by Akismet' ),
	},

	[ constants.FEATURE_SPAM_BLOCK_V2 ]: {
		getSlug: () => constants.FEATURE_SPAM_BLOCK_V2,
		getTitle: () => i18n.translate( 'Block spam without CAPTCHAs' ),
	},

	[ constants.FEATURE_ADVANCED_STATS_V2 ]: {
		getSlug: () => constants.FEATURE_ADVANCED_STATS_V2,
		getTitle: () => i18n.translate( 'Advanced stats' ),
	},

	[ constants.FEATURE_FILTERING_V2 ]: {
		getSlug: () => constants.FEATURE_FILTERING_V2,
		getTitle: () => i18n.translate( 'Powerful filtering' ),
	},

	[ constants.FEATURE_LANGUAGE_SUPPORT_V2 ]: {
		getSlug: () => constants.FEATURE_LANGUAGE_SUPPORT_V2,
		getTitle: () => i18n.translate( 'Supports 29 languages' ),
	},

	[ constants.FEATURE_SPELLING_CORRECTION_V2 ]: {
		getSlug: () => constants.FEATURE_SPELLING_CORRECTION_V2,
		getTitle: () => i18n.translate( 'Spelling correction' ),
	},

	[ constants.FEATURE_P2_3GB_STORAGE ]: {
		getSlug: () => constants.FEATURE_P2_3GB_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}3GB{{/strong}} storage space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Upload images and documents and share them with your team.' ),
	},

	[ constants.FEATURE_P2_UNLIMITED_USERS ]: {
		getSlug: () => constants.FEATURE_P2_UNLIMITED_USERS,
		getTitle: () => i18n.translate( 'Unlimited users' ),
		getDescription: () => i18n.translate( 'Invite as many people as you need to your P2.' ),
	},

	[ constants.FEATURE_P2_UNLIMITED_POSTS_PAGES ]: {
		getSlug: () => constants.FEATURE_P2_UNLIMITED_POSTS_PAGES,
		getTitle: () => i18n.translate( 'Unlimited posts and pages' ),
		getDescription: () =>
			i18n.translate( 'Communicate as often as you want, with full access to your archive.' ),
	},

	[ constants.FEATURE_P2_SIMPLE_SEARCH ]: {
		getSlug: () => constants.FEATURE_P2_SIMPLE_SEARCH,
		getTitle: () => i18n.translate( 'Simple search' ),
		getDescription: () => i18n.translate( 'Easily find what you’re looking for.' ),
	},

	[ constants.FEATURE_P2_CUSTOMIZATION_OPTIONS ]: {
		getSlug: () => constants.FEATURE_P2_CUSTOMIZATION_OPTIONS,
		getTitle: () => i18n.translate( 'Customization options' ),
		getDescription: () =>
			i18n.translate( 'Make your team feel at home with some easy customization options.' ),
	},

	[ constants.FEATURE_P2_13GB_STORAGE ]: {
		getSlug: () => constants.FEATURE_P2_13GB_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}13GB{{/strong}} storage space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () => i18n.translate( 'Upload more files to your P2.' ),
	},

	[ constants.FEATURE_P2_ADVANCED_SEARCH ]: {
		getSlug: () => constants.FEATURE_P2_ADVANCED_SEARCH,
		getTitle: () => i18n.translate( 'Advanced search' ),
		getDescription: () =>
			i18n.translate(
				'A faster and more powerful search engine to make finding what you’re looking for easier.'
			),
	},

	[ constants.FEATURE_P2_VIDEO_SHARING ]: {
		getSlug: () => constants.FEATURE_P2_VIDEO_SHARING,
		getTitle: () => i18n.translate( 'Easy video sharing' ),
		getDescription: () =>
			i18n.translate(
				'Upload videos directly to your P2 for your team to see, without depending on external services.'
			),
	},

	[ constants.FEATURE_P2_MORE_FILE_TYPES ]: {
		getSlug: () => constants.FEATURE_P2_MORE_FILE_TYPES,
		getTitle: () => i18n.translate( 'More file types' ),
		getDescription: () => i18n.translate( 'Upload videos, audio, .zip and .key files.' ),
	},

	[ constants.FEATURE_P2_PRIORITY_CHAT_EMAIL_SUPPORT ]: {
		getSlug: () => constants.FEATURE_P2_PRIORITY_CHAT_EMAIL_SUPPORT,
		getTitle: () => i18n.translate( 'Priority customer support' ),
		getDescription: () =>
			i18n.translate(
				'Live chat is available 24 hours a day from Monday through Friday. You can also email us any day of the week for personalized support.'
			),
	},

	[ constants.FEATURE_P2_ACTIVITY_OVERVIEW ]: {
		getSlug: () => constants.FEATURE_P2_ACTIVITY_OVERVIEW,
		getTitle: () => i18n.translate( 'Activity overview panel' ),
		getDescription: () =>
			i18n.translate( 'A complete record of everything that happens on your P2.' ),
	},

	[ constants.FEATURE_P2_CUSTOM_DOMAIN ]: {
		getSlug: () => constants.FEATURE_P2_CUSTOM_DOMAIN,
		getTitle: () => i18n.translate( 'Custom domain' ),
		getDescription: () => i18n.translate( 'Make your P2 more memorable using your own domain.' ),
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

export function getFeatureCategoryByKey( category ) {
	return FEATURE_CATEGORIES[ category ];
}

export function getFeatureTitle( feature ) {
	return invoke( FEATURES_LIST, [ feature, 'getTitle' ] );
}
