/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CartData from 'calypso/components/data/cart';
import PaymentMethods from 'calypso/blocks/payment-methods';
import JetpackFAQ from 'calypso/my-sites/plans-features-main/jetpack-faq';

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
