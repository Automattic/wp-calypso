import jetpackLogo from '../../exclusive-offers/images/jetpack-descriptor.svg';
import pressableLogo from '../../exclusive-offers/images/pressable-descriptor.svg';
import wooLogo from '../../exclusive-offers/images/woo-descriptor.svg';
import type { ProductBrand } from './product-categories';

export const BRAND_MARKS: Record< ProductBrand, string > = {
	jetpack: jetpackLogo,
	woocommerce: wooLogo,
	pressable: pressableLogo,
};
