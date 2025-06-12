import jetpackAI from './images/jetpack-ai.svg';
import jetpackAntiSpam from './images/jetpack-anti-spam.svg';
import jetpackBackupAddon from './images/jetpack-backup-addon.svg';
import jetpackBackup from './images/jetpack-backup.svg';
import jetpackBoost from './images/jetpack-boost.svg';
import jetpackBundles from './images/jetpack-bundles.svg';
import jetpackCreator from './images/jetpack-creator.svg';
import jetpackCrm from './images/jetpack-crm.svg';
import jetpackFree from './images/jetpack-free.svg';
import jetpackGoldenToken from './images/jetpack-golden-token.svg';
import jetpackScan from './images/jetpack-scan.svg';
import jetpackSearch from './images/jetpack-search.svg';
import jetpackSocial from './images/jetpack-social.svg';
import jetpackStats from './images/jetpack-stats.svg';
import jetpackVideoPress from './images/jetpack-videopress.svg';
import wpcom100Year from './images/wpcom-100-year.svg';
import wpcomBlogger from './images/wpcom-blogger.svg';
import wpcomBusiness from './images/wpcom-business.svg';
import wpcomEcommerce from './images/wpcom-ecommerce.svg';
import wpcomFree from './images/wpcom-free.svg';
import wpcomPersonal from './images/wpcom-personal.svg';
import wpcomPremium from './images/wpcom-premium.svg';

export const paths = {
	'jetpack-ai': jetpackAI,
	'jetpack-anti-spam': jetpackAntiSpam,
	'jetpack-backup': jetpackBackup,
	'jetpack-boost': jetpackBoost,
	'jetpack-complete': jetpackBundles,
	'jetpack-crm': jetpackCrm,
	'jetpack-growth': jetpackBundles,
	'jetpack-free': jetpackFree,
	'jetpack-personal': jetpackBundles,
	'jetpack-premium': jetpackBundles,
	'jetpack-professional': jetpackBundles,
	'jetpack-scan': jetpackScan,
	'jetpack-search': jetpackSearch,
	'jetpack-stats': jetpackStats,
	'jetpack-security': jetpackBundles,
	'jetpack-social': jetpackSocial,
	'jetpack-starter': jetpackBundles,
	'jetpack-videopress': jetpackVideoPress,
	'wpcom-blogger': wpcomBlogger,
	'wpcom-business': wpcomBusiness,
	'wpcom-ecommerce': wpcomEcommerce,
	'wpcom-free': wpcomFree,
	'wpcom-personal': wpcomPersonal,
	'wpcom-premium': wpcomPremium,
	'jetpack-backup-addon': jetpackBackupAddon,
	'jetpack-golden-token-lifetime': jetpackGoldenToken,
	'jetpack-creator': jetpackCreator,
	'wpcom-100-year': wpcom100Year,
};

