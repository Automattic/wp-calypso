import {
	PRODUCT_BRAND_FILTER_ALL,
	PRODUCT_BRAND_FILTER_JETPACK,
	PRODUCT_BRAND_FILTER_WOOCOMMERCE,
} from '../constants';

export function getValidBrand( brand: string ) {
	return brand === PRODUCT_BRAND_FILTER_JETPACK || brand === PRODUCT_BRAND_FILTER_WOOCOMMERCE
		? brand
		: PRODUCT_BRAND_FILTER_ALL;
}
