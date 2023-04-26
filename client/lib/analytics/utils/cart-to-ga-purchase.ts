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

const parseCartInfo = ( cartInfo: WpcomJetpackCartInfo ) => ( {
	wpcom: {
		value: cartInfo.wpcomCostUSD + cartInfo.jetpackCostUSD,
		items: [ ...cartInfo.wpcomProducts, ...cartInfo.jetpackProducts ],
	},
	jetpack: {
		value: cartInfo.jetpackCostUSD,
		items: cartInfo.jetpackProducts,
	},
	akismet: {
		value: cartInfo.akismetCostUSD,
		items: cartInfo.akismetProducts,
	},
} );

const getCartInfoType = ( cartInfo: WpcomJetpackCartInfo ) => {
	if ( cartInfo.containsWpcomProducts ) {
		return 'wpcom';
	} else if ( cartInfo.containsJetpackProducts ) {
		return 'jetpack';
	} else if ( cartInfo.containsAkismetProducts ) {
		return 'akismet';
	}

	return 'wpcom';
};

export function cartToGaPurchase(
	orderId: string,
	cart: ResponseCart,
	cartInfo: WpcomJetpackCartInfo
): GaPurchase {
	const cartInfoType = getCartInfoType( cartInfo );

	const { value, items } = parseCartInfo( cartInfo )[ cartInfoType ];
	return {
		transaction_id: orderId,
		coupon: cart.coupon,
		currency: 'USD', // we track all prices in USD
		value,
		items: items.map( ( product ) => productToGaItem( product, cart.currency ) ),
	};
}
