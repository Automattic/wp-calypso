import {
	FEATURE_CANCELLATION_ACCEPT_PAYMENTS,
	FEATURE_CANCELLATION_AD_FREE_SITE,
	FEATURE_CANCELLATION_BACKUPS_AND_RESTORE,
	FEATURE_CANCELLATION_COLLECT_PAYMENTS,
	FEATURE_CANCELLATION_EARN_AD_REVENUE,
	FEATURE_CANCELLATION_EMAIL_SUPPORT,
	FEATURE_CANCELLATION_GOOGLE_ANALYTICS,
	FEATURE_CANCELLATION_HIGH_QUALITY_VIDEOS,
	FEATURE_CANCELLATION_JETPACK_ESSENTIALS,
	FEATURE_CANCELLATION_LIVE_CHAT,
	FEATURE_CANCELLATION_MANAGED_HOSTINGS,
	FEATURE_CANCELLATION_PLUGINS,
	FEATURE_CANCELLATION_PREMIUM_DESIGN,
	FEATURE_CANCELLATION_PREMIUM_THEMES,
	FEATURE_CANCELLATION_SECURITY_AND_SPAM,
	FEATURE_CANCELLATION_SEO_TOOLS,
	FEATURE_CANCELLATION_SEO_AND_SOCIAL,
	FEATURE_CANCELLATION_SFTP_AND_DATABASE,
	FEATURE_CANCELLATION_SHIPPING_CARRIERS,
} from '@automattic/calypso-products';
import i18n from 'i18n-calypso';

export const CANCELLATION_FEATURES_LIST = {
	[ FEATURE_CANCELLATION_ACCEPT_PAYMENTS ]: i18n.translate( 'Accept payments in 60+ countries' ),
	[ FEATURE_CANCELLATION_AD_FREE_SITE ]: i18n.translate( 'An ad-free site' ),
	[ FEATURE_CANCELLATION_BACKUPS_AND_RESTORE ]: i18n.translate(
		'Automated site backups and one-click restore'
	),
	[ FEATURE_CANCELLATION_COLLECT_PAYMENTS ]: i18n.translate( 'The ability to collect payments' ),
	[ FEATURE_CANCELLATION_EARN_AD_REVENUE ]: i18n.translate( 'The ability to earn ad revenue' ),
	[ FEATURE_CANCELLATION_EMAIL_SUPPORT ]: i18n.translate( 'Unlimited customer support via email' ),
	[ FEATURE_CANCELLATION_GOOGLE_ANALYTICS ]: i18n.translate(
		'Unlimited customer support via email'
	),
	[ FEATURE_CANCELLATION_HIGH_QUALITY_VIDEOS ]: i18n.translate( 'High quality videos' ),
	[ FEATURE_CANCELLATION_JETPACK_ESSENTIALS ]: i18n.translate( 'Jetpack essentials' ),
	[ FEATURE_CANCELLATION_LIVE_CHAT ]: i18n.translate( 'Access to live chat support' ),
	[ FEATURE_CANCELLATION_MANAGED_HOSTINGS ]: i18n.translate( 'Access to managed hosting' ),
	[ FEATURE_CANCELLATION_PLUGINS ]: i18n.translate( 'Access to more than 50,000 plugins' ),
	[ FEATURE_CANCELLATION_PREMIUM_DESIGN ]: i18n.translate(
		'Premium design options customized for online stores'
	),
	[ FEATURE_CANCELLATION_PREMIUM_THEMES ]: i18n.translate( 'Access to premium themes' ),
	[ FEATURE_CANCELLATION_SECURITY_AND_SPAM ]: i18n.translate(
		'Professional security and spam protection'
	),
	[ FEATURE_CANCELLATION_SEO_TOOLS ]: i18n.translate( 'Advanced SEO tools' ),
	[ FEATURE_CANCELLATION_SEO_AND_SOCIAL ]: i18n.translate( 'SEO and social tools' ),
	[ FEATURE_CANCELLATION_SFTP_AND_DATABASE ]: i18n.translate( 'SFTP and database access' ),
	[ FEATURE_CANCELLATION_SHIPPING_CARRIERS ]: i18n.translate(
		'Integration with top shipping carriers'
	),
};

export function isValidCancellationFeatureKey( feature ) {
	return !! CANCELLATION_FEATURES_LIST[ feature ];
}

export function getCancellationFeatureByKey( feature ) {
	return CANCELLATION_FEATURES_LIST[ feature ];
}
