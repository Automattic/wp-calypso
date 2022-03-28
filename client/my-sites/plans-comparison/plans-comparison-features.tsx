import {
	FEATURE_10K_VISITS,
	FEATURE_100K_VISITS,
	FEATURE_500MB_STORAGE,
	FEATURE_50GB_STORAGE,
	FEATURE_UNLIMITED_ADMINS,
	FEATURE_INSTALL_PLUGINS,
	FEATURE_PAYMENT_BLOCKS,
	FEATURE_WOOCOMMERCE,
	FEATURE_NO_ADS,
	FEATURE_SFTP_DATABASE,
	FEATURE_SITE_BACKUPS_AND_RESTORE,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_PREMIUM_THEMES,
	FEATURE_PREMIUM_SUPPORT,
	FEATURE_ADVANCED_SEO,
	FEATURE_VIDEO_UPLOADS,
	FEATURE_SOCIAL_MEDIA_TOOLS,
	FEATURE_TITAN_EMAIL,
	FEATURE_MONETISE,
	FEATURE_JETPACK_ESSENTIAL,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { translate, numberFormat } from 'i18n-calypso';
import type { TranslateResult, TranslateOptionsPlural } from 'i18n-calypso';

export interface PlanComparisonFeature {
	/**
	 * Row header
	 */
	title: TranslateResult;

	/**
	 * Additional text displayed below the row header
	 */
	subtitle?: TranslateResult;

	/**
	 * Popup text describing what the feature is.
	 */
	description?: TranslateResult;

	/**
	 * Features that belong to this row.
	 */
	features: string[];

	/**
	 * Returns cell text based on the feature key.
	 *
	 * @param {string} feature The feature constant. e.g. FEATURE_UNLIMITED_ADMINS
	 * @param {boolean} isMobile Whether the text is displayed on mobile.
	 * @returns {TranslateResult|TranslateResult[]} Array of text if there is an additional description.
	 */
	getCellText: (
		feature: string | undefined,
		isMobile: boolean,
		extraArgs?: unknown
	) => TranslateResult | [ TranslateResult, TranslateResult ];
}

function defaultGetCellText(
	featureTitle: TranslateResult
): PlanComparisonFeature[ 'getCellText' ] {
	return ( feature, isMobile = false ) => {
		if ( ! isMobile ) {
			if ( feature ) {
				return (
					<>
						<Gridicon icon="checkmark" />
						{ translate( 'Included' ) }
					</>
				);
			}

			return (
				<>
					<Gridicon icon="cross" />
					{ translate( 'Not included' ) }
				</>
			);
		}

		return feature
			? translate( '%(featureTitle)s included', { args: { featureTitle } } )
			: translate( '%(featureTitle)s {{strong}}not{{/strong}} included', {
					args: { featureTitle },
					components: { strong: <strong /> },
			  } );
	};
}

export const planComparisonFeatures: PlanComparisonFeature[] = [
	{
		title: translate( 'Custom domain name' ),
		description: translate(
			'Get a personalized online address that’s easy to remember and easy to share. First year comes for free with your paid annual subscription.'
		),
		features: [ FEATURE_CUSTOM_DOMAIN ],
		getCellText: ( feature, isMobile = false ) => {
			if ( ! isMobile ) {
				if ( feature ) {
					return (
						<>
							<Gridicon icon="checkmark" />
							{ translate( 'Free for one year' ) }
						</>
					);
				}

				return (
					<>
						<Gridicon icon="cross" />
						{ translate( 'Not included' ) }
					</>
				);
			}

			return feature
				? translate( 'Custom domain name is free for one year!' )
				: translate( 'Custom domain name is not included' );
		},
	},
	{
		title: translate( 'Premium themes' ),
		description: translate(
			'Gain access to advanced, professional & beautiful premium design templates including themes specifically tailored for businesses.'
		),
		features: [ FEATURE_PREMIUM_THEMES ],
		getCellText: ( feature, isMobile = false ) => {
			let cellText = defaultGetCellText( translate( 'Premium themes' ) )( feature, isMobile );
			if ( isMobile ) {
				cellText = feature
					? translate( 'Premium themes are included' )
					: translate( 'Premium themes are not included' );
			}
			return cellText;
		},
	},
	{
		title: translate( 'WordPress plugins' ),
		subtitle: translate( 'Be able to add forms, calendar, and more.' ),
		description: translate(
			'Install WordPress plugins and extend functionality for your site with access to more than 50,000 WordPress plugins.'
		),
		features: [ FEATURE_INSTALL_PLUGINS ],
		getCellText: ( feature, isMobile = false ) => {
			if ( ! isMobile ) {
				if ( feature ) {
					return (
						<>
							<Gridicon icon="checkmark" />
							{ translate( 'Unlimited plugins' ) }
						</>
					);
				}

				return (
					<>
						<Gridicon icon="cross" />
						{ translate( 'Not included' ) }
					</>
				);
			}

			return feature
				? translate( 'Unlimited WordPress plugins' )
				: translate( 'WordPress plugins are not included' );
		},
	},
	{
		title: translate( 'Premium support' ),
		subtitle: translate( 'Get expert help to build your site.' ),
		description: translate(
			'Customer service isn’t just something we offer. It’s who we are. Over 30% of WordPress.com is dedicated to service. We call it Happiness—real support delivered by real human beings who specialize in launching and fine-tuning WordPress sites.'
		),
		features: [ FEATURE_PREMIUM_SUPPORT ],
		getCellText: ( feature, isMobile = false ) => {
			let cellText = defaultGetCellText( translate( 'Premium support' ) )( feature, isMobile );
			if ( isMobile ) {
				cellText = feature
					? translate( 'Premium support is included' )
					: translate( 'Premium support is not included' );
			}
			return cellText;
		},
	},
	{
		title: translate( 'Sell products with WooCommerce' ),
		description: translate(
			'Includes one-click payments, premium store designs and personalized expert support.'
		),
		features: [ FEATURE_WOOCOMMERCE ],
		getCellText: ( feature, isMobile = false ) => {
			let cellText = defaultGetCellText( translate( 'WooCommerce' ) )( feature, isMobile );
			if ( isMobile ) {
				cellText = feature
					? translate( 'WooCommerce is included' )
					: translate( 'WooCommerce is not included' );
			}
			return cellText;
		},
	},
	{
		title: translate( 'Storage' ),
		description: translate(
			'The free plan allows a maximum storage of 500MB, which equals to approximately 100 high quality images. With WordPress Pro you may go all the way up to 50GB, enough space for 10,000 high quality images of the same size.'
		),
		features: [ FEATURE_500MB_STORAGE, FEATURE_50GB_STORAGE ],
		getCellText: ( feature, isMobile = false ) => {
			let storageSize = '0.5';

			if ( feature === FEATURE_50GB_STORAGE ) {
				storageSize = '50';
			}

			if ( isMobile ) {
				return translate( '%sGB of storage', {
					args: [ storageSize ],
				} );
			}

			return translate( '%sGB', {
				args: [ storageSize ],
				comment: '%s is a number of gigabytes.',
			} );
		},
	},
	{
		title: translate( 'Visits per month' ),
		description: translate( 'Max visits per month.' ),
		features: [ FEATURE_10K_VISITS, FEATURE_100K_VISITS ],
		getCellText: ( feature, isMobile = false ) => {
			let visitCount = 0;

			if ( feature === FEATURE_10K_VISITS ) {
				visitCount = 10_000;
			} else if ( feature === FEATURE_100K_VISITS ) {
				visitCount = 100_000;
			}

			const opts: TranslateOptionsPlural = {
				count: visitCount,
				args: { visitCount: numberFormat( visitCount, 0 ) },
			};

			return isMobile
				? translate( '%(visitCount)s visit per month', '%(visitCount)s visits per month', opts )
				: translate( '%(visitCount)s visit', '%(visitCount)s visits', opts );
		},
	},
	{
		title: translate( 'Remove ads' ),
		description: translate(
			'Free sites include ads. The WordPress Pro plan allows you to remove these to keep your website clean of ads.'
		),
		features: [ FEATURE_NO_ADS ],
		getCellText: ( feature, isMobile = false ) => {
			let cellText = defaultGetCellText( translate( 'Remove ads' ) )( feature, isMobile );
			if ( isMobile ) {
				cellText = feature
					? translate( 'Remove ads is included' )
					: translate( 'Remove ads is not included' );
			}
			return cellText;
		},
	},
	{
		title: translate( 'Advanced SEO tools' ),
		subtitle: translate( 'Get found on search engines.' ),
		description: translate( 'Get found faster with built-in SEO tools.' ),
		features: [ FEATURE_ADVANCED_SEO ],
		getCellText: ( feature, isMobile = false ) => {
			let cellText = defaultGetCellText( translate( 'Advanced SEO tools' ) )( feature, isMobile );
			if ( isMobile ) {
				cellText = feature
					? translate( 'Advanced SEO tools are included' )
					: translate( 'Advanced SEO tools are not included' );
			}
			return cellText;
		},
	},
	{
		title: translate( 'Website Administrator' ),
		description: translate(
			'Pro WordPress lets you have unlimited users editing your site. This is ideal for having multiple collaborators help you have your website built and maintained.'
		),
		features: [ FEATURE_UNLIMITED_ADMINS ],
		getCellText: ( feature, isMobile ) => {
			const adminCount = 1;

			if ( ! isMobile ) {
				return feature ? translate( 'Unlimited' ) : String( adminCount );
			}

			return feature
				? translate( 'Unlimited Website Administrators' )
				: translate(
						'%(adminCount)s Website Administrator',
						'%(adminCount)s Website Administrators',
						{
							count: adminCount,
							args: { adminCount: numberFormat( adminCount, 0 ) },
						}
				  );
		},
	},
	{
		title: translate( 'Upload videos' ),
		description: translate(
			'Upload videos to your website and display them using a fast player on the WordPress Pro plan.'
		),
		features: [ FEATURE_VIDEO_UPLOADS ],
		getCellText: ( feature, isMobile = false ) => {
			let cellText = defaultGetCellText( translate( 'Upload videos' ) )( feature, isMobile );
			if ( isMobile ) {
				cellText = feature
					? translate( 'Upload videos is included' )
					: translate( 'Upload videos is not included' );
			}
			return cellText;
		},
	},
	{
		title: translate( 'Collect payments' ),
		subtitle: translate( 'Accept donations, subscriptions and more.' ),
		description: translate(
			'One simple, flexible way to collect any type of payment. Accept payments for just about anything from goods and services to memberships and donations.'
		),
		features: [ FEATURE_PAYMENT_BLOCKS ],
		getCellText: ( feature, isMobile = false ) => {
			let cellText = defaultGetCellText( translate( 'Collect payments' ) )( feature, isMobile );
			if ( isMobile ) {
				cellText = feature
					? translate( 'Collect payments is included' )
					: translate( 'Collect payments is not included' );
			}
			return cellText;
		},
	},
	{
		title: translate( 'Built in social media tools' ),
		description: translate( 'Amplify your voice with our built-in social tools.' ),
		features: [ FEATURE_SOCIAL_MEDIA_TOOLS ],
		getCellText: ( feature, isMobile = false ) => {
			let cellText = defaultGetCellText( translate( 'Built in social media tools' ) )(
				feature,
				isMobile
			);
			if ( isMobile ) {
				cellText = feature
					? translate( 'Built in social media tools are included' )
					: translate( 'Built in social media tools are not included' );
			}
			return cellText;
		},
	},
	{
		title: translate( 'Professional Email' ),
		subtitle: translate( 'Custom email address with your own domain.' ),
		description: translate(
			'Custom email address with mailbox, calendar, templates and more. Register free for 3 months with your custom domain. After 3 months, you have the option to renew or cancel your email subscription.'
		),
		features: [ FEATURE_TITAN_EMAIL ],
		getCellText: ( feature, isMobile = false ) => {
			if ( ! isMobile ) {
				if ( feature ) {
					return (
						<>
							<Gridicon icon="checkmark" />
							{ translate( 'Free for 3 months' ) }
						</>
					);
				}

				return (
					<>
						<Gridicon icon="cross" />
						{ translate( 'Not included' ) }
					</>
				);
			}

			return feature
				? translate( 'Professional Email is free for 3 months' )
				: translate( 'Professional Email is not included' );
		},
	},
	{
		title: translate( 'Earn money from ads' ),
		subtitle: translate( 'Monetize your website with ads.' ),
		description: translate(
			'WordAds connects your site with some of the biggest ad publishers, including Google AdSense, Facebook Audience Network, Amazon A9, and others!'
		),
		features: [ FEATURE_MONETISE ],
		getCellText: ( feature, isMobile = false ) => {
			let cellText = defaultGetCellText( translate( 'Earn money from ads' ) )( feature, isMobile );
			if ( isMobile ) {
				cellText = feature
					? translate( 'Earn money from ads is included' )
					: translate( 'Earn money from ads is not included' );
			}
			return cellText;
		},
	},
	{
		title: translate( 'SFTP, Database access' ),
		description: translate(
			'Upload and remove files to your website using secure FTP data transfer with your WordPress Pro plan.'
		),
		features: [ FEATURE_SFTP_DATABASE ],
		getCellText: ( feature, isMobile = false ) => {
			let cellText = defaultGetCellText( translate( 'SFTP, Database access' ) )(
				feature,
				isMobile
			);
			if ( isMobile ) {
				cellText = feature
					? translate( 'SFTP, Database access is included' )
					: translate( 'SFTP, Database access is not included' );
			}
			return cellText;
		},
	},
	{
		title: translate( 'Automated website backups' ),
		description: translate(
			'Daily backups give you granular control over your site, with the ability to restore it to any previous state in a snap, and export it at any time.'
		),
		features: [ FEATURE_SITE_BACKUPS_AND_RESTORE ],
		getCellText: ( feature, isMobile = false ) => {
			let cellText = defaultGetCellText( translate( 'Automated website backups' ) )(
				feature,
				isMobile
			);
			if ( isMobile ) {
				cellText = feature
					? translate( 'Automated website backups are included' )
					: translate( 'Automated website backups are not included' );
			}
			return cellText;
		},
	},
	{
		title: translate( 'Jetpack essentials' ),
		description: translate(
			'Optimize your site for better SEO, faster-loading pages, and protection from spam with essential Jetpack features.'
		),
		features: [ FEATURE_JETPACK_ESSENTIAL ],
		getCellText: ( feature, isMobile = false ) => {
			let cellText = defaultGetCellText( translate( 'Jetpack essentials' ) )( feature, isMobile );
			if ( isMobile ) {
				cellText = feature
					? translate( 'Jetpack essentials are included' )
					: translate( 'Jetpack essentials are not included' );
			}
			return cellText;
		},
	},
];
