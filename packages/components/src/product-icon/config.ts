/**
 * Internal dependencies
 */
import jetpackBackup from './images/jetpack-backup.svg';
import jetpackBackupV2 from './images/jetpack-backup-v2.svg';
import jetpackBackupV2Darkblue from './images/jetpack-backup-v2-darkblue.svg';
import jetpackScan from './images/jetpack-scan.svg';
import jetpackScanV2 from './images/jetpack-scan-v2.svg';
import jetpackScanV2Darkblue from './images/jetpack-scan-v2-darkblue.svg';
import jetpackFree from './images/jetpack-free.svg';
import jetpackPersonal from './images/jetpack-personal.svg';
import jetpackPremium from './images/jetpack-premium.svg';
import jetpackProfessional from './images/jetpack-professional.svg';
import jetpackCompleteV2 from './images/jetpack-complete-v2.svg';
import jetpackCrmV2 from './images/jetpack-crm-v2.svg';
import jetpackCrmV2Darkblue from './images/jetpack-crm-v2-darkblue.svg';
import jetpackSearch from './images/jetpack-search.svg';
import jetpackSearchV2 from './images/jetpack-search-v2.svg';
import jetpackSearchV2Darkblue from './images/jetpack-search-v2-darkblue.svg';
import jetpackSecurityV2 from './images/jetpack-security-v2.svg';
import jetpackAntiSpam from './images/jetpack-anti-spam.svg';
import jetpackAntiSpamV2 from './images/jetpack-anti-spam-v2.svg';
import jetpackAntiSpamV2Darkblue from './images/jetpack-anti-spam-v2-darkblue.svg';
import wpcomBlogger from './images/wpcom-blogger.svg';
import wpcomBusiness from './images/wpcom-business.svg';
import wpcomEcommerce from './images/wpcom-ecommerce.svg';
import wpcomFree from './images/wpcom-free.svg';
import wpcomPersonal from './images/wpcom-personal.svg';
import wpcomPremium from './images/wpcom-premium.svg';

