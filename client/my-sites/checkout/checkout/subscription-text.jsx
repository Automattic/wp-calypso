/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
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
					{ this.props.translate( 'renews annually', {
						context: 'Informative text for renewals in /checkout'
					} ) }
				</span>
			);
		}

		return null;
	}
} );

export default localize( SubscriptionText );
