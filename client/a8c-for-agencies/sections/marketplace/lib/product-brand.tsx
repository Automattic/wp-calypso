import {
	PRODUCT_BRAND_FILTER_ALL,
	PRODUCT_BRAND_FILTER_JETPACK,
	PRODUCT_BRAND_FILTER_WOOCOMMERCE,
} from '../constants';

export function getValidBrand( brand: string ) {
	const validBrands = [ PRODUCT_BRAND_FILTER_JETPACK, PRODUCT_BRAND_FILTER_WOOCOMMERCE ];

	return validBrands.includes( brand ) ? brand : PRODUCT_BRAND_FILTER_ALL;
}
