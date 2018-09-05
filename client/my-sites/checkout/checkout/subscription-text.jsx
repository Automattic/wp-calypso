/** @format */

/**
 * External dependencies
 */

import React from 'react';

import { localize } from 'i18n-calypso';
import { isMonthly, isYearly, isBiennially } from 'lib/products-values';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';

class SubscriptionText extends React.Component {
	render() {
		if ( cartItems.hasRenewalItem( this.props.cart ) ) {
			const product = this.props.cart.products[ 0 ];
			let aside_text = '';

			if ( isBiennially( product ) ) {
				aside_text = 'renews biennially';
			} else if ( isYearly( product ) ) {
				aside_text = 'renews annually';
			} else if ( isMonthly( product ) ) {
				aside_text = 'renews monthly';
			}

			return (
				<span className="subscription-text">
					{ this.props.translate( aside_text, {
						context: 'Informative text for renewals in /checkout',
					} ) }
				</span>
			);
		}

		return null;
	}
}

export default localize( SubscriptionText );
