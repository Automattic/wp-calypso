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
	cartInfo: WpcomJetpackCartInfo,
	sendToJetpack = false
): GaPurchase {
	const value = sendToJetpack ? cartInfo.jetpackCostUSD : cartInfo.wpcomCostUSD;
	const cartItems = sendToJetpack ? cartInfo.jetpackProducts : cartInfo.wpcomProducts;
	return {
		transaction_id: orderId,
		coupon: cart.coupon,
		currency: 'USD', // we track all prices in USD
		value,
		items: cartItems.map( ( product ) => productToGaItem( product, cart.currency, sendToJetpack ) ),
	};
}
