/** @format */

/**
 * External dependencies
 */

import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';

class SubscriptionText extends React.Component {
	render() {
		if ( cartItems.hasRenewalItem( this.props.cart ) ) {
			return (
				<span className="subscription-text">
					{ this.props.translate( 'renews annually', {
						context: 'Informative text for renewals in /checkout',
					} ) }
				</span>
			);
		}

		return null;
	}
}

export default localize( SubscriptionText );
