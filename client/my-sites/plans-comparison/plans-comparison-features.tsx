import {
	FEATURE_10K_VISITS,
	FEATURE_100K_VISITS,
	FEATURE_500MB_STORAGE,
	FEATURE_50GB_STORAGE,
	FEATURE_UNLIMITED_POSTS_PAGES,
	FEATURE_UNLIMITED_ADMINS,
	FEATURE_INSTALL_PLUGINS,
	FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS,
	FEATURE_PAYMENT_BLOCKS,
	FEATURE_WOOCOMMERCE,
	FEATURE_JETPACK_ADVANCED,
	FEATURE_NO_ADS,
	FEATURE_SFTP_DATABASE,
	FEATURE_SITE_BACKUPS_AND_RESTORE,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_PREMIUM_THEMES,
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
		title: translate( 'Custom Domain Name' ),
		description: translate(
			'Get a personalized online address that’s easy to remember and easy to share.'
		),
		features: [ FEATURE_CUSTOM_DOMAIN ],
		getCellText: ( feature, isMobile = false ) => {
			if ( ! isMobile ) {
				if ( feature ) {
					return (
						<>
							<Gridicon icon="checkmark" />
							{ translate( 'Free for one year!' ) }
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
				? translate( 'Custom Domain Name is free for one year!' )
				: translate( 'Custom Domain Name is not included' );
		},
	},
	{
		title: translate( 'Premium themes' ),
		description: translate(
			'Gain access to advanced, professional & beautiful premium design templates including themes specifically tailored for businesses.'
		),
		features: [ FEATURE_PREMIUM_THEMES ],
		getCellText: defaultGetCellText( translate( 'Premium themes' ) ),
	},
	{
		title: translate( 'Unlimited Email and Live Chat Support' ),
		description: translate(
			'Customer service isn’t just something we offer. It’s who we are. Over 30% of WordPress.com is dedicated to service. We call it Happiness—real support delivered by real human beings who specialize in launching and fine-tuning WordPress sites. '
		),
		features: [ FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS ],
		getCellText: defaultGetCellText( translate( 'Unlimited Email and Live Chat Support' ) ),
	},
	{
		title: translate( 'WordPress Plugins' ),
		subtitle: translate( 'Use any WordPress plugins on your site' ),
		description: translate(
			'Install WordPress plugins and extend functionality for your site with access to more than 50,000 WordPress plugins'
		),
		features: [ FEATURE_INSTALL_PLUGINS ],
		getCellText: ( feature, isMobile = false ) => {
			const pluginCount = 0;

			if ( ! isMobile ) {
				return feature ? translate( 'Unlimited' ) : String( pluginCount );
			}

			return feature
				? translate( 'Unlimited WordPress Plugins' )
				: translate( '%(pluginCount)s WordPress Plugin', '%(pluginCount)s WordPress Plugins', {
						count: pluginCount,
						args: { pluginCount: numberFormat( pluginCount, 0 ) },
				  } );
		},
	},
	{
		title: translate( 'Storage' ),
		description: translate(
			'The free plan allows a maximum storage of 500MB, which equals to approximately 100 high quality images, whilst with Pro you may go all the way up to 50GB, enough space for 10,000 high quality images of the same size.'
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
		title: translate( 'Sell products with WooCommerce' ),
		description: translate(
			'Includes one-click payments, premium store designs and personalized expert support.'
		),
		features: [ FEATURE_WOOCOMMERCE ],
		getCellText: defaultGetCellText( translate( 'Sell products with WooCommerce' ) ),
	},
	{
		title: translate( 'Visits per month' ),
		description: translate(
			"WordPress Pro bundles up to 100,000 visits a month to help you rest assured traffic won't be a concern."
		),
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
		title: translate( 'Blog posts and pages' ),
		description: translate( 'Popup text placeholder' ),
		features: [ FEATURE_UNLIMITED_POSTS_PAGES ],
		getCellText: ( _, isMobile = false ) => {
			if ( ! isMobile ) {
				return translate( 'Unlimited' );
			}

			return translate( 'Unlimited blog posts and pages' );
		},
	},
	{
		title: translate( 'Admin users' ),
		description: translate( 'Popup text placeholder' ),
		features: [ FEATURE_UNLIMITED_ADMINS ],
		getCellText: ( feature, isMobile ) => {
			const adminCount = 1;

			if ( ! isMobile ) {
				return feature ? translate( 'Unlimited' ) : String( adminCount );
			}

			return feature
				? translate( 'Unlimited admin users' )
				: translate( '%(adminCount)s admin user', '%(adminCount)s admin users', {
						count: adminCount,
						args: { adminCount: numberFormat( adminCount, 0 ) },
				  } );
		},
	},
	{
		title: translate( 'Payment blocks' ),
		description: translate( 'Popup text placeholder' ),
		features: [ FEATURE_PAYMENT_BLOCKS ],
		getCellText: defaultGetCellText( translate( 'Payment blocks' ) ),
	},
	{
		title: translate( 'Jetpack' ),
		description: translate(
			'Speed up your site’s performance and protect it from spammers. ' +
				'Access detailed records of all activity on your site and restore your site ' +
				'to a previous point in time with just a click! While you’re at it, ' +
				'improve your SEO with our Advanced SEO tools and automate social media sharing.'
		),
		features: [ FEATURE_JETPACK_ADVANCED ],
		getCellText: defaultGetCellText( translate( 'Jetpack' ) ),
	},
	{
		title: translate( 'Remove ads' ),
		description: translate(
			'Allow your visitors to visit and read your website without seeing any WordPress.com advertising.'
		),
		features: [ FEATURE_NO_ADS ],
		getCellText: defaultGetCellText( translate( 'Remove ads' ) ),
	},
	{
		title: translate( 'SFTP, Database access' ),
		description: translate( 'Popup text placeholder' ),
		features: [ FEATURE_SFTP_DATABASE ],
		getCellText: defaultGetCellText( translate( 'SFTP, Database access' ) ),
	},
	{
		title: translate( 'Automated backups' ),
		description: translate( 'Automated site backups and one-click restore' ),
		features: [ FEATURE_SITE_BACKUPS_AND_RESTORE ],
		getCellText: defaultGetCellText( translate( 'Automated backups' ) ),
	},
];
