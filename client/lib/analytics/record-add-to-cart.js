import { getCurrencyObject } from '@automattic/number-formatters';
import { recordAddToCart as trackAddToCart } from 'calypso/lib/analytics/ad-tracking';
import { gaRecordEvent } from './ga';

export function recordAddToCart( { cartItem } ) {
	// TODO: move Tracks event here?
	// Google Analytics
	const usdValue = getCurrencyObject( cartItem.item_total_usd_integer, 'USD', {
		isSmallestUnit: true,
	} ).floatValue;
	gaRecordEvent( 'Checkout', 'calypso_cart_product_add', '', usdValue );
	// Marketing
	trackAddToCart( cartItem );
}