export type SupportedSlugs =
	| 'free_plan'
	| 'blogger-bundle'
	| 'blogger-bundle-2y'
	| 'personal-bundle'
	| 'personal-bundle-2y'
	| 'personal-bundle-monthly'
	| 'value_bundle'
	| 'value_bundle-2y'
	| 'value_bundle-monthly'
	| 'value_bundle_monthly'
	| 'ecommerce-bundle'
	| 'ecommerce-bundle-2y'
	| 'ecommerce-bundle-monthly'
	| 'business-bundle'
	| 'business-bundle-2y'
	| 'business-bundle-monthly'
	| 'pro-plan'
	| 'starter-plan'
	| 'wp_com_hundred_year_bundle_centennially'
	| 'jetpack_ai_monthly'
	| 'jetpack_ai_yearly'
	| 'jetpack_free'
	| 'jetpack_personal'
	| 'jetpack_personal_monthly'
	| 'jetpack_premium'
	| 'jetpack_premium_monthly'
	| 'jetpack_business'
	| 'jetpack_business_monthly'
	| 'jetpack_complete'
	| 'jetpack_complete_monthly'
	| 'jetpack_complete_v2'
	| 'jetpack_complete_monthly_v2'
	| 'jetpack_golden_token_lifetime'
	| 'jetpack_growth_monthly'
	| 'jetpack_growth_yearly'
	| 'jetpack_growth_bi_yearly'
	| 'jetpack_crm'
	| 'jetpack_crm_monthly'
	| 'jetpack_backup_daily'
	| 'jetpack_backup_daily_monthly'
	| 'jetpack_backup_realtime'
	| 'jetpack_backup_realtime_monthly'
	| 'jetpack_backup_v2'
	| 'jetpack_backup_daily_v2'
	| 'jetpack_backup_daily_monthly_v2'
	| 'jetpack_backup_realtime_v2'
	| 'jetpack_backup_realtime_monthly_v2'
	| 'jetpack_backup_t1_yearly'
	| 'jetpack_backup_t1_monthly'
	| 'jetpack_backup_t2_yearly'
	| 'jetpack_backup_t2_monthly'
	| 'jetpack_boost'
	| 'jetpack_boost_monthly'
	| 'jetpack_boost_yearly'
	| 'jetpack_scan'
	| 'jetpack_scan_monthly'
	| 'jetpack_scan_v2'
	| 'jetpack_scan_monthly_v2'
	| 'jetpack_scan_daily_v2'
	| 'jetpack_scan_daily_monthly_v2'
	| 'jetpack_scan_realtime_v2'
	| 'jetpack_scan_realtime_monthly_v2'
	| 'jetpack_search'
	| 'jetpack_search_monthly'
	| 'jetpack_stats_monthly'
	| 'jetpack_stats_yearly'
	| 'jetpack_stats_pwyw_yearly'
	| 'jetpack_stats_free_yearly'
	| 'jetpack_social'
	| 'jetpack_social_monthly'
	| 'wpcom_search'
	| 'wpcom_search_monthly'
	| 'jetpack_search_v2'
	| 'jetpack_search_monthly_v2'
	| 'jetpack_search_free'
	| 'jetpack_anti_spam'
	| 'jetpack_anti_spam_monthly'
	| 'jetpack_anti_spam_v2'
	| 'jetpack_anti_spam_monthly_v2'
	| 'jetpack_security_v2'
	| 'jetpack_security_monthly_v2'
	| 'jetpack_security_daily_v2'
	| 'jetpack_security_daily_monthly_v2'
	| 'jetpack_security_realtime_v2'
	| 'jetpack_security_realtime_monthly_v2'
	| 'jetpack_security_daily'
	| 'jetpack_security_daily_monthly'
	| 'jetpack_security_realtime'
	| 'jetpack_security_realtime_monthly'
	| 'jetpack_security_t1_yearly'
	| 'jetpack_security_t1_monthly'
	| 'jetpack_security_t2_yearly'
	| 'jetpack_security_t2_monthly'
	| 'jetpack_starter_yearly'
	| 'jetpack_starter_monthly'
	| 'jetpack_videopress'
	| 'jetpack_videopress_monthly'
	| 'jetpack_creator_monthly'
	| 'jetpack_creator_yearly'
	| 'jetpack_creator_bi_yearly'
	| 'jetpack_backup_addon_storage_10gb_monthly'
	| 'jetpack_backup_addon_storage_100gb_monthly'
	| 'jetpack_backup_addon_storage_1tb_monthly'
	| 'jetpack_backup_addon_storage_3tb_monthly'
	| 'jetpack_backup_addon_storage_5tb_monthly'
	| 'jetpack_backup_addon_storage_10gb_yearly'
	| 'jetpack_backup_addon_storage_100gb_yearly'
	| 'jetpack_backup_addon_storage_1tb_yearly'
	| 'jetpack_backup_addon_storage_3tb_yearly'
	| 'jetpack_backup_addon_storage_5tb_yearly';

