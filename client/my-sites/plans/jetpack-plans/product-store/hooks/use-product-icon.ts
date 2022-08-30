import {
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_CRM_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
} from '@automattic/calypso-products';
import JetpackProductIconAntiSpam from 'calypso/assets/images/jetpack/jetpack-product-icon-antispam.svg';
import JetpackProductIconBackup from 'calypso/assets/images/jetpack/jetpack-product-icon-backup.svg';
import JetpackProductIconBoost from 'calypso/assets/images/jetpack/jetpack-product-icon-boost.svg';
import JetpackProductIconCRM from 'calypso/assets/images/jetpack/jetpack-product-icon-crm.svg';
import JetpackProductIconScan from 'calypso/assets/images/jetpack/jetpack-product-icon-scan.svg';
import JetpackProductIconSearch from 'calypso/assets/images/jetpack/jetpack-product-icon-search.svg';
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
	// TODO - Set Jetpack social product ucon here
	...setProductsIcon( JETPACK_CRM_PRODUCTS, JetpackProductIconCRM ),
};

const useProductIcon = ( { productSlug }: productIconProps ): string => {
	return PRODUCT_ICON_MAP[ productSlug ];
};

export default useProductIcon;
