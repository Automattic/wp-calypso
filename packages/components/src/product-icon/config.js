/**
 * Internal dependencies
 */
import jetpackBackup from './images/jetpack-backup.svg';
import jetpackScan from './images/jetpack-scan.svg';
import jetpackFree from './images/jetpack-free.svg';
import jetpackPersonal from './images/jetpack-personal.svg';
import jetpackPremium from './images/jetpack-premium.svg';
import jetpackProfessional from './images/jetpack-professional.svg';
import jetpackSearch from './images/jetpack-search.svg';
import jetpackAntiSpam from './images/jetpack-anti-spam.svg';
import wpcomBlogger from './images/wpcom-blogger.svg';
import wpcomBusiness from './images/wpcom-business.svg';
import wpcomEcommerce from './images/wpcom-ecommerce.svg';
import wpcomFree from './images/wpcom-free.svg';
import wpcomPersonal from './images/wpcom-personal.svg';
import wpcomPremium from './images/wpcom-premium.svg';

export const paths = {
	'jetpack-scan': jetpackScan,
	'jetpack-backup-daily': jetpackBackup,
	'jetpack-backup-realtime': jetpackBackup,
	'jetpack-free': jetpackFree,
	'jetpack-personal': jetpackPersonal,
	'jetpack-premium': jetpackPremium,
	'jetpack-professional': jetpackProfessional,
	'jetpack-search': jetpackSearch,
	'jetpack-anti-spam': jetpackAntiSpam,
	'wpcom-blogger': wpcomBlogger,
	'wpcom-business': wpcomBusiness,
	'wpcom-ecommerce': wpcomEcommerce,
	'wpcom-free': wpcomFree,
	'wpcom-personal': wpcomPersonal,
	'wpcom-premium': wpcomPremium,
	'wpcom-search': jetpackSearch,
};

export const iconToProductSlugMap = {
	'wpcom-free': [ 'free_plan' ],
	'wpcom-blogger': [ 'blogger-bundle', 'blogger-bundle-2y' ],
	'wpcom-personal': [ 'personal-bundle', 'personal-bundle-2y', 'personal-bundle-monthly' ],
	'wpcom-premium': [ 'value_bundle', 'value_bundle-2y', 'value_bundle-monthly' ],
	'wpcom-ecommerce': [ 'ecommerce-bundle', 'ecommerce-bundle-2y', 'ecommerce-bundle-monthly' ],
	'wpcom-business': [ 'business-bundle', 'business-bundle-2y', 'business-bundle-monthly' ],
	'jetpack-free': [ 'jetpack_free' ],
	'jetpack-personal': [ 'jetpack_personal', 'jetpack_personal_monthly' ],
	'jetpack-premium': [ 'jetpack_premium', 'jetpack_premium_monthly' ],
	'jetpack-professional': [ 'jetpack_business', 'jetpack_business_monthly' ],
	'jetpack-backup-daily': [ 'jetpack_backup_daily', 'jetpack_backup_daily_monthly' ],
	'jetpack-backup-realtime': [ 'jetpack_backup_realtime', 'jetpack_backup_realtime_monthly' ],
	'jetpack-scan': [ 'jetpack_scan', 'jetpack_scan_monthly' ],
	'jetpack-search': [ 'jetpack_search', 'jetpack_search_monthly', 'wpcom_search' ],
	'jetpack-anti-spam': [ 'jetpack_anti_spam', 'jetpack_anti_spam_monthly' ],
};

export const supportedSlugs = [ ...Object.values( iconToProductSlugMap ) ].flat();
