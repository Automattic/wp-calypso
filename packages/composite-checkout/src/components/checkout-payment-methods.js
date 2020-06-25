/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import debugFactory from 'debug';
import { useI18n } from '@automattic/react-i18n';
import { sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import RadioButton from './radio-button';
import {
	useAllPaymentMethods,
	usePaymentMethod,
	usePaymentMethodId,
	useIsStepActive,
	useIsStepComplete,
	useEvents,
	useFormStatus,
} from '../public-api';
import CheckoutErrorBoundary from './checkout-error-boundary';

const debug = debugFactory( 'composite-checkout:checkout-payment-methods' );

export default function CheckoutPaymentMethods( { summary, isComplete, className } ) {
	const { __ } = useI18n();
	const onEvent = useEvents();
	const onError = useCallback(
		( error ) => onEvent( { type: 'PAYMENT_METHOD_LOAD_ERROR', payload: error } ),
		[ onEvent ]
	);

	const paymentMethod = usePaymentMethod();
	const [ , setPaymentMethod ] = usePaymentMethodId();
	const onClickPaymentMethod = ( newMethod ) => {
		debug( 'setting payment method to', newMethod );
		onEvent( { type: 'PAYMENT_METHOD_SELECT', payload: newMethod } );
		setPaymentMethod( newMethod );
	};
	const paymentMethods = useAllPaymentMethods();

	if ( summary && isComplete && paymentMethod ) {
		debug( 'rendering selected paymentMethod', paymentMethod );
		return (
			<div className={ joinClasses( [ className, 'checkout-payment-methods' ] ) }>
				<CheckoutErrorBoundary
					errorMessage={ __( 'There was a problem with this payment method.' ) }
					onError={ onError }
				>
					<PaymentMethod
						{ ...paymentMethod }
						checked={ true }
						summary
						ariaLabel={ paymentMethod.getAriaLabel( __ ) }
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
						errorMessage={ sprintf(
							__( 'There was a problem with the payment method: %s' ),
							method.id
						) }
						onError={ onError }
					>
						<PaymentMethod
							{ ...method }
							checked={ paymentMethod?.id === method.id }
							onClick={ onClickPaymentMethod }
							ariaLabel={ method.getAriaLabel( __ ) }
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
	const { __ } = useI18n();
	const isActive = useIsStepActive();
	const isComplete = useIsStepComplete();
	return ! isActive && isComplete ? __( 'Payment method' ) : __( 'Pick a payment method' );
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
	const { formStatus } = useFormStatus();
	if ( summary ) {
		return inactiveContent;
	}

	return (
		<RadioButton
			name="paymentMethod"
			value={ id }
			id={ id }
			checked={ checked }
			disabled={ formStatus !== 'ready' }
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
