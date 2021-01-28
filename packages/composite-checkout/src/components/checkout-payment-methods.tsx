/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import debugFactory from 'debug';
import { useI18n } from '@automattic/react-i18n';
import { sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import styled from '../lib/styled';
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
import { FormStatus } from '../types';

const debug = debugFactory( 'composite-checkout:checkout-payment-methods' );

export const RadioButtons = styled.div`
	margin-bottom: 16px;
`;

export default function CheckoutPaymentMethods( {
	summary,
	isComplete,
	className,
}: {
	summary?: boolean;
	isComplete: boolean;
	className?: string;
} ): JSX.Element | null {
	const { __ } = useI18n();
	const onEvent = useEvents();
	const onError = useCallback(
		( error ) => onEvent( { type: 'PAYMENT_METHOD_LOAD_ERROR', payload: error } ),
		[ onEvent ]
	);

	const paymentMethod = usePaymentMethod();
	const [ , setPaymentMethod ] = usePaymentMethodId();
	const onClickPaymentMethod = ( newMethod: string ) => {
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
						id={ paymentMethod.id }
						label={ paymentMethod.label }
						activeContent={ paymentMethod.activeContent }
						inactiveContent={ paymentMethod.inactiveContent }
						checked={ true }
						summary={ true }
						ariaLabel={ paymentMethod.getAriaLabel( __ as ( text: string ) => string ) }
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
							/* translators: %s is the payment method name that has an error, like "PayPal" */
							__( 'There was a problem with the payment method: %s' ),
							method.id
						) }
						onError={ onError }
					>
						<PaymentMethod
							id={ method.id }
							label={ method.label }
							activeContent={ method.activeContent }
							inactiveContent={ method.inactiveContent }
							checked={ paymentMethod?.id === method.id }
							onClick={ onClickPaymentMethod }
							ariaLabel={ method.getAriaLabel( __ as ( text: string ) => string ) }
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

export function CheckoutPaymentMethodsTitle(): JSX.Element {
	const { __ } = useI18n();
	const isActive = useIsStepActive();
	const isComplete = useIsStepComplete();
	return <>{ ! isActive && isComplete ? __( 'Payment method' ) : __( 'Pick a payment method' ) }</>;
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
}: PaymentMethodProps ): JSX.Element {
	const { formStatus } = useFormStatus();
	if ( summary ) {
		return <>{ inactiveContent && inactiveContent }</>;
	}

	return (
		<RadioButton
			name="paymentMethod"
			value={ id }
			id={ id }
			checked={ checked }
			disabled={ formStatus !== FormStatus.READY }
			onChange={ onClick ? () => onClick( id ) : undefined }
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

interface PaymentMethodProps {
	id: string;
	onClick?: ( id: string ) => void;
	checked: boolean;
	ariaLabel: string;
	activeContent?: React.ReactNode;
	label?: React.ReactNode;
	inactiveContent?: React.ReactNode;
	summary?: boolean;
}