export const paths = {
	'jetpack-scan': jetpackScan,
	'jetpack-scan-v2': jetpackScanV2,
	'jetpack-scan-v2-dark': jetpackScanV2Darkblue,
	'jetpack-backup-daily': jetpackBackup,
	'jetpack-backup-realtime': jetpackBackup,
	'jetpack-backup-v2': jetpackBackupV2,
	'jetpack-backup-v2-dark': jetpackBackupV2Darkblue,
	'jetpack-free': jetpackFree,
	'jetpack-personal': jetpackPersonal,
	'jetpack-premium': jetpackPremium,
	'jetpack-professional': jetpackProfessional,
	'jetpack-complete-v2': jetpackCompleteV2,
	'jetpack-crm-v2': jetpackCrmV2,
	'jetpack-crm-v2-dark': jetpackCrmV2Darkblue,
	'jetpack-search': jetpackSearch,
	'jetpack-search-v2': jetpackSearchV2,
	'jetpack-search-v2-dark': jetpackSearchV2Darkblue,
	'jetpack-security-v2': jetpackSecurityV2,
	'jetpack-anti-spam': jetpackAntiSpam,
	'jetpack-anti-spam-v2': jetpackAntiSpamV2,
	'jetpack-anti-spam-v2-dark': jetpackAntiSpamV2Darkblue,
	'wpcom-blogger': wpcomBlogger,
	'wpcom-business': wpcomBusiness,
	'wpcom-ecommerce': wpcomEcommerce,
	'wpcom-free': wpcomFree,
	'wpcom-personal': wpcomPersonal,
	'wpcom-premium': wpcomPremium,
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
	| 'jetpack_crm'
	| 'jetpack_crm_monthly'
	| 'jetpack_crm_dark'
	| 'jetpack_crm_monthly_dark'
	| 'jetpack_backup_daily'
	| 'jetpack_backup_daily_monthly'
	| 'jetpack_backup_realtime'
	| 'jetpack_backup_realtime_monthly'
	| 'jetpack_backup_v2'
	| 'jetpack_backup_daily_v2'
	| 'jetpack_backup_daily_monthly_v2'
	| 'jetpack_backup_realtime_v2'
	| 'jetpack_backup_realtime_monthly_v2'
	| 'jetpack_backup_v2_dark'
	| 'jetpack_backup_daily_v2_dark'
	| 'jetpack_backup_daily_monthly_v2_dark'
	| 'jetpack_backup_realtime_v2_dark'
	| 'jetpack_backup_realtime_monthly_v2_dark'
	| 'jetpack_scan'
	| 'jetpack_scan_monthly'
	| 'jetpack_scan_v2'
	| 'jetpack_scan_monthly_v2'
	| 'jetpack_scan_daily_v2'
	| 'jetpack_scan_daily_monthly_v2'
	| 'jetpack_scan_realtime_v2'
	| 'jetpack_scan_realtime_monthly_v2'
	| 'jetpack_scan_v2_dark'
	| 'jetpack_scan_monthly_v2_dark'
	| 'jetpack_scan_daily_v2_dark'
	| 'jetpack_scan_daily_monthly_v2_dark'
	| 'jetpack_scan_realtime_v2_dark'
	| 'jetpack_scan_realtime_monthly_v2_dark'
	| 'jetpack_search'
	| 'jetpack_search_monthly'
	| 'wpcom_search'
	| 'wpcom_search_monthly'
	| 'jetpack_search_v2'
	| 'jetpack_search_monthly_v2'
	| 'jetpack_search_v2_dark'
	| 'jetpack_search_monthly_v2_dark'
	| 'jetpack_anti_spam'
	| 'jetpack_anti_spam_monthly'
	| 'jetpack_anti_spam_v2'
	| 'jetpack_anti_spam_monthly_v2'
	| 'jetpack_anti_spam_v2_dark'
	| 'jetpack_anti_spam_monthly_v2_dark'
	| 'jetpack_security_v2'
	| 'jetpack_security_monthly_v2'
	| 'jetpack_security_daily_v2'
	| 'jetpack_security_daily_monthly_v2'
	| 'jetpack_security_realtime_v2'
	| 'jetpack_security_realtime_monthly_v2'
	| 'jetpack_security_daily'
	| 'jetpack_security_daily_monthly'
	| 'jetpack_security_realtime'
	| 'jetpack_security_realtime_monthly';

export const iconToProductSlugMap: Record< keyof typeof paths, SupportedSlugs[] > = {
	'wpcom-free': [ 'free_plan' ] as SupportedSlugs[],
	'wpcom-blogger': [ 'blogger-bundle', 'blogger-bundle-2y' ] as SupportedSlugs[],
	'wpcom-personal': [
		'personal-bundle',
		'personal-bundle-2y',
		'personal-bundle-monthly',
	] as SupportedSlugs[],
	'wpcom-premium': [
		'value_bundle',
		'value_bundle-2y',
		'value_bundle-monthly',
		'value_bundle_monthly',
	] as SupportedSlugs[],
	'wpcom-ecommerce': [
		'ecommerce-bundle',
		'ecommerce-bundle-2y',
		'ecommerce-bundle-monthly',
	] as SupportedSlugs[],
	'wpcom-business': [
		'business-bundle',
		'business-bundle-2y',
		'business-bundle-monthly',
	] as SupportedSlugs[],
	'jetpack-free': [ 'jetpack_free' ] as SupportedSlugs[],
	'jetpack-personal': [ 'jetpack_personal', 'jetpack_personal_monthly' ] as SupportedSlugs[],
	'jetpack-premium': [ 'jetpack_premium', 'jetpack_premium_monthly' ] as SupportedSlugs[],
	'jetpack-professional': [ 'jetpack_business', 'jetpack_business_monthly' ] as SupportedSlugs[],
	'jetpack-complete-v2': [
		'jetpack_complete',
		'jetpack_complete_monthly',
		'jetpack_complete_v2',
		'jetpack_complete_monthly_v2',
	] as SupportedSlugs[],
	'jetpack-crm-v2': [ 'jetpack_crm', 'jetpack_crm_monthly' ] as SupportedSlugs[],
	'jetpack-crm-v2-dark': [ 'jetpack_crm_dark', 'jetpack_crm_monthly_dark' ] as SupportedSlugs[],
	'jetpack-backup-daily': [
		'jetpack_backup_daily',
		'jetpack_backup_daily_monthly',
	] as SupportedSlugs[],
	'jetpack-backup-realtime': [
		'jetpack_backup_realtime',
		'jetpack_backup_realtime_monthly',
	] as SupportedSlugs[],
	'jetpack-backup-v2': [
		'jetpack_backup_v2',
		'jetpack_backup_daily_v2',
		'jetpack_backup_daily_monthly_v2',
		'jetpack_backup_realtime_v2',
		'jetpack_backup_realtime_monthly_v2',
	] as SupportedSlugs[],
	'jetpack-backup-v2-dark': [
		'jetpack_backup_v2_dark',
		'jetpack_backup_daily_v2_dark',
		'jetpack_backup_daily_monthly_v2_dark',
		'jetpack_backup_realtime_v2_dark',
		'jetpack_backup_realtime_monthly_v2_dark',
	] as SupportedSlugs[],
	'jetpack-scan': [ 'jetpack_scan', 'jetpack_scan_monthly' ] as SupportedSlugs[],
	'jetpack-scan-v2': [
		'jetpack_scan_v2',
		'jetpack_scan_monthly_v2',
		'jetpack_scan_daily_v2',
		'jetpack_scan_daily_monthly_v2',
		'jetpack_scan_realtime_v2',
		'jetpack_scan_realtime_monthly_v2',
	] as SupportedSlugs[],
	'jetpack-scan-v2-dark': [
		'jetpack_scan_v2_dark',
		'jetpack_scan_monthly_v2_dark',
		'jetpack_scan_daily_v2_dark',
		'jetpack_scan_daily_monthly_v2_dark',
		'jetpack_scan_realtime_v2_dark',
		'jetpack_scan_realtime_monthly_v2_dark',
	] as SupportedSlugs[],
	'jetpack-search': [
		'jetpack_search',
		'jetpack_search_monthly',
		'wpcom_search',
		'wpcom_search_monthly',
	] as SupportedSlugs[],
	'jetpack-search-v2': [ 'jetpack_search_v2', 'jetpack_search_monthly_v2' ] as SupportedSlugs[],
	'jetpack-search-v2-dark': [
		'jetpack_search_v2_dark',
		'jetpack_search_monthly_v2_dark',
	] as SupportedSlugs[],
	'jetpack-anti-spam': [ 'jetpack_anti_spam', 'jetpack_anti_spam_monthly' ] as SupportedSlugs[],
	'jetpack-anti-spam-v2': [
		'jetpack_anti_spam_v2',
		'jetpack_anti_spam_monthly_v2',
	] as SupportedSlugs[],
	'jetpack-anti-spam-v2-dark': [
		'jetpack_anti_spam_v2_dark',
		'jetpack_anti_spam_monthly_v2_dark',
	] as SupportedSlugs[],
	'jetpack-security-v2': [
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
	] as SupportedSlugs[],
};
