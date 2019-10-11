/* @format */

/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import { useLocalize } from './localize';

export default function CheckoutPaymentMethods( {
	collapsed,
	className,
	availablePaymentMethods,
	onChange,
} ) {
	// TODO: get choices from payment methods and filter by availablePaymentMethods
	const localize = useLocalize();
	const [ choice, setChoice ] = useState( 'apple-pay' );
	useEffect( () => {
		onChange( choice );
	}, [ onChange, choice ] );

	if ( collapsed ) {
		return (
			<div className={ joinClasses( [ className, 'checkout-payment-methods' ] ) }>
				Summary Goes Here
			</div>
		);
	}

	return (
		<div className={ joinClasses( [ className, 'checkout-payment-methods' ] ) }>
			<div>
				<input
					type="radio"
					id="apple-pay"
					name="paymentMethod"
					value="apple-pay"
					checked={ choice === 'apple-pay' }
					onClick={ () => setChoice( 'apple-pay' ) }
				/>
				<label htmlFor="apple-pay">{ localize( 'Apple Pay' ) }</label>
			</div>
			<div>
				<input
					type="radio"
					id="credit"
					name="paymentMethod"
					value="credit"
					checked={ choice === 'credit' }
					onClick={ () => setChoice( 'card' ) }
				/>
				<label htmlFor="credit">{ localize( 'Credit or debit card' ) }</label>
			</div>
			<div>
				<input
					type="radio"
					id="paypal"
					name="paymentMethod"
					value="paypal"
					checked={ choice === 'paypal' }
					onClick={ () => setChoice( 'paypal' ) }
				/>
				<label htmlFor="paypal">{ localize( 'Paypal' ) }</label>
			</div>
		</div>
	);
}

CheckoutPaymentMethods.propTypes = {
	collapsed: PropTypes.bool,
	className: PropTypes.string,
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.string ),
	onChange: PropTypes.func.isRequired,
};
