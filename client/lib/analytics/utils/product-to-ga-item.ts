import { ResponseCartProduct } from '@automattic/shopping-cart';
import { GA_PRODUCT_BRAND_JETPACK, GA_PRODUCT_BRAND_WPCOM } from '../ad-tracking/constants';
import { TrackingEnvironment } from '../ad-tracking/google-analytics-4';
import costToUSD from './cost-to-usd';

export type GaItem = {
	item_id: string;
	item_name: string;
	item_brand: string;
	quantity: number;
	price: number;
};

export const ga4ProductBrandMapping: { [ env in TrackingEnvironment ]: string } = {
	[ TrackingEnvironment.WPCOM ]: GA_PRODUCT_BRAND_WPCOM,
	[ TrackingEnvironment.JETPACK ]: GA_PRODUCT_BRAND_JETPACK,
};

export function productToGaItem(
	product: ResponseCartProduct,
	currency: string,
	trackingEnvironment: TrackingEnvironment
): GaItem {
	return {
		item_id: product.product_id.toString(),
		item_name: product.product_name,
		quantity: product.volume,
		price: Number( costToUSD( product.cost, currency ) ),
		item_brand: ga4ProductBrandMapping[ trackingEnvironment ],
	};
}
