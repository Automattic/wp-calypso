import { isJetpackPlan, isJetpackProduct } from '@automattic/calypso-products';
import { getCurrencyObject } from '@automattic/number-formatters';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { GA_PRODUCT_BRAND_JETPACK, GA_PRODUCT_BRAND_WPCOM } from '../ad-tracking/constants';

export type GaItem = {
	item_id: string;
	item_name: string;
	item_brand: string;
	quantity: number;
	price: number;
};

export function productToGaItem( product: ResponseCartProduct ): GaItem {
	const item_brand =
		isJetpackPlan( product ) || isJetpackProduct( product )
			? GA_PRODUCT_BRAND_JETPACK
			: GA_PRODUCT_BRAND_WPCOM;
	return {
		item_id: product.product_id.toString(),
		item_name: product.product_name,
		quantity: product.volume,
		price: getCurrencyObject( product.item_total_usd_integer, 'USD', { isSmallestUnit: true } )
			.floatValue,
		item_brand,
	};
}
