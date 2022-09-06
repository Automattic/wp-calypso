import { ResponseCart } from '@automattic/shopping-cart';
import { GaItem, jetpackProductToGaItem, wpcomProductToGaItem } from './jetpack-product-to-ga-item';
import { WpcomJetpackCartInfo } from './split-wpcom-jetpack-cart-info';

export type GaPurchase = {
	value: number;
	currency: string;
	tax?: number;
	transaction_id: string;
	coupon: string;
	items: GaItem[];
};

export function jetpackCartToGaPurchase(
	orderId: string,
	cart: ResponseCart,
	cartInfo: WpcomJetpackCartInfo
): GaPurchase {
	return {
		transaction_id: orderId,
		coupon: cart.coupon,
		currency: 'USD', // we track all prices in USD
		value: cartInfo.jetpackCostUSD,
		items: cartInfo.jetpackProducts.map( ( product ) =>
			jetpackProductToGaItem( product, cart.currency )
		),
	};
}

export function wpcomCartToGaPurchase(
	orderId: string,
	cart: ResponseCart,
	cartInfo: WpcomJetpackCartInfo
): GaPurchase {
	return {
		transaction_id: orderId,
		coupon: cart.coupon,
		currency: 'USD', // we track all prices in USD
		value: cartInfo.wpcomCostUSD,
		items: cartInfo.wpcomProducts.map( ( product ) =>
			wpcomProductToGaItem( product, cart.currency )
		),
	};
}
