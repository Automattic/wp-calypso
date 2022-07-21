import { usePaymentMethod } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from 'calypso/my-sites/checkout/composite-checkout/lib/translate-payment-method-names';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';

export function EbanxTermsOfService() {
	const translate = useTranslate();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const currentPaymentMethod = usePaymentMethod();

	const canUseEbanx = responseCart.allowed_payment_methods.includes(
		translateCheckoutPaymentMethodToWpcomPaymentMethod( 'ebanx' ) ?? ''
	);
	if ( ! canUseEbanx ) {
		return;
	}
	if ( currentPaymentMethod?.id !== 'card' ) {
		return;
	}

	// This text and link was provided by EBanx directly. See https://github.com/Automattic/payments-shilling/issues/983
	const tosUrl =
		'http://go.pardot.com/e/779123/br-termos-/2s9d1h/1387578788?h=Y8e15EGjfwatzTqGa7lilIlSEGTaOz-BZC5xFvBZICk';
	const tosText = translate(
		'This is an international purchase, which is subject to a currency exchange operation, to be processed by EBANX, according to these {{tosLink}}terms and conditions{{/tosLink}}. By clicking "BUY", you state acknowledgment and acceptance of the terms and conditions of this transaction.',
		{
			components: {
				tosLink: <a href={ tosUrl } target="_blank" rel="noopener noreferrer" />,
			},
		}
	);
	return (
		<div>
			<p>{ tosText }</p>
		</div>
	);
}
