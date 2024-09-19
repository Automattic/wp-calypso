import JetpackProductIconAILight from 'calypso/assets/images/jetpack/jetpack-product-icon-ai-light.svg';
import JetpackProductIconAI from 'calypso/assets/images/jetpack/jetpack-product-icon-ai.svg';
import JetpackProductIconAntiSpamLight from 'calypso/assets/images/jetpack/jetpack-product-icon-antispam-light.svg';
import JetpackProductIconAntiSpam from 'calypso/assets/images/jetpack/jetpack-product-icon-antispam.svg';
import JetpackProductIconBackupLight from 'calypso/assets/images/jetpack/jetpack-product-icon-backup-light.svg';
import JetpackProductIconBackup from 'calypso/assets/images/jetpack/jetpack-product-icon-backup.svg';
import JetpackProductIconBoostLight from 'calypso/assets/images/jetpack/jetpack-product-icon-boost-light.svg';
import JetpackProductIconBoost from 'calypso/assets/images/jetpack/jetpack-product-icon-boost.svg';
import JetpackProductIconCreator from 'calypso/assets/images/jetpack/jetpack-product-icon-creator.svg';
import JetpackProductIconMonitorLight from 'calypso/assets/images/jetpack/jetpack-product-icon-monitor-light.svg';
import JetpackProductIconMonitor from 'calypso/assets/images/jetpack/jetpack-product-icon-monitor.svg';
import JetpackProductIconScanLight from 'calypso/assets/images/jetpack/jetpack-product-icon-scan-light.svg';
import JetpackProductIconScan from 'calypso/assets/images/jetpack/jetpack-product-icon-scan.svg';
import JetpackProductIconSearchLight from 'calypso/assets/images/jetpack/jetpack-product-icon-search-light.svg';
import JetpackProductIconSearch from 'calypso/assets/images/jetpack/jetpack-product-icon-search.svg';
import JetpackProductIconSocialLight from 'calypso/assets/images/jetpack/jetpack-product-icon-social-light.svg';
import JetpackProductIconSocial from 'calypso/assets/images/jetpack/jetpack-product-icon-social.svg';
import JetpackProductIconStatsLight from 'calypso/assets/images/jetpack/jetpack-product-icon-stats-light.svg';
import JetpackProductIconStats from 'calypso/assets/images/jetpack/jetpack-product-icon-stats.svg';
import JetpackProductIconVideopressLight from 'calypso/assets/images/jetpack/jetpack-product-icon-videopress-light.svg';
import JetpackProductIconVideopress from 'calypso/assets/images/jetpack/jetpack-product-icon-videopress.svg';

type productIconProps = {
	productSlug: string;
	light?: boolean;
};

const setProductsIcon = ( slug: string, resource: IconResource ) => ( {
	[ slug ]: resource,
} );

interface IconResource {
	light: string;
	regular: string;
}

const PRODUCT_ICON_MAP: Record< string, IconResource > = {
	...setProductsIcon( 'jetpack-backup', {
		regular: JetpackProductIconBackup,
		light: JetpackProductIconBackupLight,
	} ),
	...setProductsIcon( 'jetpack-ai', {
		regular: JetpackProductIconAI,
		light: JetpackProductIconAILight,
	} ),
	...setProductsIcon( 'jetpack-anti-spam', {
		regular: JetpackProductIconAntiSpam,
		light: JetpackProductIconAntiSpamLight,
	} ),
	...setProductsIcon( 'jetpack-scan', {
		regular: JetpackProductIconScan,
		light: JetpackProductIconScanLight,
	} ),
	...setProductsIcon( 'jetpack-videopress', {
		regular: JetpackProductIconVideopress,
		light: JetpackProductIconVideopressLight,
	} ),
	...setProductsIcon( 'jetpack-search', {
		regular: JetpackProductIconSearch,
		light: JetpackProductIconSearchLight,
	} ),
	...setProductsIcon( 'jetpack-boost', {
		regular: JetpackProductIconBoost,
		light: JetpackProductIconBoostLight,
	} ),
	...setProductsIcon( 'jetpack-creator', {
		regular: JetpackProductIconCreator,
		light: '',
	} ),
	...setProductsIcon( 'jetpack-monitor', {
		regular: JetpackProductIconMonitor,
		light: JetpackProductIconMonitorLight,
	} ),
	...setProductsIcon( 'jetpack-social-basic', {
		regular: JetpackProductIconSocial,
		light: JetpackProductIconSocialLight,
	} ),
	...setProductsIcon( 'jetpack-social-advanced', {
		regular: JetpackProductIconSocial,
		light: JetpackProductIconSocialLight,
	} ),
	...setProductsIcon( 'jetpack-stats', {
		regular: JetpackProductIconStats,
		light: JetpackProductIconStatsLight,
	} ),
};

const getAPIFamilyProductIcon = ( { productSlug, light }: productIconProps ): string => {
	const iconResource = PRODUCT_ICON_MAP[ productSlug ];
	return light ? iconResource?.light : iconResource?.regular;
};

export default getAPIFamilyProductIcon;
