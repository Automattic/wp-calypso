import { PayPalProvider } from '@automattic/calypso-paypal';
import { useShoppingCart } from '@automattic/shopping-cart';
import useCartKey from './use-cart-key';
import type { PropsWithChildren } from 'react';

export function CheckoutPaymentMethodWrapper( { children }: PropsWithChildren ) {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	return <PayPalProvider currency={ responseCart.currency }>{ children }</PayPalProvider>;
}