export const iconToProductSlugMap: Record< keyof typeof paths, readonly SupportedSlugs[] > = {
	'wpcom-free': [ 'free_plan' ],
	'wpcom-blogger': [ 'blogger-bundle', 'blogger-bundle-2y' ],
	'wpcom-personal': [ 'personal-bundle', 'personal-bundle-2y', 'personal-bundle-monthly' ],
	'wpcom-premium': [
		'value_bundle',
		'value_bundle-2y',
		'value_bundle-monthly',
		'value_bundle_monthly',
		'pro-plan',
		'starter-plan',
	],
	'wpcom-100-year': [ 'wp_com_hundred_year_bundle_centennially' ],
	'wpcom-ecommerce': [ 'ecommerce-bundle', 'ecommerce-bundle-2y', 'ecommerce-bundle-monthly' ],
	'wpcom-business': [ 'business-bundle', 'business-bundle-2y', 'business-bundle-monthly' ],
	'jetpack-ai': [ 'jetpack_ai_monthly', 'jetpack_ai_yearly' ],
	'jetpack-free': [ 'jetpack_free' ],
	'jetpack-personal': [ 'jetpack_personal', 'jetpack_personal_monthly' ],
	'jetpack-premium': [ 'jetpack_premium', 'jetpack_premium_monthly' ],
	'jetpack-professional': [ 'jetpack_business', 'jetpack_business_monthly' ],
	'jetpack-complete': [
		'jetpack_complete',
		'jetpack_complete_monthly',
		'jetpack_complete_v2',
		'jetpack_complete_monthly_v2',
	],
	'jetpack-crm': [ 'jetpack_crm', 'jetpack_crm_monthly' ],
	'jetpack-backup': [
		'jetpack_backup_daily',
		'jetpack_backup_daily_monthly',
		'jetpack_backup_realtime',
		'jetpack_backup_realtime_monthly',
		'jetpack_backup_v2',
		'jetpack_backup_daily_v2',
		'jetpack_backup_daily_monthly_v2',
		'jetpack_backup_realtime_v2',
		'jetpack_backup_realtime_monthly_v2',
		'jetpack_backup_t1_yearly',
		'jetpack_backup_t1_monthly',
		'jetpack_backup_t2_yearly',
		'jetpack_backup_t2_monthly',
	],
	'jetpack-backup-addon': [
		'jetpack_backup_addon_storage_10gb_monthly',
		'jetpack_backup_addon_storage_100gb_monthly',
		'jetpack_backup_addon_storage_1tb_monthly',
		'jetpack_backup_addon_storage_3tb_monthly',
		'jetpack_backup_addon_storage_5tb_monthly',
		'jetpack_backup_addon_storage_10gb_yearly',
		'jetpack_backup_addon_storage_100gb_yearly',
		'jetpack_backup_addon_storage_1tb_yearly',
		'jetpack_backup_addon_storage_3tb_yearly',
		'jetpack_backup_addon_storage_5tb_yearly',
	],
	'jetpack-boost': [ 'jetpack_boost', 'jetpack_boost_monthly', 'jetpack_boost_yearly' ],
	'jetpack-scan': [
		'jetpack_scan',
		'jetpack_scan_monthly',
		'jetpack_scan_v2',
		'jetpack_scan_monthly_v2',
		'jetpack_scan_daily_v2',
		'jetpack_scan_daily_monthly_v2',
		'jetpack_scan_realtime_v2',
		'jetpack_scan_realtime_monthly_v2',
	],
	'jetpack-search': [
		'jetpack_search',
		'jetpack_search_monthly',
		'wpcom_search',
		'wpcom_search_monthly',
		'jetpack_search_v2',
		'jetpack_search_monthly_v2',
		'jetpack_search_free',
		'jetpack_search_monthly',
	],
	'jetpack-stats': [
		'jetpack_stats_monthly',
		'jetpack_stats_yearly',
		'jetpack_stats_pwyw_yearly',
		'jetpack_stats_free_yearly',
	],
	'jetpack-anti-spam': [
		'jetpack_anti_spam',
		'jetpack_anti_spam_monthly',
		'jetpack_anti_spam_v2',
		'jetpack_anti_spam_monthly_v2',
	],
	'jetpack-security': [
		'jetpack_security_v2',
		'jetpack_security_monthly_v2',
		'jetpack_security_daily_v2',
		'jetpack_security_daily_monthly_v2',
		'jetpack_security_realtime_v2',
		'jetpack_security_realtime_monthly_v2',
		'jetpack_security_daily',
		'jetpack_security_daily_monthly',
		'jetpack_security_realtime',
		'jetpack_security_realtime_monthly',
		'jetpack_security_t1_yearly',
		'jetpack_security_t1_monthly',
		'jetpack_security_t2_yearly',
		'jetpack_security_t2_monthly',
	],
	'jetpack-social': [ 'jetpack_social', 'jetpack_social_monthly' ],
	'jetpack-videopress': [ 'jetpack_videopress', 'jetpack_videopress_monthly' ],
	'jetpack-starter': [ 'jetpack_starter_yearly', 'jetpack_starter_monthly' ],
	'jetpack-golden-token-lifetime': [ 'jetpack_golden_token_lifetime' ],
	'jetpack-creator': [
		'jetpack_creator_monthly',
		'jetpack_creator_yearly',
		'jetpack_creator_bi_yearly',
	],
	'jetpack-growth': [
		'jetpack_growth_monthly',
		'jetpack_growth_yearly',
		'jetpack_growth_bi_yearly',
	],
} as const;
