import { ResponseCart } from '@automattic/shopping-cart';
import { GaItem, productToGaItem } from './product-to-ga-item';
import { WpcomJetpackCartInfo } from './split-wpcom-jetpack-cart-info';

export type GaPurchase = {
	value: number;
	currency: string;
	tax?: number;
	transaction_id: string;
	coupon: string;
	items: GaItem[];
};

export function cartToGaPurchase(
	orderId: string,
	cart: ResponseCart,
	cartInfo: WpcomJetpackCartInfo
): GaPurchase {
	const value = cartInfo.containsWpcomProducts
		? cartInfo.wpcomCostUSD + cartInfo.jetpackCostUSD
		: cartInfo.jetpackCostUSD;
	const cartItems = cartInfo.containsWpcomProducts
		? [ ...cartInfo.wpcomProducts, ...cartInfo.jetpackProducts ]
		: cartInfo.jetpackProducts;
	return {
		transaction_id: orderId,
		coupon: cart.coupon,
		currency: 'USD', // we track all prices in USD
		value,
		items: cartItems.map( ( product ) => productToGaItem( product, cart.currency ) ),
	};
}
