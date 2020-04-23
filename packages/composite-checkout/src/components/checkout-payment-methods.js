/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import debugFactory from 'debug';

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
	useIsStepComplete,
	useEvents,
} from '../public-api';
import CheckoutErrorBoundary from './checkout-error-boundary';

const debug = debugFactory( 'composite-checkout:checkout-payment-methods' );

export default function CheckoutPaymentMethods( { summary, isComplete, className } ) {
	const localize = useLocalize();
	const onEvent = useEvents();
	const onError = useCallback(
		( error ) => onEvent( { type: 'PAYMENT_METHOD_LOAD_ERROR', payload: error.message } ),
		[ onEvent ]
	);

	const paymentMethod = usePaymentMethod();
	const [ , setPaymentMethod ] = usePaymentMethodId();
	const onClickPaymentMethod = ( newMethod ) => {
		debug( 'setting payment method to', newMethod );
		setPaymentMethod( newMethod );
	};
	const paymentMethods = useAllPaymentMethods();

	if ( summary && isComplete && paymentMethod ) {
		debug( 'rendering selected paymentMethod', paymentMethod );
		return (
			<div className={ joinClasses( [ className, 'checkout-payment-methods' ] ) }>
				<CheckoutErrorBoundary
					errorMessage={ localize( 'There was a problem with this payment method.' ) }
					onError={ onError }
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
		debug(
			'summary requested, but no complete paymentMethod is selected; isComplete:',
			isComplete,
			'paymentMethod:',
			paymentMethod
		);
		return null;
	}
	debug( 'rendering paymentMethods', paymentMethods );

	return (
		<div className={ joinClasses( [ className, 'checkout-payment-methods' ] ) }>
			<RadioButtons>
				{ paymentMethods.map( ( method ) => (
					<CheckoutErrorBoundary
						key={ method.id }
						errorMessage={
							localize( 'There was a problem with the payment method:' ) + ' ' + method.id
						}
						onError={ onError }
					>
						<PaymentMethod
							{ ...method }
							checked={ paymentMethod?.id === method.id }
							onClick={ onClickPaymentMethod }
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
	const isComplete = useIsStepComplete();
	return ! isActive && isComplete
		? localize( 'Payment method' )
		: localize( 'Pick a payment method' );
}

function PaymentMethod( {
	id,
	label,
	activeContent,
	inactiveContent,
	checked,
	onClick,
	ariaLabel,
	summary,
} ) {
	if ( summary ) {
		return inactiveContent;
	}

	return (
		<RadioButton
			name="paymentMethod"
			value={ id }
			id={ id }
			checked={ checked }
			onChange={ onClick ? () => onClick( id ) : null }
			ariaLabel={ ariaLabel }
			label={ label }
		>
			{ activeContent && activeContent }
		</RadioButton>
	);
}

PaymentMethod.propTypes = {
	id: PropTypes.string.isRequired,
	onClick: PropTypes.func,
	checked: PropTypes.bool.isRequired,
	ariaLabel: PropTypes.string.isRequired,
	activeContent: PropTypes.node,
	label: PropTypes.node,
	inactiveContent: PropTypes.node,
	summary: PropTypes.bool,
};

export const RadioButtons = styled.div`
	margin-bottom: 16px;
`;
