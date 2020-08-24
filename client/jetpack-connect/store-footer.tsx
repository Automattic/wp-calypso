/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CartData from 'components/data/cart';
import PaymentMethods from 'blocks/payment-methods';
import JetpackFAQ from 'my-sites/plans-features-main/jetpack-faq';

export default function StoreFooter() {
	return (
		<>
			<CartData>
				<PaymentMethods />
			</CartData>
			<JetpackFAQ />
		</>
	);
}
