import config, { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_SPAM_10K_PER_MONTH,
	FEATURE_13GB_STORAGE,
	FEATURE_200GB_STORAGE,
	FEATURE_3GB_STORAGE,
	FEATURE_1GB_STORAGE,
	FEATURE_50GB_STORAGE,
	FEATURE_6GB_STORAGE,
	FEATURE_ACCEPT_PAYMENTS,
	FEATURE_ACTIVITY_LOG,
	FEATURE_ACTIVITY_LOG_1_YEAR_V2,
	FEATURE_ADVANCED_CUSTOMIZATION,
	FEATURE_ADVANCED_DESIGN,
	FEATURE_ADVANCED_SEO,
	FEATURE_ADVANCED_SEO_EXPANDED_ABBR,
	FEATURE_ADVANCED_SEO_TOOLS,
	FEATURE_AKISMET_V2,
	FEATURE_ALL_BUSINESS_FEATURES,
	FEATURE_ALL_FREE_FEATURES,
	FEATURE_ALL_FREE_FEATURES_JETPACK,
	FEATURE_ALL_PERSONAL_FEATURES,
	FEATURE_ALL_PERSONAL_FEATURES_JETPACK,
	FEATURE_ALL_PREMIUM_FEATURES,
	FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
	FEATURE_ANTISPAM_V2,
	FEATURE_WAF,
	FEATURE_AUDIO_UPLOADS,
	FEATURE_AUTOMATED_RESTORES,
	FEATURE_AUTOMATIC_SECURITY_FIXES,
	FEATURE_BACKUP_ARCHIVE_30,
	FEATURE_BACKUP_ARCHIVE_UNLIMITED,
	FEATURE_BACKUP_DAILY_V2,
	FEATURE_BACKUP_REALTIME_V2,
	FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
	FEATURE_BASIC_DESIGN,
	FEATURE_BLANK,
	FEATURE_BLOG_DOMAIN,
	FEATURE_CLOUDFLARE_ANALYTICS,
	FEATURE_COLLECT_PAYMENTS_V2,
	FEATURE_COMMUNITY_SUPPORT,
	FEATURE_CRM_INTEGRATED_WITH_WORDPRESS,
	FEATURE_CRM_LEADS_AND_FUNNEL,
	FEATURE_CRM_NO_CONTACT_LIMITS,
	FEATURE_CRM_PROPOSALS_AND_INVOICES,
	FEATURE_CRM_TRACK_TRANSACTIONS,
	FEATURE_CRM_V2,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_EARN_AD,
	FEATURE_EASY_SITE_MIGRATION,
	FEATURE_ECOMMERCE_MARKETING,
	FEATURE_EMAIL_LIVE_CHAT_SUPPORT,
	FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS,
	FEATURE_EMAIL_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
	FEATURE_EMAIL_SUPPORT,
	FEATURE_EMAIL_SUPPORT_SIGNUP,
	FEATURE_FILTERING_V2,
	FEATURE_FREE_BLOG_DOMAIN,
	FEATURE_FREE_DOMAIN,
	FEATURE_FREE_THEMES,
	FEATURE_FREE_THEMES_SIGNUP,
	FEATURE_FREE_WORDPRESS_THEMES,
	FEATURE_GOOGLE_ANALYTICS,
	FEATURE_GOOGLE_MY_BUSINESS,
	FEATURE_HOSTING,
	FEATURE_INSTALL_PLUGINS,
	FEATURE_INSTANT_EMAIL_V2,
	FEATURE_JETPACK_ADVANCED,
	FEATURE_JETPACK_ESSENTIAL,
	FEATURE_JETPACK_VIDEOPRESS,
	FEATURE_JETPACK_VIDEOPRESS_EDITOR,
	FEATURE_JETPACK_VIDEOPRESS_STORAGE,
	FEATURE_JETPACK_VIDEOPRESS_UNBRANDED,
	FEATURE_LANGUAGE_SUPPORT_V2,
	FEATURE_LIVE_CHAT_SUPPORT,
	FEATURE_LIVE_CHAT_SUPPORT_ALL_DAYS,
	FEATURE_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
	FEATURE_MALWARE_SCANNING_DAILY,
	FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
	FEATURE_MANAGE,
	FEATURE_MEMBERSHIPS,
	FEATURE_MONETISE,
	FEATURE_NO_ADS,
	FEATURE_NO_BRANDING,
	FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
	FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
	FEATURE_ONE_CLICK_FIX_V2,
	FEATURE_ONE_CLICK_RESTORE_V2,
	FEATURE_ONE_CLICK_THREAT_RESOLUTION,
	FEATURE_P2_13GB_STORAGE,
	FEATURE_P2_3GB_STORAGE,
	FEATURE_P2_ACTIVITY_OVERVIEW,
	FEATURE_P2_ADVANCED_SEARCH,
	FEATURE_P2_CUSTOMIZATION_OPTIONS,
	FEATURE_P2_MORE_FILE_TYPES,
	FEATURE_P2_PRIORITY_CHAT_EMAIL_SUPPORT,
	FEATURE_P2_SIMPLE_SEARCH,
	FEATURE_P2_UNLIMITED_POSTS_PAGES,
	FEATURE_P2_UNLIMITED_USERS,
	FEATURE_P2_VIDEO_SHARING,
	FEATURE_PLAN_SECURITY_DAILY,
	FEATURE_PREMIUM_CONTENT_BLOCK,
	FEATURE_PREMIUM_CUSTOMIZABE_THEMES,
	FEATURE_PREMIUM_SUPPORT,
	FEATURE_PREMIUM_THEMES,
	FEATURE_PRODUCT_BACKUP_DAILY_V2,
	FEATURE_PRODUCT_BACKUP_REALTIME_V2,
	FEATURE_PRODUCT_SCAN_DAILY_V2,
	FEATURE_PRODUCT_SCAN_REALTIME_V2,
	FEATURE_PRODUCT_SEARCH_V2,
	FEATURE_REPUBLICIZE,
	FEATURE_SCAN_V2,
	FEATURE_SEARCH_V2,
	FEATURE_SECURE_STORAGE_V2,
	FEATURE_SEO_PREVIEW_TOOLS,
	FEATURE_SFTP_DATABASE,
	FEATURE_SHIPPING_CARRIERS,
	FEATURE_SIMPLE_PAYMENTS,
	FEATURE_SITE_BACKUPS_AND_RESTORE,
	FEATURE_SITE_STATS,
	FEATURE_SPAM_AKISMET_PLUS,
	FEATURE_SPAM_BLOCK_V2,
	FEATURE_SPELLING_CORRECTION_V2,
	FEATURE_SUPPORTS_WOOCOMMERCE_V2,
	FEATURE_STANDARD_SECURITY_TOOLS,
	FEATURE_TRAFFIC_TOOLS,
	FEATURE_UNLIMITED_PRODUCTS_SERVICES,
	FEATURE_UNLIMITED_STORAGE,
	FEATURE_UPLOAD_PLUGINS,
	FEATURE_UPLOAD_THEMES,
	FEATURE_UPLOAD_THEMES_PLUGINS,
	FEATURE_VIDEO_HOSTING_V2,
	FEATURE_VIDEO_UPLOADS,
	FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM,
	FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
	FEATURE_WORDADS_INSTANT,
	FEATURE_WP_SUBDOMAIN,
	FEATURE_WP_SUBDOMAIN_SIGNUP,
	PREMIUM_DESIGN_FOR_STORES,
	FEATURE_JETPACK_10GB_BACKUP_STORAGE,
	FEATURE_JETPACK_1TB_BACKUP_STORAGE,
	FEATURE_JETPACK_1_YEAR_ARCHIVE_ACTIVITY_LOG,
	FEATURE_JETPACK_30_DAY_ARCHIVE_ACTIVITY_LOG,
	FEATURE_JETPACK_ALL_BACKUP_SECURITY_FEATURES,
	FEATURE_JETPACK_PRODUCT_BACKUP,
	FEATURE_JETPACK_PRODUCT_VIDEOPRESS,
	FEATURE_JETPACK_REAL_TIME_MALWARE_SCANNING,
	FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS,
	FEATURE_UNLIMITED_USERS,
	FEATURE_UNLIMITED_POSTS_PAGES,
	FEATURE_PAYMENT_BLOCKS,
	FEATURE_TITAN_EMAIL,
	FEATURE_UNLIMITED_ADMINS,
	FEATURE_ADDITIONAL_SITES,
	FEATURE_WOOCOMMERCE,
	FEATURE_UNLIMITED_EMAILS,
	FEATURE_UNLIMITED_SUBSCRIBERS,
	FEATURE_IMPORT_SUBSCRIBERS,
	FEATURE_ADD_MULTIPLE_PAGES_NEWSLETTER,
	FEATURE_AD_FREE_EXPERIENCE,
	FEATURE_COLLECT_PAYMENTS_NEWSLETTER,
	FEATURE_POST_BY_EMAIL,
	FEATURE_REAL_TIME_ANALYTICS,
	FEATURE_GOOGLE_ANALYTICS_V2,
	FEATURE_ADD_UNLIMITED_LINKS,
	FEATURE_CUSTOMIZE_THEMES_BUTTONS_COLORS,
	FEATURE_TRACK_VIEWS_CLICKS,
	FEATURE_COLLECT_PAYMENTS_LINK_IN_BIO,
	FEATURE_LINK_IN_BIO_THEMES_CUSTOMIZATION,
	FEATURE_UNLIMITED_TRAFFIC,
	FEATURE_MANAGED_HOSTING,
	/* START - condensed_plan_features_v1 test */
	FEATURE_HOSTING_TEST,
	FEATURE_PRIORITY_SUPPORT_TEST,
	FEATURE_PLUGINS_TEST,
	FEATURE_SFTP_DATABASE_TEST,
	FEATURE_FREE_NEWSLETTER_V1,
	FEATURE_PAID_NEWSLETTER_V1,
	FEATURE_REPUBLICIZE_V3,
	FEATURE_MONETISE_V2,
	FEATURE_EDGE_CACHING_V2,
	FEATURE_UPLOAD_THEMES_V3,
	FEATURE_ADVANCED_SEO_EXPANDED_ABBR_V2,
	FEATURE_SITE_STATS_V2,
	FEATURE_COLLECT_PAYMENTS_V3,
	FEATURE_FREE_THEMES_V2,
	FEATURE_VIDEO_UPLOADS_V2,
	/* END - condensed_plan_features_v1 test */
} from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import i18n from 'i18n-calypso';
import ExternalLink from 'calypso/components/external-link';
import ExternalLinkWithTracking from 'calypso/components/external-link/with-tracking';
import MaterialIcon from 'calypso/components/material-icon';
import { DOMAIN_PRICING_AND_AVAILABLE_TLDS } from 'calypso/lib/url/support';

