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
import {
	useAllPaymentMethods,
	usePaymentMethod,
	usePaymentMethodId,
	useIsStepActive,
} from '../public-api';
import CheckoutErrorBoundary from './checkout-error-boundary';

export default function CheckoutPaymentMethods( { summary, isComplete, className } ) {
	const localize = useLocalize();

	const paymentMethod = usePaymentMethod();
	const [ , setPaymentMethod ] = usePaymentMethodId();
	const paymentMethods = useAllPaymentMethods();

	if ( summary && isComplete && paymentMethod ) {
		return (
			<div className={ joinClasses( [ className, 'checkout-payment-methods' ] ) }>
				<CheckoutErrorBoundary
					errorMessage={ localize( 'There was a problem with this payment method.' ) }
				>
					<PaymentMethod
						{ ...paymentMethod }
						checked={ true }
						summary
						ariaLabel={ paymentMethod.getAriaLabel( localize ) }
					/>
				</CheckoutErrorBoundary>
			</div>
		);
	}

	if ( summary ) {
		return null;
	}

	return (
		<div className={ joinClasses( [ className, 'checkout-payment-methods' ] ) }>
			<RadioButtons>
				{ paymentMethods.map( method => (
					<CheckoutErrorBoundary
						key={ method.id }
						errorMessage={
							localize( 'There was a problem with the payment method:' ) + ' ' + method.id
						}
					>
						<PaymentMethod
							{ ...method }
							checked={ paymentMethod.id === method.id }
							onClick={ setPaymentMethod }
							ariaLabel={ method.getAriaLabel( localize ) }
						/>
					</CheckoutErrorBoundary>
				) ) }
			</RadioButtons>
		</div>
	);
}

CheckoutPaymentMethods.propTypes = {
	summary: PropTypes.bool,
	isComplete: PropTypes.bool.isRequired,
	className: PropTypes.string,
};

export function CheckoutPaymentMethodsTitle() {
	const localize = useLocalize();
	const isActive = useIsStepActive();
	return isActive ? localize( 'Pick a payment method' ) : localize( 'Payment method' );
}

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
