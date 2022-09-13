import {
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_CRM_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_SOCIAL_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
	JETPACK_COMPLETE_PLANS,
	JETPACK_SECURITY_PLANS,
} from '@automattic/calypso-products';
import JetpackProductIconAntiSpam from 'calypso/assets/images/jetpack/jetpack-product-icon-antispam.svg';
import JetpackProductIconBackup from 'calypso/assets/images/jetpack/jetpack-product-icon-backup.svg';
import JetpackProductIconBoost from 'calypso/assets/images/jetpack/jetpack-product-icon-boost.svg';
import JetpackProductIconComplete from 'calypso/assets/images/jetpack/jetpack-product-icon-complete.svg';
import JetpackProductIconCRM from 'calypso/assets/images/jetpack/jetpack-product-icon-crm.svg';
import JetpackProductIconScan from 'calypso/assets/images/jetpack/jetpack-product-icon-scan.svg';
import JetpackProductIconSearch from 'calypso/assets/images/jetpack/jetpack-product-icon-search.svg';
import JetpackProductIconSecurity from 'calypso/assets/images/jetpack/jetpack-product-icon-security.svg';
import JetpackProductIconSocial from 'calypso/assets/images/jetpack/jetpack-product-icon-social.svg';
import JetpackProductIconVideopress from 'calypso/assets/images/jetpack/jetpack-product-icon-videopress.svg';
import { productIconProps } from '../types';

const setProductsIcon = ( slugs: ReadonlyArray< string >, src: string ) =>
	slugs.reduce( ( map, slug ) => ( { ...map, [ slug ]: src } ), {} );

const PRODUCT_ICON_MAP: Record< string, string > = {
	...setProductsIcon( JETPACK_BACKUP_PRODUCTS, JetpackProductIconBackup ),
	...setProductsIcon( JETPACK_ANTI_SPAM_PRODUCTS, JetpackProductIconAntiSpam ),
	...setProductsIcon( JETPACK_SCAN_PRODUCTS, JetpackProductIconScan ),
	...setProductsIcon( JETPACK_VIDEOPRESS_PRODUCTS, JetpackProductIconVideopress ),
	...setProductsIcon( JETPACK_SEARCH_PRODUCTS, JetpackProductIconSearch ),
	...setProductsIcon( JETPACK_BOOST_PRODUCTS, JetpackProductIconBoost ),
	...setProductsIcon( JETPACK_SOCIAL_PRODUCTS, JetpackProductIconSocial ),
	...setProductsIcon( JETPACK_CRM_PRODUCTS, JetpackProductIconCRM ),
	...setProductsIcon( JETPACK_COMPLETE_PLANS, JetpackProductIconComplete ),
	...setProductsIcon( JETPACK_SECURITY_PLANS, JetpackProductIconSecurity ),
};

const getProductIcon = ( { productSlug }: productIconProps ): string => {
	return PRODUCT_ICON_MAP[ productSlug ];
};

export default getProductIcon;
