/**
 * Internal dependencies
 */
import { costToUSD } from 'calypso/lib/analytics/utils';

import { recordAddToCart as trackAddToCart } from 'calypso/lib/analytics/ad-tracking';
import { gaRecordEvent } from './ga';

export function recordAddToCart( { cartItem } ) {
	// TODO: move Tracks event here?
	// Google Analytics
	const usdValue = costToUSD( cartItem.cost, cartItem.currency );
	gaRecordEvent( 'Checkout', 'calypso_cart_product_add', '', usdValue ? usdValue : undefined );
	// Marketing
	trackAddToCart( cartItem );
}
