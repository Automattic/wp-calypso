/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import { intersection } from 'lodash';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import PaymentLogo, { POSSIBLE_TYPES } from 'components/payment-logo';
import { getEnabledPaymentMethods } from 'lib/cart-values';

/**
 * Style dependencies
 */
import './style.scss';

function PaymentMethods( { translate, cart } ) {
	if ( ! cart.hasLoadedFromServer ) {
		return false;
	}

	let methods = getEnabledPaymentMethods( cart );

	if ( methods.includes( 'credit-card' ) ) {
		methods.splice( methods.indexOf( 'credit-card' ), 1, 'mastercard', 'visa', 'amex', 'discover' );
	}

	// The web-payment method technically supports multiple digital wallets,
	// but only Apple Pay is used for now. To enable other wallets, we'd need
	// to split web-payment up into multiple methods anyway (so that each
	// wallet is a separate payment choice for the user), so it's fine to just
	// hardcode this to Apple Pay in the meantime.
	if ( methods.includes( 'web-payment' ) ) {
		methods.splice( methods.indexOf( 'web-payment' ), 1, 'apple-pay' );
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
