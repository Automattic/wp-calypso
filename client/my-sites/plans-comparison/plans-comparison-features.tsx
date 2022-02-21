import {
	FEATURE_10K_VISITS,
	FEATURE_100K_VISITS,
	FEATURE_500MB_STORAGE,
	FEATURE_50GB_STORAGE,
	FEATURE_ADDITIONAL_SITES,
	FEATURE_UNLIMITED_POSTS_PAGES,
	FEATURE_UNLIMITED_ADMINS,
	FEATURE_INSTALL_PLUGINS,
	FEATURE_COMMUNITY_SUPPORT,
	FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS,
	FEATURE_PAYMENT_BLOCKS,
	FEATURE_WOOCOMMERCE,
	FEATURE_JETPACK_ADVANCED,
	FEATURE_NO_ADS,
	FEATURE_SFTP_DATABASE,
	FEATURE_SITE_BACKUPS_AND_RESTORE,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { translate, numberFormat } from 'i18n-calypso';
import { getFeatureByKey } from 'calypso/lib/plans/features-list';
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
			: translate( '%(featureTitle)s not included', { args: { featureTitle } } );
	};
}

export const planComparisonFeatures: PlanComparisonFeature[] = [
	{
		title: translate( 'Sites' ),
		description: translate( 'Popup text placeholder' ),
		features: [ FEATURE_ADDITIONAL_SITES ],
		getCellText: ( feature ) => {
			const siteCount = 1;
			const title = translate( '%(siteCount)s site', '%(siteCount)s sites', {
				count: siteCount,
				args: { siteCount },
			} );
			const desc = feature
				? translate( 'You can purchase more sites.' )
				: translate( 'You can’t purchase more sites.' );

			return [ title, desc ];
		},
	},
	{
		title: translate( 'Visits' ),
		description: translate( 'Popup text placeholder' ),
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
		title: translate( 'WordPress plugins' ),
		subtitle: translate( 'Be able to add forms, calendar, etc.' ),
		features: [ FEATURE_INSTALL_PLUGINS ],
		getCellText: ( feature, isMobile = false ) => {
			const pluginCount = 0;

			if ( ! isMobile ) {
				return feature ? translate( 'Unlimited' ) : String( pluginCount );
			}

			return feature
				? translate( 'Unlimited WordPress plugins' )
				: translate( '%(pluginCount)s WordPress plugin', '%(pluginCount)s WordPress plugins', {
						count: pluginCount,
						args: { pluginCount: numberFormat( pluginCount, 0 ) },
				  } );
		},
	},
	{
		title: translate( 'Storage' ),
		description: translate( 'Upload more images, videos, audio, and documents to your website.' ),
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
		title: translate( 'Support' ),
		description: translate( 'Popup text placeholder' ),
		features: [ FEATURE_COMMUNITY_SUPPORT, FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS ],
		getCellText: ( feature ) => {
			if ( feature === FEATURE_COMMUNITY_SUPPORT ) {
				return [
					getFeatureByKey( FEATURE_COMMUNITY_SUPPORT ).getTitle(),
					getFeatureByKey( FEATURE_COMMUNITY_SUPPORT ).getDescription(),
				];
			}

			return [
				getFeatureByKey( FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS ).getTitle(),
				getFeatureByKey( FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS ).getDescription(),
			];
		},
	},
	{
		title: translate( 'Payment blocks' ),
		description: translate( 'Popup text placeholder' ),
		features: [ FEATURE_PAYMENT_BLOCKS ],
		getCellText: defaultGetCellText( translate( 'Payment blocks' ) ),
	},
	{
		title: translate( 'WooCommerce' ),
		description: translate(
			'WooCommerce is a customizable, open-source eCommerce platform built on WordPress.'
		),
		features: [ FEATURE_WOOCOMMERCE ],
		getCellText: defaultGetCellText( translate( 'WooCommerce' ) ),
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
