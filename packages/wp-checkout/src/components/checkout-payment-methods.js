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
import { RadioButtons } from './basics';
import RadioButton from './radio-button';

export default function CheckoutPaymentMethods( {
	summary,
	isActive,
	isComplete,
	className,
	availablePaymentMethods,
	paymentMethod,
	onChange,
} ) {
	const paymentMethods = getPaymentMethods();
	const paymentMethodsToDisplay = availablePaymentMethods
		? paymentMethods.filter( method => availablePaymentMethods.includes( method.id ) )
		: paymentMethods;

	if ( summary && isComplete && paymentMethod ) {
		return (
			<div className={ joinClasses( [ className, 'checkout-payment-methods' ] ) }>
				<PaymentMethod
					{ ...paymentMethod }
					isActive={ isActive }
					isComplete={ isComplete }
					checked={ true }
				/>
			</div>
		);
	}
	if ( summary ) {
		return null;
	}

	return (
		<div className={ joinClasses( [ className, 'checkout-payment-methods' ] ) }>
			<RadioButtons>
				{ paymentMethodsToDisplay.map( method => (
					<PaymentMethod
						{ ...method }
						isActive={ isActive }
						isComplete={ isComplete }
						key={ method.id }
						checked={ paymentMethod.id === method.id }
						onClick={ onChange }
					/>
				) ) }
			</RadioButtons>
		</div>
	);
}

CheckoutPaymentMethods.propTypes = {
	summary: PropTypes.bool,
	isComplete: PropTypes.bool.isRequired,
	isActive: PropTypes.bool.isRequired,
	className: PropTypes.string,
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.string ),
	paymentMethod: PropTypes.object,
	onChange: PropTypes.func.isRequired,
};

function PaymentMethod( {
	id,
	LabelComponent,
	PaymentMethodComponent,
	checked,
	onClick,
	isActive,
	isComplete,
} ) {
	return (
		<React.Fragment>
			<RadioButton
				name="paymentMethod"
				value={ id }
				checked={ checked }
				onChange={ onClick ? () => onClick( id ) : null }
			>
				<LabelComponent />
			</RadioButton>
			{ PaymentMethodComponent && (
				<PaymentMethodComponent isActive={ isActive } isComplete={ isComplete } />
			) }
		</React.Fragment>
	);
}

PaymentMethod.propTypes = {
	id: PropTypes.string.isRequired,
	onClick: PropTypes.func,
	checked: PropTypes.bool.isRequired,
	isActive: PropTypes.bool.isRequired,
	isComplete: PropTypes.bool.isRequired,
	PaymentMethodComponent: PropTypes.func,
	LabelComponent: PropTypes.func,
};
