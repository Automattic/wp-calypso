/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';

const SubscriptionText = React.createClass( {
	render() {
		if ( cartItems.hasRenewalItem( this.props.cart ) ) {
			return (
				<span className="subscription-text">
					{ this.translate( 'renews annually', {
						context: 'Informative text for renewals in /checkout',
					} ) }
				</span>
			);
		}

		return null;
	},
} );

export default SubscriptionText;
