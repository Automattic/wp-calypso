/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import { intersection } from 'lodash';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import PaymentLogo, { POSSIBLE_TYPES } from 'calypso/components/payment-logo';
import { getEnabledPaymentMethods } from 'calypso/lib/cart-values';

/**
 * Style dependencies
 */
import './style.scss';

function PaymentMethods( { translate, cart } ) {
	if ( ! cart.hasLoadedFromServer ) {
		return false;
	}

	let methods = getEnabledPaymentMethods( cart );

	if ( methods.includes( 'card' ) ) {
		methods.splice( methods.indexOf( 'card' ), 1, 'mastercard', 'visa', 'amex', 'discover' );
	}

	methods = intersection( methods, POSSIBLE_TYPES );

	if ( methods.length === 0 ) {
		return null;
	}

	return (
		<div className="payment-methods">
			<Gridicon
				icon="lock"
				size={ 18 }
				aria-label={ translate( 'Lock icon' ) }
				className="payment-methods__icon"
			/>
			{ translate( 'Secure payment using:', {
				comment: 'Followed by a graphical list of payment methods available to the user',
			} ) }

			<div className="payment-methods__methods">
				{ methods.map( ( method ) => (
					<PaymentLogo type={ method } key={ method } />
				) ) }
			</div>
		</div>
	);
}

PaymentMethods.propTypes = {
	translate: PropTypes.func.isRequired,
	cart: PropTypes.object,
};

export default localize( PaymentMethods );
