/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import RadioButton from './radio-button';
import { useLocalize } from '../lib/localize';
import { useAllPaymentMethods } from '../public-api';

export default function CheckoutPaymentMethods( {
	summary,
	isComplete,
	className,
	availablePaymentMethods,
	paymentMethod,
	onChange,
} ) {
	const localize = useLocalize();

	const paymentMethods = useAllPaymentMethods();
	const paymentMethodsToDisplay = availablePaymentMethods
		? paymentMethods.filter( method => availablePaymentMethods.includes( method.id ) )
		: paymentMethods;

	if ( summary && isComplete && paymentMethod ) {
		return (
			<div className={ joinClasses( [ className, 'checkout-payment-methods' ] ) }>
				<PaymentMethod
					{ ...paymentMethod }
					checked={ true }
					summary
					ariaLabel={ paymentMethod.getAriaLabel( localize ) }
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
						key={ method.id }
						checked={ paymentMethod.id === method.id }
						onClick={ onChange }
						ariaLabel={ method.getAriaLabel( localize ) }
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
	SummaryComponent,
	checked,
	onClick,
	ariaLabel,
	summary,
} ) {
	if ( summary ) {
		return <SummaryComponent id={ id } />;
	}

	return (
		<RadioButton
			name="paymentMethod"
			value={ id }
			id={ id }
			checked={ checked }
			onChange={ onClick ? () => onClick( id ) : null }
			ariaLabel={ ariaLabel }
			label={ <LabelComponent /> }
		>
			{ PaymentMethodComponent && (
				<PaymentMethodComponent isActive={ checked } summary={ summary } />
			) }
		</RadioButton>
	);
}

PaymentMethod.propTypes = {
	id: PropTypes.string.isRequired,
	onClick: PropTypes.func,
	checked: PropTypes.bool.isRequired,
	ariaLabel: PropTypes.string.isRequired,
	PaymentMethodComponent: PropTypes.elementType,
	LabelComponent: PropTypes.elementType,
	SummaryComponent: PropTypes.elementType,
	summary: PropTypes.bool,
};

export const RadioButtons = styled.div`
	margin-bottom: 16px;
`;
