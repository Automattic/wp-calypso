import { recordAddToCart as trackAddToCart } from 'calypso/lib/analytics/ad-tracking';
import { costToUSD } from 'calypso/lib/analytics/utils';
import { gaRecordEvent } from './ga';

// TODO: cartItem (RequestCartProduct) does not have `cost` or `currency` properties
export function recordAddToCart( { cartItem } ) {
	// TODO: move Tracks event here?
	// Google Analytics
	const usdValue = costToUSD( cartItem.cost, cartItem.currency );
	gaRecordEvent( 'Checkout', 'calypso_cart_product_add', '', usdValue ? usdValue : undefined );
	// Marketing
	trackAddToCart( cartItem );
}
