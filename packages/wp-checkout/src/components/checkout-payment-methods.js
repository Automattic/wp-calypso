/* @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { getPaymentMethods } from '../lib/payment-methods';

export default function CheckoutPaymentMethods( {
	collapsed,
	className,
	availablePaymentMethods,
	paymentMethod,
	onChange,
} ) {
	const paymentMethods = getPaymentMethods();
	const paymentMethodsToDisplay = availablePaymentMethods
		? paymentMethods.filter( method => availablePaymentMethods.includes( method.id ) )
		: paymentMethods;

	if ( collapsed ) {
		// TODO
		return (
			<div className={ joinClasses( [ className, 'checkout-payment-methods' ] ) }>
				Summary Goes Here
			</div>
		);
	}

	return (
		<div className={ joinClasses( [ className, 'checkout-payment-methods' ] ) }>
			{ paymentMethodsToDisplay.map( method => (
				<PaymentMethod
					{ ...method }
					key={ method.id }
					checked={ paymentMethod === method.id }
					onClick={ onChange }
				/>
			) ) }
		</div>
	);
}

CheckoutPaymentMethods.propTypes = {
	collapsed: PropTypes.bool,
	className: PropTypes.string,
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.string ),
	paymentMethod: PropTypes.string,
	onChange: PropTypes.func.isRequired,
};

function PaymentMethod( { id, button, form, checked, onClick } ) {
	/* eslint-disable jsx-a11y/label-has-associated-control */
	return (
		<React.Fragment>
			<div>
				<input
					type="radio"
					id={ id }
					name="paymentMethod"
					value={ id }
					checked={ checked }
					onChange={ () => onClick( id ) }
				/>
				<label htmlFor={ id }>{ button }</label>
			</div>
			{ form && <div>{ form }</div> }
		</React.Fragment>
	);
	/* eslint-enable jsx-a11y/label-has-associated-control */
}
