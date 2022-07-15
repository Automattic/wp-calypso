import { ResponseCartProduct } from '@automattic/shopping-cart';
import { GA_PRODUCT_BRAND_JETPACK } from '../ad-tracking/constants';
import costToUSD from './cost-to-usd';

export type GaItem = {
	item_id: string;
	item_name: string;
	item_brand: string;
	quantity: number;
	price: number;
};

export function jetpackProductToGaItem( product: ResponseCartProduct, currency: string ): GaItem {
	return {
		item_id: product.product_id.toString(),
		item_name: product.product_name,
		quantity: product.volume,
		price: Number( costToUSD( product.cost, currency ) ),
		item_brand: GA_PRODUCT_BRAND_JETPACK,
	};
}
