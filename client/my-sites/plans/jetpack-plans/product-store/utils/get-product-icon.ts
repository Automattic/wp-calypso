import {
	JETPACK_AI_PRODUCTS,
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BACKUP_ADDON_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_CRM_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_SOCIAL_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
	JETPACK_COMPLETE_PLANS,
	JETPACK_SECURITY_PLANS,
	JETPACK_STATS_PRODUCTS,
	JETPACK_MONITOR_PRODUCTS,
	WOOCOMMERCE_PRODUCTS,
	JETPACK_CREATOR_PRODUCTS,
	JETPACK_SOCIAL_V1_PRODUCTS,
	JETPACK_GROWTH_PLANS,
} from '@automattic/calypso-products';
import JetpackProductIconAILight from 'calypso/assets/images/jetpack/jetpack-product-icon-ai-light.svg';
import JetpackProductIconAI from 'calypso/assets/images/jetpack/jetpack-product-icon-ai.svg';
import JetpackProductIconAntiSpamLight from 'calypso/assets/images/jetpack/jetpack-product-icon-antispam-light.svg';
import JetpackProductIconAntiSpam from 'calypso/assets/images/jetpack/jetpack-product-icon-antispam.svg';
import JetpackProductIconBackupLight from 'calypso/assets/images/jetpack/jetpack-product-icon-backup-light.svg';
import JetpackProductIconBackup from 'calypso/assets/images/jetpack/jetpack-product-icon-backup.svg';
import JetpackProductIconBoostLight from 'calypso/assets/images/jetpack/jetpack-product-icon-boost-light.svg';
import JetpackProductIconBoost from 'calypso/assets/images/jetpack/jetpack-product-icon-boost.svg';
import JetpackProductIconComplete from 'calypso/assets/images/jetpack/jetpack-product-icon-complete.svg';
import JetpackProductIconCreator from 'calypso/assets/images/jetpack/jetpack-product-icon-creator.svg';
import JetpackProductIconCRMLight from 'calypso/assets/images/jetpack/jetpack-product-icon-crm-light.svg';
import JetpackProductIconCRM from 'calypso/assets/images/jetpack/jetpack-product-icon-crm.svg';
import JetpackProductIconGrowth from 'calypso/assets/images/jetpack/jetpack-product-icon-growth.svg';
import JetpackProductIconMonitorLight from 'calypso/assets/images/jetpack/jetpack-product-icon-monitor-light.svg';
import JetpackProductIconMonitor from 'calypso/assets/images/jetpack/jetpack-product-icon-monitor.svg';
import JetpackProductIconScanLight from 'calypso/assets/images/jetpack/jetpack-product-icon-scan-light.svg';
import JetpackProductIconScan from 'calypso/assets/images/jetpack/jetpack-product-icon-scan.svg';
import JetpackProductIconSearchLight from 'calypso/assets/images/jetpack/jetpack-product-icon-search-light.svg';
import JetpackProductIconSearch from 'calypso/assets/images/jetpack/jetpack-product-icon-search.svg';
import JetpackProductIconSecurity from 'calypso/assets/images/jetpack/jetpack-product-icon-security.svg';
import JetpackProductIconSocialLight from 'calypso/assets/images/jetpack/jetpack-product-icon-social-light.svg';
import JetpackProductIconSocial from 'calypso/assets/images/jetpack/jetpack-product-icon-social.svg';
import JetpackProductIconStatsLight from 'calypso/assets/images/jetpack/jetpack-product-icon-stats-light.svg';
import JetpackProductIconStats from 'calypso/assets/images/jetpack/jetpack-product-icon-stats.svg';
import JetpackProductIconVideopressLight from 'calypso/assets/images/jetpack/jetpack-product-icon-videopress-light.svg';
import JetpackProductIconVideopress from 'calypso/assets/images/jetpack/jetpack-product-icon-videopress.svg';
import WooCommerceLogo from 'calypso/assets/images/woocommerce/product-icon.svg';
import { productIconProps } from '../types';

const setProductsIcon = ( slugs: ReadonlyArray< string >, resource: IconResource ) =>
	slugs.reduce( ( map, slug ) => ( { ...map, [ slug ]: resource } ), {} );

interface IconResource {
	light: string;
	regular: string;
}

const PRODUCT_ICON_MAP: Record< string, IconResource > = {
	...setProductsIcon( JETPACK_BACKUP_PRODUCTS, {
		regular: JetpackProductIconBackup,
		light: JetpackProductIconBackupLight,
	} ),
	...setProductsIcon( JETPACK_BACKUP_ADDON_PRODUCTS, {
		regular: JetpackProductIconBackup,
		light: JetpackProductIconBackupLight,
	} ),
	...setProductsIcon( JETPACK_AI_PRODUCTS, {
		regular: JetpackProductIconAI,
		light: JetpackProductIconAILight,
	} ),
	...setProductsIcon( JETPACK_ANTI_SPAM_PRODUCTS, {
		regular: JetpackProductIconAntiSpam,
		light: JetpackProductIconAntiSpamLight,
	} ),
	...setProductsIcon( JETPACK_SCAN_PRODUCTS, {
		regular: JetpackProductIconScan,
		light: JetpackProductIconScanLight,
	} ),
	...setProductsIcon( JETPACK_VIDEOPRESS_PRODUCTS, {
		regular: JetpackProductIconVideopress,
		light: JetpackProductIconVideopressLight,
	} ),
	...setProductsIcon( JETPACK_SEARCH_PRODUCTS, {
		regular: JetpackProductIconSearch,
		light: JetpackProductIconSearchLight,
	} ),
	...setProductsIcon( JETPACK_BOOST_PRODUCTS, {
		regular: JetpackProductIconBoost,
		light: JetpackProductIconBoostLight,
	} ),
	...setProductsIcon( JETPACK_MONITOR_PRODUCTS, {
		regular: JetpackProductIconMonitor,
		light: JetpackProductIconMonitorLight,
	} ),
	...setProductsIcon( JETPACK_SOCIAL_PRODUCTS, {
		regular: JetpackProductIconSocial,
		light: JetpackProductIconSocialLight,
	} ),
	...setProductsIcon( JETPACK_SOCIAL_V1_PRODUCTS, {
		regular: JetpackProductIconSocial,
		light: JetpackProductIconSocialLight,
	} ),
	...setProductsIcon( JETPACK_CRM_PRODUCTS, {
		regular: JetpackProductIconCRM,
		light: JetpackProductIconCRMLight,
	} ),
	...setProductsIcon( JETPACK_STATS_PRODUCTS, {
		regular: JetpackProductIconStats,
		light: JetpackProductIconStatsLight,
	} ),
	...setProductsIcon( JETPACK_COMPLETE_PLANS, {
		regular: JetpackProductIconComplete,
		light: '',
	} ),
	...setProductsIcon( JETPACK_SECURITY_PLANS, {
		regular: JetpackProductIconSecurity,
		light: '',
	} ),
	...setProductsIcon( JETPACK_GROWTH_PLANS, {
		regular: JetpackProductIconGrowth,
		light: '',
	} ),
	...setProductsIcon( JETPACK_CREATOR_PRODUCTS, {
		regular: JetpackProductIconCreator,
		light: '',
	} ),
	...setProductsIcon( WOOCOMMERCE_PRODUCTS, {
		regular: WooCommerceLogo,
		light: WooCommerceLogo,
	} ),
};

const getProductIcon = ( { productSlug, light }: productIconProps ): string => {
	const iconResource = PRODUCT_ICON_MAP[ productSlug ];
	return light ? iconResource?.light : iconResource?.regular;
};

export default getProductIcon;
