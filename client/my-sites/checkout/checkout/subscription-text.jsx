/**
 * External dependencies
 */

import React from 'react';

import { localize } from 'i18n-calypso';
import { isMonthly, isYearly, isBiennially } from 'calypso/lib/products-values';

/**
 * Internal dependencies
 */
import { hasRenewalItem } from 'calypso/lib/cart-values/cart-items';

/**
 * Style dependencies
 */
import './subscription-text.scss';

class SubscriptionText extends React.Component {
	render() {
		const { cart, translate } = this.props;

		if ( hasRenewalItem( cart ) ) {
			const product = cart.products[ 0 ];
			let informative_text = '';

			if ( isBiennially( product ) ) {
				informative_text = translate( 'renews every two years', {
					context: 'Informative text for renewals in /checkout',
				} );
			} else if ( isYearly( product ) ) {
				informative_text = translate( 'renews annually', {
					context: 'Informative text for renewals in /checkout',
				} );
			} else if ( isMonthly( product ) ) {
				informative_text = translate( 'renews monthly', {
					context: 'Informative text for renewals in /checkout',
				} );
			}

			return <span className="checkout__subscription-text">{ informative_text }</span>;
		}

		return null;
	}
}

export default localize( SubscriptionText );
