import { isEnabled } from 'config';

export default isEnabled( 'jetpack/connect/woo-dna' )
	? {
			'woocommerce-payments': {
				name: translate => translate( 'WooCommerce Payments' ),
				helpUrl: 'https://docs.woocommerce.com/document/payments/', // TODO: Write a WCPay-specific page for Jetpack connection troubles
			},
	  }
	: {};
