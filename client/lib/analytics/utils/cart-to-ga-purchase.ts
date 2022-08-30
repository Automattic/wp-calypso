import { ResponseCart } from '@automattic/shopping-cart';
import { TrackingEnvironment } from '../ad-tracking/google-analytics-4';
import { GaItem, productToGaItem } from './product-to-ga-item';
import { WpcomJetpackCartInfo } from './split-wpcom-jetpack-cart-info';

export type GaPurchase = {
	value: number;
	currency: string;
	tax?: number;
	transaction_id: string;
	coupon: string;
	items: GaItem[];
	trackingEnvironment: TrackingEnvironment;
};

export function cartToGaPurchase(
	orderId: string,
	cart: ResponseCart,
	cartInfo: WpcomJetpackCartInfo,
	trackingEnvironment: TrackingEnvironment
): GaPurchase {
	const value = cartInfo.containsWpcomProducts ? cartInfo.wpcomCostUSD : cartInfo.jetpackCostUSD;
	const cartItems = cartInfo.containsWpcomProducts
		? cartInfo.wpcomProducts
		: cartInfo.jetpackProducts;
	return {
		transaction_id: orderId,
		coupon: cart.coupon,
		currency: 'USD', // we track all prices in USD
		value,
		items: cartItems.map( ( product ) =>
			productToGaItem( product, cart.currency, trackingEnvironment )
		),
		trackingEnvironment,
	};
}