export const FEATURES_LIST = {
	[ FEATURE_BLANK ]: {
		getSlug: () => FEATURE_BLANK,
		getTitle: () => '',
	},

	[ FEATURE_ALL_FREE_FEATURES_JETPACK ]: {
		getSlug: () => FEATURE_ALL_FREE_FEATURES_JETPACK,
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
								link_slug: FEATURE_ALL_FREE_FEATURES_JETPACK,
							} }
						/>
					),
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Also includes all features offered in the free version of Jetpack.' ),
	},

	[ FEATURE_ALL_FREE_FEATURES ]: {
		getSlug: () => FEATURE_ALL_FREE_FEATURES,
		getTitle: () => i18n.translate( 'All free features' ),
		getDescription: () => i18n.translate( 'Also includes all features offered in the free plan.' ),
	},

	[ FEATURE_ALL_PERSONAL_FEATURES_JETPACK ]: {
		getSlug: () => FEATURE_ALL_PERSONAL_FEATURES_JETPACK,
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
								link_slug: FEATURE_ALL_PERSONAL_FEATURES_JETPACK,
							} }
						/>
					),
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Also includes all features offered in the Personal plan.' ),
	},

	[ FEATURE_ALL_PERSONAL_FEATURES ]: {
		getSlug: () => FEATURE_ALL_PERSONAL_FEATURES,
		getTitle: () => i18n.translate( 'All Personal features' ),
		getDescription: () =>
			i18n.translate(
				'Including email and live chat support, an ad-free experience for your visitors, increased storage space, and a custom domain name for one year.'
			),
	},

	[ FEATURE_ALL_PREMIUM_FEATURES_JETPACK ]: {
		getSlug: () => FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
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
								link_slug: FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
							} }
						/>
					),
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Also includes all features offered in the Premium plan.' ),
	},

	[ FEATURE_ALL_PREMIUM_FEATURES ]: {
		getSlug: () => FEATURE_ALL_PREMIUM_FEATURES,
		getTitle: () => i18n.translate( 'All Premium features' ),
		getDescription: () => {
			return isEnabled( 'themes/premium' )
				? i18n.translate(
						'Including premium themes, advanced design and monetization options, Pay with PayPal buttons, and a custom domain name for one year.'
				  )
				: i18n.translate(
						'Including advanced design and monetization options, Pay with PayPal buttons, and a custom domain name for one year.'
				  );
		},
	},

	[ FEATURE_ADVANCED_CUSTOMIZATION ]: {
		getSlug: () => FEATURE_ADVANCED_CUSTOMIZATION,
		getTitle: () => i18n.translate( 'Advanced customization' ),
		getDescription: () =>
			i18n.translate(
				'Access extended color schemes, backgrounds, and CSS, giving you complete control over how your site looks.'
			),
	},

	[ FEATURE_FREE_BLOG_DOMAIN ]: {
		getSlug: () => FEATURE_FREE_BLOG_DOMAIN,
		getTitle: () => i18n.translate( 'Free .blog domain for one year' ),
		getDescription: () =>
			i18n.translate(
				'Get a free custom .blog domain for one year. Premium domains not included. Your domain will renew at its regular price.'
			),
	},

	[ FEATURE_FREE_DOMAIN ]: {
		getSlug: () => FEATURE_FREE_DOMAIN,
		getTitle: () => i18n.translate( 'Free domain for one year' ),
		getDescription: () =>
			i18n.translate(
				'All paid WordPress.com plans purchased for an annual term include one year of free domain registration. ' +
					'Domains registered through this promotion will renew at our {{a}}standard rate{{/a}}, plus applicable taxes, after the first year.{{br /}}{{br /}}' +
					'This offer is redeemable one time only, and does not apply to plan upgrades, renewals, or premium domains.',
				{
					components: {
						a: (
							<a
								href={ localizeUrl( DOMAIN_PRICING_AND_AVAILABLE_TLDS ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
						br: <br />,
					},
				}
			),
	},

	[ FEATURE_HOSTING ]: {
		getSlug: () => FEATURE_HOSTING,
		getTitle: () => i18n.translate( 'Best-in-class hosting' ),
		getDescription: () =>
			i18n.translate(
				'Site hosting is included with your plan, eliminating additional cost and technical hassle.'
			),
	},

	[ FEATURE_PREMIUM_THEMES ]: {
		getSlug: () => FEATURE_PREMIUM_THEMES,
		getTitle: () => {
			const shouldShowNewString =
				config( 'english_locales' ).includes( i18n.getLocaleSlug() ) ||
				i18n.hasTranslation( 'Unlimited premium themes' );

			return shouldShowNewString
				? i18n.translate( 'Unlimited premium themes' )
				: i18n.translate( 'Premium themes' );
		},
		getDescription: () => {
			const shouldShowNewString =
				config( 'english_locales' ).includes( i18n.getLocaleSlug() ) ||
				i18n.hasTranslation(
					'Unlimited access to all of our advanced premium themes, including designs specifically tailored for businesses.'
				);

			return shouldShowNewString
				? i18n.translate(
						'Unlimited access to all of our advanced premium themes, including designs specifically tailored for businesses.'
				  )
				: i18n.translate(
						'Access to all of our advanced premium theme templates, including templates specifically tailored for businesses.'
				  );
		},
	},

	[ FEATURE_MONETISE ]: {
		getSlug: () => FEATURE_MONETISE,
		getTitle: () => i18n.translate( 'Monetize your site with ads' ),
		getDescription: () =>
			i18n.translate(
				'Add advertising to your site through our WordAds program and earn money from impressions.'
			),
	},

	[ FEATURE_EARN_AD ]: {
		getSlug: () => FEATURE_EARN_AD,
		getTitle: () => i18n.translate( 'Earn ad revenue' ),
		getDescription: () => {},
	},

	[ FEATURE_UPLOAD_THEMES_PLUGINS ]: {
		getSlug: () => FEATURE_UPLOAD_THEMES_PLUGINS,
		getTitle: () => i18n.translate( 'Upload themes and plugins' ),
		getDescription: () => i18n.translate( 'Upload custom themes and plugins on your site.' ),
	},

	[ FEATURE_CLOUDFLARE_ANALYTICS ]: {
		getSlug: () => FEATURE_CLOUDFLARE_ANALYTICS,
		getTitle: () => i18n.translate( 'Cloudflare Web Analytics' ),
	},

	[ FEATURE_EMAIL_SUPPORT_SIGNUP ]: {
		getSlug: () => FEATURE_EMAIL_SUPPORT_SIGNUP,
		getTitle: () => i18n.translate( 'Unlimited customer support via email' ),
		getDescription: () =>
			i18n.translate( 'Email us any time, any day of the week for personalized, expert support.' ),
	},
	[ FEATURE_FREE_THEMES_SIGNUP ]: {
		getSlug: () => FEATURE_FREE_THEMES_SIGNUP,
		getTitle: () => i18n.translate( 'Dozens of free themes' ),
		getDescription: () =>
			i18n.translate(
				"Access to a wide range of professional themes so you can find a design that's just right for your site."
			),
	},

	[ FEATURE_WP_SUBDOMAIN_SIGNUP ]: {
		getSlug: () => FEATURE_WP_SUBDOMAIN_SIGNUP,
		getTitle: () => i18n.translate( 'WordPress.com subdomain' ),
		getDescription: () =>
			i18n.translate(
				'Your site address will use a WordPress.com subdomain (sitename.wordpress.com).'
			),
	},
	[ FEATURE_ADVANCED_SEO_TOOLS ]: {
		getSlug: () => FEATURE_ADVANCED_SEO_TOOLS,
		getTitle: () => i18n.translate( 'Advanced SEO tools' ),
		getDescription: () =>
			i18n.translate(
				'Boost traffic to your site with tools that make your content more findable on search engines and social media.'
			),
	},

	[ FEATURE_ADVANCED_SEO_EXPANDED_ABBR ]: {
		getSlug: () => FEATURE_ADVANCED_SEO_EXPANDED_ABBR,
		getTitle: () => i18n.translate( 'Advanced SEO (Search Engine Optimisation) tools' ),
		getDescription: () => {},
	},
	[ FEATURE_FREE_WORDPRESS_THEMES ]: {
		getSlug: () => FEATURE_FREE_WORDPRESS_THEMES,
		getTitle: () => i18n.translate( 'Free WordPress Themes' ),
	},
	[ FEATURE_SEO_PREVIEW_TOOLS ]: {
		getSlug: () => FEATURE_SEO_PREVIEW_TOOLS,
		getTitle: () => i18n.translate( 'SEO tools' ),
		getDescription: () =>
			i18n.translate(
				'Edit your page titles and meta descriptions, and preview how your content will appear on social media.'
			),
	},

	[ FEATURE_GOOGLE_ANALYTICS ]: {
		getSlug: () => FEATURE_GOOGLE_ANALYTICS,
		getTitle: () => i18n.translate( 'Google Analytics integration' ),
		getDescription: () =>
			i18n.translate(
				"Track your site's stats with Google Analytics for a " +
					'deeper understanding of your visitors and customers.'
			),
	},

	[ FEATURE_GOOGLE_MY_BUSINESS ]: {
		getSlug: () => FEATURE_GOOGLE_MY_BUSINESS,
		getTitle: () => i18n.translate( 'Google My Business' ),
		getDescription: () =>
			i18n.translate(
				'See how customers find you on Google -- and whether they visited your site ' +
					'and looked for more info on your business -- by connecting to a Google My Business location.'
			),
	},

	[ FEATURE_UNLIMITED_STORAGE ]: {
		getSlug: () => FEATURE_UNLIMITED_STORAGE,
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

	[ FEATURE_BLOG_DOMAIN ]: {
		getSlug: () => FEATURE_BLOG_DOMAIN,
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

	[ FEATURE_CUSTOM_DOMAIN ]: {
		getSlug: () => FEATURE_CUSTOM_DOMAIN,
		getTitle: ( domainName ) => {
			if ( domainName ) {
				return i18n.translate( 'The domain %(domainName)s is free for the first year', {
					args: { domainName },
				} );
			}

			return i18n.translate( 'Free domain for one year', {
				context: 'title',
			} );
		},
		getDescription: ( abtest, domainName ) => {
			if ( domainName ) {
				return i18n.translate( 'Your domain (%s) is included with this plan.', {
					args: domainName,
				} );
			}

			return i18n.translate(
				'All paid WordPress.com plans purchased for an annual term include one year of free domain registration. ' +
					'Domains registered through this promotion will renew at our {{a}}standard rate{{/a}}, plus applicable taxes, after the first year.{{br /}}{{br /}}' +
					'This offer is redeemable one time only, and does not apply to plan upgrades, renewals, or premium domains.',
				{
					components: {
						a: (
							<a
								href={ localizeUrl( DOMAIN_PRICING_AND_AVAILABLE_TLDS ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
						br: <br />,
					},
				}
			);
		},
	},

	[ FEATURE_JETPACK_ESSENTIAL ]: {
		getSlug: () => FEATURE_JETPACK_ESSENTIAL,
		getTitle: () => i18n.translate( 'Jetpack essential features' ),
		getDescription: () =>
			i18n.translate(
				'Optimize your site for better SEO, faster-loading pages, and protection from spam.'
			),
	},

	[ FEATURE_JETPACK_ADVANCED ]: {
		getSlug: () => FEATURE_JETPACK_ADVANCED,
		getTitle: () => i18n.translate( 'Jetpack advanced features' ),
		getHeader: () => i18n.translate( 'Jetpack advanced' ),
		getDescription: () =>
			i18n.translate(
				'Speed up your site’s performance and protect it from spammers. ' +
					'Access detailed records of all activity on your site and restore your site ' +
					'to a previous point in time with just a click! While you’re at it, ' +
					'improve your SEO with our Advanced SEO tools and automate social media sharing.'
			),
	},

	[ FEATURE_VIDEO_UPLOADS ]: {
		getSlug: () => FEATURE_VIDEO_UPLOADS,
		getTitle: () => i18n.translate( 'VideoPress support' ),
		getDescription: () =>
			i18n.translate(
				'The easiest way to upload videos to your website and display them ' +
					'using a fast, unbranded, customizable player with rich stats.'
			),
		getStoreSlug: () => 'videopress',
	},
	[ FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM ]: {
		getSlug: () => FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM,
		getTitle: () => i18n.translate( 'VideoPress support' ),
		getDescription: () =>
			i18n.translate(
				'Easy video uploads, and a fast, unbranded, customizable video player, ' +
					'enhanced with rich stats and unlimited storage space. '
			),
		getStoreSlug: () => 'videopress',
	},

	[ FEATURE_VIDEO_UPLOADS_JETPACK_PRO ]: {
		getSlug: () => FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
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

	[ FEATURE_AUDIO_UPLOADS ]: {
		getSlug: () => FEATURE_AUDIO_UPLOADS,
		getTitle: () => i18n.translate( 'Audio upload support' ),
		getDescription: () =>
			i18n.translate(
				'The easiest way to upload audio files that use any major audio file format. '
			),
		getStoreSlug: () => 'videopress',
	},

	[ FEATURE_BASIC_DESIGN ]: {
		getSlug: () => FEATURE_BASIC_DESIGN,
		getTitle: () => i18n.translate( 'Basic design customization' ),
		getDescription: () =>
			i18n.translate(
				'Customize your selected theme with pre-set color schemes, ' +
					'background designs, and font styles.'
			),
		getStoreSlug: () => FEATURE_ADVANCED_DESIGN,
	},

	[ FEATURE_ADVANCED_DESIGN ]: {
		getSlug: () => FEATURE_ADVANCED_DESIGN,
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
		getStoreSlug: () => FEATURE_ADVANCED_DESIGN,
	},

	[ FEATURE_NO_ADS ]: {
		getSlug: () => FEATURE_NO_ADS,
		getTitle: () => i18n.translate( 'Remove WordPress.com ads' ),
		getDescription: () =>
			i18n.translate(
				'Allow your visitors to visit and read your website without ' +
					'seeing any WordPress.com advertising.'
			),
		getStoreSlug: () => 'no-adverts/no-adverts.php',
	},
	[ FEATURE_REPUBLICIZE ]: {
		getSlug: () => FEATURE_REPUBLICIZE,
		getTitle: () => i18n.translate( 'Advanced social media' ),
		getDescription: () =>
			i18n.translate(
				"Schedule your social media updates in advance and promote your posts when it's best for you."
			),
	},
	[ FEATURE_SIMPLE_PAYMENTS ]: {
		getSlug: () => FEATURE_SIMPLE_PAYMENTS,
		getTitle: () => i18n.translate( 'Pay with PayPal' ),
		getDescription: () => i18n.translate( 'Sell anything with a simple PayPal button.' ),
	},
	[ FEATURE_NO_BRANDING ]: {
		getSlug: () => FEATURE_NO_BRANDING,
		getTitle: () => i18n.translate( 'Remove WordPress.com branding' ),
		getDescription: () =>
			i18n.translate(
				"Keep the focus on your site's brand by removing the WordPress.com footer branding."
			),
		getStoreSlug: () => 'no-adverts/no-adverts.php',
	},

	[ FEATURE_ADVANCED_SEO ]: {
		getSlug: () => FEATURE_ADVANCED_SEO,
		getTitle: () => i18n.translate( 'SEO tools' ),
		getDescription: () =>
			i18n.translate(
				'Boost traffic to your site with tools that make your content more findable on search engines and social media.'
			),
	},

	[ FEATURE_UPLOAD_PLUGINS ]: {
		getSlug: () => FEATURE_UPLOAD_PLUGINS,
		getTitle: () => i18n.translate( 'Install plugins' ),
		getDescription: () =>
			i18n.translate(
				'Plugins extend the functionality of your site and ' +
					'open up endless possibilities for presenting your content and interacting with visitors.'
			),
	},

	[ FEATURE_INSTALL_PLUGINS ]: {
		getSlug: () => FEATURE_INSTALL_PLUGINS,
		getTitle: () =>
			i18n.translate(
				'Access to more than 50,000 WordPress plugins to extend functionality for your site'
			),
	},

	[ FEATURE_UPLOAD_THEMES ]: {
		getSlug: () => FEATURE_UPLOAD_THEMES,
		getTitle: () => i18n.translate( 'Install themes' ),
		getDescription: () =>
			i18n.translate(
				'With the option to upload themes, you can give your site a professional polish ' +
					'that will help it stand out among the rest.'
			),
	},

	[ FEATURE_WORDADS_INSTANT ]: {
		getSlug: () => FEATURE_WORDADS_INSTANT,
		getTitle: () => i18n.translate( 'Site monetization' ),
		getDescription: () =>
			i18n.translate(
				'Earn money on your site by displaying ads and collecting payments or donations.'
			),
	},

	[ FEATURE_WP_SUBDOMAIN ]: {
		getSlug: () => FEATURE_WP_SUBDOMAIN,
		getTitle: () => i18n.translate( 'WordPress.com subdomain' ),
		getDescription: () =>
			i18n.translate(
				'Your site address will use a WordPress.com subdomain (sitename.wordpress.com).'
			),
	},

	[ FEATURE_FREE_THEMES ]: {
		getSlug: () => FEATURE_FREE_THEMES,
		getTitle: () => i18n.translate( 'Dozens of free themes' ),
		getDescription: () =>
			i18n.translate(
				'Access to a wide range of professional themes ' +
					"so you can find a design that's just right for your site."
			),
	},

	[ FEATURE_1GB_STORAGE ]: {
		getSlug: () => FEATURE_1GB_STORAGE,
		getTitle: () => i18n.translate( '1GB storage space' ),
		getCompareTitle: () => i18n.translate( '1GB' ),
		getDescription: () =>
			i18n.translate( 'Storage space for adding images and documents to your website.' ),
	},

	[ FEATURE_3GB_STORAGE ]: {
		getSlug: () => FEATURE_3GB_STORAGE,
		getTitle: () => i18n.translate( '3 GB storage space' ),
		getDescription: () =>
			i18n.translate( 'Storage space for adding images and documents to your website.' ),
	},

	[ FEATURE_6GB_STORAGE ]: {
		getSlug: () => FEATURE_6GB_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}6 GB{{/strong}} storage space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Upload more images, audio, and documents to your website.' ),
	},

	[ FEATURE_13GB_STORAGE ]: {
		getSlug: () => FEATURE_13GB_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}13 GB{{/strong}} storage space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Upload more images, videos, audio, and documents to your website.' ),
	},

	[ FEATURE_50GB_STORAGE ]: {
		getSlug: () => FEATURE_50GB_STORAGE,
		getTitle: () => i18n.translate( '50 GB storage space' ),
		getDescription: () =>
			i18n.translate( 'Storage space for adding images and documents to your website.' ),
	},

	[ FEATURE_200GB_STORAGE ]: {
		getSlug: () => FEATURE_200GB_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}200 GB{{/strong}} storage space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Upload more images, videos, audio, and documents to your website.' ),
	},

	[ FEATURE_COMMUNITY_SUPPORT ]: {
		getSlug: () => FEATURE_COMMUNITY_SUPPORT,
		getTitle: () => i18n.translate( 'Community support' ),
		getDescription: () => i18n.translate( 'Get support through our ' + 'user community forums.' ),
	},

	[ FEATURE_EMAIL_SUPPORT ]: {
		getSlug: () => FEATURE_EMAIL_SUPPORT,
		getTitle: () => i18n.translate( 'Unlimited customer support via email' ),
		getDescription: () =>
			i18n.translate( 'Email us any time, any day of the week for personalized, expert support.' ),
	},

	[ FEATURE_EMAIL_LIVE_CHAT_SUPPORT ]: {
		getSlug: () => FEATURE_EMAIL_LIVE_CHAT_SUPPORT,
		getTitle: () => i18n.translate( 'Email & live chat support' ),
		getDescription: () =>
			i18n.translate( 'Live chat support to help you get started with your site.' ),
	},

	[ FEATURE_EMAIL_LIVE_CHAT_SUPPORT_BUSINESS_DAYS ]: {
		getSlug: () => FEATURE_EMAIL_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
		getTitle: () => i18n.translate( 'Email & live chat support' ),
		getDescription: () =>
			i18n.translate(
				'Live chat is available 24 hours a day from Monday through Friday. ' +
					'You can also email us any day of the week for personalized support.'
			),
	},

	[ FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS ]: {
		getSlug: () => FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS,
		getTitle: () => i18n.translate( 'Email & live chat support' ),
		getDescription: () =>
			i18n.translate(
				'Live chat is available 24/7. ' +
					'You can also email us any day of the week for personalized support.'
			),
	},

	[ FEATURE_LIVE_CHAT_SUPPORT ]: {
		getSlug: () => FEATURE_LIVE_CHAT_SUPPORT,
		getTitle: () => i18n.translate( 'Live chat support' ),
		getDescription: () =>
			i18n.translate( 'Live chat is available 24 hours a day from Monday through Friday.' ),
	},

	[ FEATURE_PREMIUM_SUPPORT ]: {
		getSlug: () => FEATURE_PREMIUM_SUPPORT,
		getTitle: () => i18n.translate( 'Priority Support' ),
		getDescription: () =>
			i18n.translate( 'Live chat support to help you get started with Jetpack.' ),
	},

	[ FEATURE_STANDARD_SECURITY_TOOLS ]: {
		getSlug: () => FEATURE_STANDARD_SECURITY_TOOLS,
		getTitle: () => i18n.translate( 'Standard security tools' ),
		getDescription: () =>
			i18n.translate(
				'Brute force protection, downtime monitoring, secure sign on, ' +
					'and automatic updates for your plugins.'
			),
	},
	[ FEATURE_SITE_STATS ]: {
		getSlug: () => FEATURE_SITE_STATS,
		getTitle: () => i18n.translate( 'Site Stats and Analytics' ),
		getDescription: () => i18n.translate( 'The most important metrics for your site.' ),
	},
	[ FEATURE_TRAFFIC_TOOLS ]: {
		getSlug: () => FEATURE_TRAFFIC_TOOLS,
		getTitle: () => i18n.translate( 'Traffic and Promotion Tools' ),
		getDescription: () =>
			i18n.translate( 'Build and engage your audience with more than a dozen optimization tools.' ),
	},
	[ FEATURE_MANAGE ]: {
		getSlug: () => FEATURE_MANAGE,
		getTitle: () => i18n.translate( 'Centralized Dashboard' ),
		getDescription: () => i18n.translate( 'Manage all of your WordPress sites from one location.' ),
	},
	[ FEATURE_SPAM_AKISMET_PLUS ]: {
		getSlug: () => FEATURE_SPAM_AKISMET_PLUS,
		getTitle: () => i18n.translate( 'Spam Protection' ),
		getDescription: () => i18n.translate( 'State-of-the-art spam defense, powered by Akismet.' ),
	},
	[ FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY ]: {
		getSlug: () => FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
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
	[ FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME ]: {
		getSlug: () => FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
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
	[ FEATURE_BACKUP_ARCHIVE_30 ]: {
		getSlug: () => FEATURE_BACKUP_ARCHIVE_30,
		getTitle: () => i18n.translate( '30-day backup archive' ),
		getDescription: () =>
			i18n.translate( 'Browse or restore any backup made within the past 30 days.' ),
	},
	[ FEATURE_BACKUP_ARCHIVE_UNLIMITED ]: {
		getSlug: () => FEATURE_BACKUP_ARCHIVE_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited backup archive' ),
		getDescription: () =>
			i18n.translate( 'Browse or restore any backup made since you activated the service.' ),
	},

	[ FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED ]: {
		getSlug: () => FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited backup storage space' ),
		getDescription: () =>
			i18n.translate( 'Absolutely no limits on storage space for your backups.' ),
	},

	[ FEATURE_AUTOMATED_RESTORES ]: {
		getSlug: () => FEATURE_AUTOMATED_RESTORES,
		getTitle: () => i18n.translate( 'Automated restores' ),
		getDescription: () =>
			i18n.translate( 'Restore your site from any available backup with a single click.' ),
	},
	[ FEATURE_EASY_SITE_MIGRATION ]: {
		getSlug: () => FEATURE_EASY_SITE_MIGRATION,
		getTitle: () => i18n.translate( 'Easy site migration' ),
		getDescription: () =>
			i18n.translate( 'Easily and quickly move or duplicate your site to any location.' ),
	},
	[ FEATURE_MALWARE_SCANNING_DAILY ]: {
		getSlug: () => FEATURE_MALWARE_SCANNING_DAILY,
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
	[ FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND ]: {
		getSlug: () => FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
		getTitle: () => i18n.translate( 'Daily and on-demand malware scanning' ),
		getDescription: () =>
			i18n.translate(
				'Automated security scanning with the option to run complete site scans at any time.'
			),
	},
	[ FEATURE_ONE_CLICK_THREAT_RESOLUTION ]: {
		getSlug: () => FEATURE_ONE_CLICK_THREAT_RESOLUTION,
		getTitle: () => i18n.translate( 'One-click threat resolution' ),
		getDescription: () =>
			i18n.translate( 'Repair any security issues found on your site with just a single click.' ),
	},
	[ FEATURE_AUTOMATIC_SECURITY_FIXES ]: {
		getSlug: () => FEATURE_AUTOMATIC_SECURITY_FIXES,
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
	[ FEATURE_ACTIVITY_LOG ]: {
		getSlug: () => FEATURE_ACTIVITY_LOG,
		getTitle: () => i18n.translate( 'Expanded site activity' ),
		getDescription: () =>
			i18n.translate(
				'Take the guesswork out of site management and debugging with a filterable record of all the activity happening on your site.'
			),
	},
	[ FEATURE_SITE_BACKUPS_AND_RESTORE ]: {
		getSlug: () => FEATURE_SITE_BACKUPS_AND_RESTORE,
		getTitle: () => i18n.translate( 'Automated site backups and one-click restore' ),
		getDescription: () => {},
	},
	[ FEATURE_ACCEPT_PAYMENTS ]: {
		getSlug: () => FEATURE_ACCEPT_PAYMENTS,
		getTitle: () => i18n.translate( 'Accept payments in 60+ countries' ),
		getDescription: () =>
			i18n.translate(
				'Built-in payment processing from leading providers like Stripe, PayPal, and more. Accept payments from customers all over the world.'
			),
	},

	[ FEATURE_SHIPPING_CARRIERS ]: {
		getSlug: () => FEATURE_SHIPPING_CARRIERS,
		getTitle: () => i18n.translate( 'Integrations with top shipping carriers' ),
		getDescription: () =>
			i18n.translate(
				'Ship physical products in a snap - show live rates from shipping carriers like UPS and other shipping options.'
			),
	},

	[ FEATURE_UNLIMITED_PRODUCTS_SERVICES ]: {
		getSlug: () => FEATURE_UNLIMITED_PRODUCTS_SERVICES,
		getTitle: () => i18n.translate( 'Unlimited products or services' ),
		getDescription: () =>
			i18n.translate(
				'Grow your store as big as you want with the ability to add and sell unlimited products and services.'
			),
	},

	[ FEATURE_ECOMMERCE_MARKETING ]: {
		getSlug: () => FEATURE_ECOMMERCE_MARKETING,
		getTitle: () => i18n.translate( 'eCommerce marketing tools' ),
		getDescription: () =>
			i18n.translate(
				'Optimize your store for sales by adding in email and social integrations with Facebook and Mailchimp, and more.'
			),
	},

	[ FEATURE_PREMIUM_CUSTOMIZABE_THEMES ]: {
		getSlug: () => FEATURE_PREMIUM_CUSTOMIZABE_THEMES,
		getTitle: () => i18n.translate( 'Premium customizable starter themes' ),
		getDescription: () =>
			i18n.translate(
				'Quickly get up and running with a beautiful store theme and additional design options that you can easily make your own.'
			),
	},

	[ FEATURE_ALL_BUSINESS_FEATURES ]: {
		getSlug: () => FEATURE_ALL_BUSINESS_FEATURES,
		getTitle: () => i18n.translate( 'All Business features' ),
		getDescription: () =>
			i18n.translate(
				'Including the ability to upload plugins and themes, priority support and advanced monetization options.'
			),
	},

	[ FEATURE_MEMBERSHIPS ]: {
		getSlug: () => FEATURE_MEMBERSHIPS,
		getTitle: () => i18n.translate( 'Payments' ),
		getDescription: () =>
			i18n.translate( 'Accept one-time, monthly, or annual payments on your website.' ),
	},

	[ FEATURE_PREMIUM_CONTENT_BLOCK ]: {
		getSlug: () => FEATURE_PREMIUM_CONTENT_BLOCK,
		getTitle: () => i18n.translate( 'Subscriber-only content' ),
		getDescription: () =>
			i18n.translate(
				'Create additional, premium content that you can make available to paying subscribers only.'
			),
	},

	[ FEATURE_PLAN_SECURITY_DAILY ]: {
		getSlug: () => FEATURE_PLAN_SECURITY_DAILY,
		getIcon: () => 'lock',
		getTitle: () => i18n.translate( 'All Security Daily features' ),
		isPlan: true,
	},
	[ FEATURE_BACKUP_DAILY_V2 ]: {
		getSlug: () => FEATURE_BACKUP_DAILY_V2,
		getTitle: () => i18n.translate( 'Automated daily backups (off-site)' ),
	},

	[ FEATURE_BACKUP_REALTIME_V2 ]: {
		getSlug: () => FEATURE_BACKUP_REALTIME_V2,
		getTitle: () => i18n.translate( 'Backup (real-time, off-site)' ),
	},
	[ FEATURE_PRODUCT_BACKUP_DAILY_V2 ]: {
		getSlug: () => FEATURE_PRODUCT_BACKUP_DAILY_V2,
		getIcon: () => 'cloud-upload',
		getTitle: () => i18n.translate( 'All Backup Daily features' ),
		getDescription: () =>
			i18n.translate(
				'Automatic daily backups of your entire site, with unlimited, WordPress-optimized secure storage. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/backup/" />,
					},
				}
			),
	},

	[ FEATURE_PRODUCT_BACKUP_REALTIME_V2 ]: {
		getSlug: () => FEATURE_PRODUCT_BACKUP_REALTIME_V2,
		getIcon: () => 'cloud-upload',
		getTitle: () => i18n.translate( 'Backup Real-time (off-site)' ),
		getDescription: () =>
			i18n.translate(
				'Real-time backups of your entire site and database with unlimited secure storage. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/backup/" />,
					},
				}
			),
	},

	[ FEATURE_SCAN_V2 ]: {
		getSlug: () => FEATURE_SCAN_V2,
		getTitle: () => i18n.translate( 'Automated daily scanning' ),
	},

	// * Scan Daily *
	// Currently we're not distinguishing between Scan 'Daily' or 'Real-time',
	// but leaving this here because we may be implementing Scan 'Daily' and 'Real-time'
	// in the near future.
	[ FEATURE_PRODUCT_SCAN_DAILY_V2 ]: {
		getSlug: () => FEATURE_PRODUCT_SCAN_DAILY_V2,
		getIcon: () => ( { icon: 'security', component: MaterialIcon } ),
		getTitle: () => i18n.translate( 'Scan (daily, automated)' ),
		getDescription: () =>
			i18n.translate(
				'Automated daily scanning for security vulnerabilities or threats on your site. Includes instant notifications and automatic security fixes. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/scan/" />,
					},
				}
			),
	},

	// * Scan Real-time *
	// Currently we're not distinguishing between Scan 'Daily' or 'Real-time',
	// but leaving this here because we may be implementing Scan 'Daily' and 'Real-time'
	// in the near future.
	[ FEATURE_PRODUCT_SCAN_REALTIME_V2 ]: {
		getSlug: () => FEATURE_PRODUCT_SCAN_REALTIME_V2,
		getIcon: () => ( { icon: 'security', component: MaterialIcon } ),
		getTitle: () => i18n.translate( 'Scan (real-time, automated)' ),
		getDescription: () =>
			i18n.translate(
				'Automated real-time scanning for security vulnerabilities or threats on your site. Includes instant notifications and automatic security fixes. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/scan/" />,
					},
				}
			),
	},

	[ FEATURE_ANTISPAM_V2 ]: {
		getSlug: () => FEATURE_ANTISPAM_V2,
		getTitle: () => i18n.translate( 'Comment and form spam protection' ),
	},

	[ FEATURE_WAF ]: {
		getSlug: () => FEATURE_WAF,
		getTitle: () =>
			i18n.translate( 'Website firewall (WAF beta)', {
				comment: 'WAF stands for Web Application Firewall',
			} ),
	},

	[ FEATURE_ACTIVITY_LOG_1_YEAR_V2 ]: {
		getSlug: () => FEATURE_ACTIVITY_LOG_1_YEAR_V2,
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

	[ FEATURE_SEARCH_V2 ]: {
		getSlug: () => FEATURE_SEARCH_V2,
		getTitle: () => i18n.translate( 'Instant search and indexing' ),
	},

	[ FEATURE_PRODUCT_SEARCH_V2 ]: {
		getSlug: () => FEATURE_PRODUCT_SEARCH_V2,
		getTitle: () => i18n.translate( 'Site Search up to 100k records' ),

		getDescription: () =>
			i18n.translate(
				'Help your site visitors find answers instantly so they keep reading and buying. Powerful filtering and customization options. {{link}}Learn more.{{/link}}',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/search/" />,
					},
				}
			),
	},

	[ FEATURE_VIDEO_HOSTING_V2 ]: {
		getSlug: () => FEATURE_VIDEO_HOSTING_V2,
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

	[ FEATURE_CRM_V2 ]: {
		getSlug: () => FEATURE_CRM_V2,
		getTitle: () => i18n.translate( 'CRM Entrepreneur' ),
		getDescription: () =>
			i18n.translate(
				'The most simple and powerful WordPress CRM. Improve customer relationships and increase profits. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpackcrm.com" />,
					},
				}
			),
	},

	[ FEATURE_CRM_INTEGRATED_WITH_WORDPRESS ]: {
		getSlug: () => FEATURE_CRM_INTEGRATED_WITH_WORDPRESS,
		getTitle: () => i18n.translate( 'CRM fully integrated with WordPress' ),
	},

	[ FEATURE_CRM_LEADS_AND_FUNNEL ]: {
		getSlug: () => FEATURE_CRM_LEADS_AND_FUNNEL,
		getTitle: () => i18n.translate( 'Easily view leads and sales funnel' ),
	},

	[ FEATURE_CRM_PROPOSALS_AND_INVOICES ]: {
		getSlug: () => FEATURE_CRM_PROPOSALS_AND_INVOICES,
		getTitle: () => i18n.translate( 'Manage billing and create invoices' ),
	},

	[ FEATURE_CRM_TRACK_TRANSACTIONS ]: {
		getSlug: () => FEATURE_CRM_TRACK_TRANSACTIONS,
		getTitle: () => i18n.translate( 'Track transactions' ),
	},

	[ FEATURE_CRM_NO_CONTACT_LIMITS ]: {
		getSlug: () => FEATURE_CRM_NO_CONTACT_LIMITS,
		getTitle: () => i18n.translate( 'Unlimited contacts' ),
	},

	[ FEATURE_COLLECT_PAYMENTS_V2 ]: {
		getSlug: () => FEATURE_COLLECT_PAYMENTS_V2,
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
	[ FEATURE_SECURE_STORAGE_V2 ]: {
		getSlug: () => FEATURE_SECURE_STORAGE_V2,
		getTitle: () => i18n.translate( 'Unlimited backup storage' ),
	},

	[ FEATURE_ONE_CLICK_RESTORE_V2 ]: {
		getSlug: () => FEATURE_ONE_CLICK_RESTORE_V2,
		getTitle: () => i18n.translate( 'One-click restores' ),
	},

	[ FEATURE_ONE_CLICK_FIX_V2 ]: {
		getSlug: () => FEATURE_ONE_CLICK_FIX_V2,
		getTitle: () => i18n.translate( 'One-click fixes for most issues' ),
	},

	[ FEATURE_INSTANT_EMAIL_V2 ]: {
		getSlug: () => FEATURE_INSTANT_EMAIL_V2,
		getTitle: () => i18n.translate( 'Instant email notifications' ),
	},

	[ FEATURE_AKISMET_V2 ]: {
		getSlug: () => FEATURE_AKISMET_V2,
		getTitle: () => i18n.translate( 'Powered by Akismet' ),
	},

	[ FEATURE_SPAM_BLOCK_V2 ]: {
		getSlug: () => FEATURE_SPAM_BLOCK_V2,
		getTitle: () => i18n.translate( 'Block spam without CAPTCHAs' ),
	},

	[ FEATURE_SPAM_10K_PER_MONTH ]: {
		getSlug: () => FEATURE_SPAM_10K_PER_MONTH,
		getTitle: () =>
			i18n.translate( '10K API calls/mo', {
				comment: '10 thousand API calls per month',
			} ),
	},

	[ FEATURE_FILTERING_V2 ]: {
		getSlug: () => FEATURE_FILTERING_V2,
		getTitle: () => i18n.translate( 'Powerful filtering' ),
	},

	[ FEATURE_LANGUAGE_SUPPORT_V2 ]: {
		getSlug: () => FEATURE_LANGUAGE_SUPPORT_V2,
		getTitle: () => i18n.translate( 'Supports 29 languages' ),
	},

	[ FEATURE_SPELLING_CORRECTION_V2 ]: {
		getSlug: () => FEATURE_SPELLING_CORRECTION_V2,
		getTitle: () => i18n.translate( 'Spelling correction' ),
	},

	[ FEATURE_SUPPORTS_WOOCOMMERCE_V2 ]: {
		getSlug: () => FEATURE_SUPPORTS_WOOCOMMERCE_V2,
		getTitle: () => i18n.translate( 'Works seamlessly with WooCommerce' ),
	},

	[ FEATURE_P2_3GB_STORAGE ]: {
		getSlug: () => FEATURE_P2_3GB_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}3GB{{/strong}} storage space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Upload images and documents and share them with your team.' ),
	},

	[ FEATURE_P2_UNLIMITED_USERS ]: {
		getSlug: () => FEATURE_P2_UNLIMITED_USERS,
		getTitle: () => i18n.translate( 'Unlimited users' ),
		getDescription: () => i18n.translate( 'Invite as many people as you need to your P2.' ),
	},

	[ FEATURE_P2_UNLIMITED_POSTS_PAGES ]: {
		getSlug: () => FEATURE_P2_UNLIMITED_POSTS_PAGES,
		getTitle: () => i18n.translate( 'Unlimited posts and pages' ),
		getDescription: () =>
			i18n.translate( 'Communicate as often as you want, with full access to your archive.' ),
	},

	[ FEATURE_P2_SIMPLE_SEARCH ]: {
		getSlug: () => FEATURE_P2_SIMPLE_SEARCH,
		getTitle: () => i18n.translate( 'Simple search' ),
		getDescription: () => i18n.translate( 'Easily find what you’re looking for.' ),
	},

	[ FEATURE_P2_CUSTOMIZATION_OPTIONS ]: {
		getSlug: () => FEATURE_P2_CUSTOMIZATION_OPTIONS,
		getTitle: () => i18n.translate( 'Customization options' ),
		getDescription: () =>
			i18n.translate( 'Make your team feel at home with some easy customization options.' ),
	},

	[ FEATURE_P2_13GB_STORAGE ]: {
		getSlug: () => FEATURE_P2_13GB_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}13GB{{/strong}} storage space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () => i18n.translate( 'Upload more files to your P2.' ),
	},

	[ FEATURE_P2_ADVANCED_SEARCH ]: {
		getSlug: () => FEATURE_P2_ADVANCED_SEARCH,
		getTitle: () => i18n.translate( 'Advanced search' ),
		getDescription: () =>
			i18n.translate(
				'A faster and more powerful search engine to make finding what you’re looking for easier.'
			),
	},

	[ FEATURE_P2_VIDEO_SHARING ]: {
		getSlug: () => FEATURE_P2_VIDEO_SHARING,
		getTitle: () => i18n.translate( 'Easy video sharing' ),
		getDescription: () =>
			i18n.translate(
				'Upload videos directly to your P2 for your team to see, without depending on external services.'
			),
	},

	[ FEATURE_P2_MORE_FILE_TYPES ]: {
		getSlug: () => FEATURE_P2_MORE_FILE_TYPES,
		getTitle: () => i18n.translate( 'More file types' ),
		getDescription: () => i18n.translate( 'Upload videos, audio, .zip and .key files.' ),
	},

	[ FEATURE_P2_PRIORITY_CHAT_EMAIL_SUPPORT ]: {
		getSlug: () => FEATURE_P2_PRIORITY_CHAT_EMAIL_SUPPORT,
		getTitle: () => i18n.translate( 'Priority customer support' ),
		getDescription: () =>
			i18n.translate(
				'Live chat is available 24 hours a day from Monday through Friday. You can also email us any day of the week for personalized support.'
			),
	},

	[ FEATURE_P2_ACTIVITY_OVERVIEW ]: {
		getSlug: () => FEATURE_P2_ACTIVITY_OVERVIEW,
		getTitle: () => i18n.translate( 'Activity overview panel' ),
		getDescription: () =>
			i18n.translate( 'A complete record of everything that happens on your P2.' ),
	},
	[ FEATURE_SFTP_DATABASE ]: {
		getSlug: () => FEATURE_SFTP_DATABASE,
		getTitle: () => i18n.translate( 'SFTP (SSH File Transfer Protocol) and Database Access' ),
		getDescription: () => {},
	},

	[ PREMIUM_DESIGN_FOR_STORES ]: {
		getSlug: () => PREMIUM_DESIGN_FOR_STORES,
		getTitle: () => i18n.translate( 'Premium design options customized for online stores' ),
		getDescription: () => {},
	},

	[ FEATURE_LIVE_CHAT_SUPPORT_BUSINESS_DAYS ]: {
		getSlug: () => FEATURE_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
		getTitle: () => i18n.translate( 'Live chat support' ),
		getDescription: () => i18n.translate( 'Live chat support' ),
	},

	[ FEATURE_LIVE_CHAT_SUPPORT_ALL_DAYS ]: {
		getSlug: () => FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS,
		getTitle: () => i18n.translate( 'Live chat support' ),
		getDescription: () => i18n.translate( 'Live chat support' ),
	},

	[ FEATURE_JETPACK_VIDEOPRESS ]: {
		getSlug: () => FEATURE_JETPACK_VIDEOPRESS,
		getTitle: () => i18n.translate( 'Unlimited users' ),
	},

	[ FEATURE_JETPACK_VIDEOPRESS_EDITOR ]: {
		getSlug: () => FEATURE_JETPACK_VIDEOPRESS_EDITOR,
		getTitle: () => i18n.translate( 'Built into WordPress editor' ),
	},

	[ FEATURE_JETPACK_VIDEOPRESS_UNBRANDED ]: {
		getSlug: () => FEATURE_JETPACK_VIDEOPRESS_UNBRANDED,
		getTitle: () => i18n.translate( 'Ad-free and brandable player' ),
	},

	[ FEATURE_JETPACK_VIDEOPRESS_STORAGE ]: {
		getSlug: () => FEATURE_JETPACK_VIDEOPRESS_STORAGE,
		getTitle: () => i18n.translate( '1TB of storage' ),
	},

	/* START - Jetpack tiered product-specific features */
	[ FEATURE_JETPACK_10GB_BACKUP_STORAGE ]: {
		getSlug: () => FEATURE_JETPACK_10GB_BACKUP_STORAGE,
		getTitle: () => i18n.translate( 'Starts with 10GB of storage' ),
	},
	[ FEATURE_JETPACK_1TB_BACKUP_STORAGE ]: {
		getSlug: () => FEATURE_JETPACK_1TB_BACKUP_STORAGE,
		getTitle: () => i18n.translate( '1TB of backup storage' ),
	},
	[ FEATURE_JETPACK_30_DAY_ARCHIVE_ACTIVITY_LOG ]: {
		getSlug: () => FEATURE_JETPACK_30_DAY_ARCHIVE_ACTIVITY_LOG,
		getTitle: () => i18n.translate( '30-day archive & activity log*' ),
	},
	[ FEATURE_JETPACK_1_YEAR_ARCHIVE_ACTIVITY_LOG ]: {
		getSlug: () => FEATURE_JETPACK_1_YEAR_ARCHIVE_ACTIVITY_LOG,
		getTitle: () => i18n.translate( '1-year archive & activity log*' ),
	},
	[ FEATURE_JETPACK_PRODUCT_BACKUP ]: {
		getSlug: () => FEATURE_JETPACK_PRODUCT_BACKUP,
		getTitle: () => i18n.translate( 'All Backup features' ),
	},
	[ FEATURE_JETPACK_PRODUCT_VIDEOPRESS ]: {
		getSlug: () => FEATURE_JETPACK_PRODUCT_VIDEOPRESS,
		getTitle: () => i18n.translate( 'VideoPress' ),
	},
	[ FEATURE_JETPACK_ALL_BACKUP_SECURITY_FEATURES ]: {
		getSlug: () => FEATURE_JETPACK_ALL_BACKUP_SECURITY_FEATURES,
		getTitle: () => i18n.translate( 'All Backup & Security features' ),
	},
	[ FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS ]: {
		getSlug: () => FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS,
		getTitle: () => i18n.translate( 'Real-time cloud backups' ),
	},
	[ FEATURE_JETPACK_REAL_TIME_MALWARE_SCANNING ]: {
		getSlug: () => FEATURE_JETPACK_REAL_TIME_MALWARE_SCANNING,
		getTitle: () => i18n.translate( 'Real-time malware scanning' ),
	},
	/* END - Jetpack tiered product-specific features */

	/* START - New features Flexible and Pro plans introduced. */
	[ FEATURE_UNLIMITED_USERS ]: {
		getSlug: () => FEATURE_UNLIMITED_USERS,
		getTitle: () => i18n.translate( 'Unlimited users' ),
	},
	[ FEATURE_UNLIMITED_POSTS_PAGES ]: {
		getSlug: () => FEATURE_UNLIMITED_POSTS_PAGES,
		getTitle: () => i18n.translate( 'Unlimited blog posts and pages' ),
	},
	[ FEATURE_PAYMENT_BLOCKS ]: {
		getSlug: () => FEATURE_PAYMENT_BLOCKS,
		getTitle: () => i18n.translate( 'Payment blocks' ),
	},
	[ FEATURE_TITAN_EMAIL ]: {
		getSlug: () => FEATURE_TITAN_EMAIL,
		getTitle: () => i18n.translate( 'Titan e-mail' ),
	},
	[ FEATURE_UNLIMITED_ADMINS ]: {
		getSlug: () => FEATURE_UNLIMITED_ADMINS,
		getTitle: () => i18n.translate( 'Unlimited admins' ),
	},
	[ FEATURE_ADDITIONAL_SITES ]: {
		getSlug: () => FEATURE_ADDITIONAL_SITES,
		getTitle: () => i18n.translate( 'Additional websites' ),
	},
	[ FEATURE_WOOCOMMERCE ]: {
		getSlug: () => FEATURE_WOOCOMMERCE,
		getTitle: () => i18n.translate( 'WooCommerce' ),
	},
	/* END - New features Flexible and Pro plans introduced. */

	[ FEATURE_UNLIMITED_EMAILS ]: {
		getSlug: () => FEATURE_UNLIMITED_EMAILS,
		getTitle: () => i18n.translate( 'Send unlimited emails' ),
	},
	[ FEATURE_UNLIMITED_SUBSCRIBERS ]: {
		getSlug: () => FEATURE_UNLIMITED_SUBSCRIBERS,
		getTitle: () => i18n.translate( 'Unlimited subscribers' ),
	},
	[ FEATURE_IMPORT_SUBSCRIBERS ]: {
		getSlug: () => FEATURE_IMPORT_SUBSCRIBERS,
		getTitle: () => i18n.translate( 'Import subscribers' ),
	},
	[ FEATURE_ADD_MULTIPLE_PAGES_NEWSLETTER ]: {
		getSlug: () => FEATURE_ADD_MULTIPLE_PAGES_NEWSLETTER,
		getTitle: () => i18n.translate( `Add multiple pages to your Newsletter's website` ),
	},
	[ FEATURE_AD_FREE_EXPERIENCE ]: {
		getSlug: () => FEATURE_AD_FREE_EXPERIENCE,
		getTitle: () => i18n.translate( 'Ad-free experience' ),
	},
	[ FEATURE_COLLECT_PAYMENTS_NEWSLETTER ]: {
		getSlug: () => FEATURE_COLLECT_PAYMENTS_NEWSLETTER,
		getTitle: () =>
			i18n.translate( 'Monetize your Newsletter with payments, subscriptions, and donations' ),
	},
	[ FEATURE_POST_BY_EMAIL ]: {
		getSlug: () => FEATURE_POST_BY_EMAIL,
		getTitle: () => i18n.translate( 'Post by email' ),
	},
	[ FEATURE_REAL_TIME_ANALYTICS ]: {
		getSlug: () => FEATURE_REAL_TIME_ANALYTICS,
		getTitle: () => i18n.translate( 'Real-time analytics in your dashboard' ),
	},
	[ FEATURE_GOOGLE_ANALYTICS_V2 ]: {
		getSlug: () => FEATURE_GOOGLE_ANALYTICS_V2,
		getTitle: () =>
			i18n.translate( 'Go deeper into site stats and insights with Google Analytics' ),
	},
	[ FEATURE_ADD_UNLIMITED_LINKS ]: {
		getSlug: () => FEATURE_ADD_UNLIMITED_LINKS,
		getTitle: () => i18n.translate( 'Add unlimited links to your page' ),
	},
	[ FEATURE_CUSTOMIZE_THEMES_BUTTONS_COLORS ]: {
		getSlug: () => FEATURE_CUSTOMIZE_THEMES_BUTTONS_COLORS,
		getTitle: () => i18n.translate( 'Customizable themes, buttons, colors' ),
	},
	[ FEATURE_TRACK_VIEWS_CLICKS ]: {
		getSlug: () => FEATURE_TRACK_VIEWS_CLICKS,
		getTitle: () => i18n.translate( 'Track your view and click stats' ),
	},
	[ FEATURE_COLLECT_PAYMENTS_LINK_IN_BIO ]: {
		getSlug: () => FEATURE_COLLECT_PAYMENTS_LINK_IN_BIO,
		getTitle: () =>
			i18n.translate( 'Monetize your Link in Bio with payments, subscriptions, and donations' ),
	},
	[ FEATURE_LINK_IN_BIO_THEMES_CUSTOMIZATION ]: {
		getSlug: () => FEATURE_LINK_IN_BIO_THEMES_CUSTOMIZATION,
		getTitle: () => i18n.translate( 'Advanced link in bio themes and customization' ),
	},
	/* START - condensed_plan_features_v1 test */
	[ FEATURE_HOSTING_TEST ]: {
		getSlug: () => FEATURE_HOSTING_TEST,
		getTitle: () => i18n.translate( 'Fully managed web hosting & CDN' ),
		getDescription: () => {},
	},
	[ FEATURE_PRIORITY_SUPPORT_TEST ]: {
		getSlug: () => FEATURE_PRIORITY_SUPPORT_TEST,
		getTitle: () => '24/7 live chat support',
		getDescription: () => {},
	},
	[ FEATURE_PLUGINS_TEST ]: {
		getSlug: () => FEATURE_PLUGINS_TEST,
		getTitle: () => 'Install WordPress plugins',
		getDescription: () => {},
	},
	[ FEATURE_SFTP_DATABASE_TEST ]: {
		getSlug: () => FEATURE_SFTP_DATABASE_TEST,
		getTitle: () => 'SFTP and Database Access',
		getDescription: () => {},
	},
	[ FEATURE_FREE_NEWSLETTER_V1 ]: {
		getSlug: () => FEATURE_FREE_NEWSLETTER_V1,
		getTitle: () => 'Free newsletter w/ unlimited subscribers.',
		getDescription: () => {},
	},
	[ FEATURE_PAID_NEWSLETTER_V1 ]: {
		getSlug: () => FEATURE_PAID_NEWSLETTER_V1,
		getTitle: () => 'Paid newsletter w/ unlimited subscribers.',
		getDescription: () => {},
	},
	[ FEATURE_REPUBLICIZE_V3 ]: {
		getSlug: () => FEATURE_REPUBLICIZE,
		getTitle: () => 'Advanced social media tools',
		getDescription: () => {},
	},
	[ FEATURE_MONETISE_V2 ]: {
		getSlug: () => FEATURE_MONETISE,
		getTitle: () => 'Earn money from ads',
		getDescription: () => {},
	},
	[ FEATURE_UPLOAD_THEMES_V3 ]: {
		getSlug: () => FEATURE_UPLOAD_THEMES_V3,
		getTitle: () => 'Upload custom WordPress themes',
		getDescription: () => {},
	},
	[ FEATURE_EDGE_CACHING_V2 ]: {
		getSlug: () => FEATURE_EDGE_CACHING_V2,
		getTitle: () => 'High-performance edge caching',
		getDescription: () => {},
	},
	[ FEATURE_ADVANCED_SEO_EXPANDED_ABBR_V2 ]: {
		getSlug: () => FEATURE_ADVANCED_SEO_EXPANDED_ABBR,
		getTitle: () => i18n.translate( 'Advanced SEO tools' ),
		getDescription: () => {},
	},
	[ FEATURE_SITE_STATS_V2 ]: {
		getSlug: () => FEATURE_SITE_STATS,
		getTitle: () => i18n.translate( 'Built-in site stats' ),
		getDescription: () => i18n.translate( 'The most important metrics for your site.' ),
	},
	[ FEATURE_COLLECT_PAYMENTS_V3 ]: {
		getSlug: () => FEATURE_COLLECT_PAYMENTS_V2,
		getTitle: () => i18n.translate( 'Collect payments and donations' ),
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
	[ FEATURE_FREE_THEMES_V2 ]: {
		getSlug: () => FEATURE_FREE_THEMES,
		getTitle: () => i18n.translate( 'Dozens of free themes and design patterns' ),
		getDescription: () =>
			i18n.translate(
				'Access to a wide range of professional themes ' +
					"so you can find a design that's just right for your site."
			),
	},
	[ FEATURE_VIDEO_UPLOADS_V2 ]: {
		getSlug: () => FEATURE_VIDEO_UPLOADS,
		getTitle: () => i18n.translate( 'High-quality video hosting with VideoPress' ),
		getDescription: () =>
			i18n.translate(
				'The easiest way to upload videos to your website and display them ' +
					'using a fast, unbranded, customizable player with rich stats.'
			),
		getStoreSlug: () => 'videopress',
	},
	/* END - condensed_plan_features_v1 test */
	[ FEATURE_UNLIMITED_TRAFFIC ]: {
		getSlug: () => FEATURE_UNLIMITED_TRAFFIC,
		getTitle: () => i18n.translate( 'Unlimited traffic' ),
		getDescription: () =>
			i18n.translate(
				'All WordPress.com plans include unlimited traffic so you never have to worry about surprise charges.'
			),
	},
	[ FEATURE_MANAGED_HOSTING ]: {
		getSlug: () => FEATURE_MANAGED_HOSTING,
		getTitle: () => i18n.translate( 'Managed hosting' ),
		getDescription: () =>
			i18n.translate(
				'All plans include world-class managed hosting, including automatic updates, security, backups, and more.'
			),
	},
};

export const getPlanFeaturesObject = ( planFeaturesList ) => {
	return planFeaturesList.map( ( featuresConst ) => FEATURES_LIST[ featuresConst ] );
};

export function isValidFeatureKey( feature ) {
	return !! FEATURES_LIST[ feature ];
}

export function getFeatureByKey( feature ) {
	return FEATURES_LIST[ feature ];
}
