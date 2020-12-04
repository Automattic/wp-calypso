/**
 * Internal dependencies
 */
import { CHECKOUT_TOGGLE_CART_ON_MOBILE } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

export function toggleCartOnMobile() {
	return { type: CHECKOUT_TOGGLE_CART_ON_MOBILE };
}
