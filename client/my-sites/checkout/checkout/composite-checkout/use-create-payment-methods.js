/**
 * External dependencies
 */
import { useMemo } from 'react';
import { createPayPalMethod, registerStore, defaultRegistry } from '@automattic/composite-checkout';
import { format as formatUrl, parse as parseUrl } from 'url';

/**
 * Internal dependencies
 */
import {
	makePayPalExpressRequest,
	wpcomPayPalExpress,
	getDomainDetails,
} from '../composite-checkout-payment-methods';

const { select } = defaultRegistry;

export function useCreatePayPal( { onlyLoadPaymentMethods, getThankYouUrl, getItems } ) {
	const shouldLoadPayPalMethod = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'paypal' )
		: true;
	const paypalMethod = useMemo( () => {
		if ( ! shouldLoadPayPalMethod ) {
			return null;
		}
		return createPayPalMethod( { registerStore } );
	}, [ shouldLoadPayPalMethod ] );
	if ( paypalMethod ) {
		paypalMethod.id = 'paypal';
		// This is defined afterward so that getThankYouUrl can be dynamic without having to re-create payment method
		paypalMethod.submitTransaction = () => {
			const { protocol, hostname, port, pathname } = parseUrl( window.location.href, true );
			const successUrl = formatUrl( {
				protocol,
				hostname,
				port,
				pathname: getThankYouUrl(),
			} );
			const cancelUrl = formatUrl( {
				protocol,
				hostname,
				port,
				pathname,
			} );

			return makePayPalExpressRequest(
				{
					items: getItems(),
					successUrl,
					cancelUrl,
					siteId: select( 'wpcom' )?.getSiteId?.() ?? '',
					domainDetails: getDomainDetails( select ),
					couponId: null, // TODO: get couponId
					country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value ?? '',
					postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value ?? '',
					subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value ?? '',
				},
				wpcomPayPalExpress
			);
		};
	}
	return paypalMethod;
}
