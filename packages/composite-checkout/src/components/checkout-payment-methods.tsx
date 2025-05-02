import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useCallback, useContext } from 'react';
import CheckoutContext from '../lib/checkout-context';
import joinClasses from '../lib/join-classes';
import { PaymentMethodProviderContext } from '../lib/payment-method-provider-context';
import { useAvailablePaymentMethodIds } from '../lib/payment-methods';
import {
	useAllPaymentMethods,
	usePaymentMethod,
	usePaymentMethodId,
	useIsStepActive,
	useIsStepComplete,
	useFormStatus,
} from '../public-api';
import { FormStatus } from '../types';
import CheckoutErrorBoundary from './checkout-error-boundary';
import RadioButton from './radio-button';
import type { ReactNode } from 'react';

const debug = debugFactory( 'composite-checkout:checkout-payment-methods' );

const CheckoutPaymentMethodsWrapper = styled.div`
	padding-top: 4px;
	> div > div:not( [disabled] ):has( + div:hover )::before,
	> div > div[disabled]:has( + div.is-checked[disabled] )::before {
		border-bottom: none;
	}
`;

export default function CheckoutPaymentMethods( {
	summary,
	isComplete,
	className,
}: {
	summary?: boolean;
	isComplete: boolean;
	className?: string;
} ) {
	const { __ } = useI18n();
	const { onPageLoadError } = useContext( CheckoutContext );
	const { onPaymentMethodChanged } = useContext( PaymentMethodProviderContext );
	const onError = useCallback(
		( error: Error ) => onPageLoadError?.( 'payment_method_load', error ),
		[ onPageLoadError ]
	);

	const paymentMethod = usePaymentMethod();
	const [ , setPaymentMethod ] = usePaymentMethodId();
	const onClickPaymentMethod = ( newMethod: string ) => {
		debug( 'setting payment method to', newMethod );
		onPaymentMethodChanged?.( newMethod );
		setPaymentMethod( newMethod );
	};
	const paymentMethods = useAllPaymentMethods();

	if ( summary && isComplete && paymentMethod ) {
		debug( 'rendering selected paymentMethod', paymentMethod );
		return (
			<CheckoutPaymentMethodsWrapper
				className={ joinClasses( [ className, 'checkout-payment-methods' ] ) }
			>
				<CheckoutErrorBoundary
					errorMessage={ __( 'There was a problem with this payment method.' ) }
					onError={ onError }
				>
					<PaymentMethod
						id={ paymentMethod.id }
						label={ paymentMethod.label }
						activeContent={ paymentMethod.activeContent }
						inactiveContent={ paymentMethod.inactiveContent }
						checked
						summary
						ariaLabel={ paymentMethod.getAriaLabel( __ as ( text: string ) => string ) }
					/>
				</CheckoutErrorBoundary>
			</CheckoutPaymentMethodsWrapper>
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
		<CheckoutPaymentMethodsWrapper
			className={ joinClasses( [ className, 'checkout-payment-methods' ] ) }
		>
			<div>
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
			</div>
		</CheckoutPaymentMethodsWrapper>
	);
}

export function CheckoutPaymentMethodsTitle() {
	const { __ } = useI18n();
	const isActive = useIsStepActive();
	const isComplete = useIsStepComplete();

	const paymentMethodLabelActive = __( 'Pick a payment method' );
	const paymentMethodLabelInactive = __( 'Payment method' );

	return <>{ ! isActive && isComplete ? paymentMethodLabelInactive : paymentMethodLabelActive }</>;
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
}: PaymentMethodProps ) {
	const availablePaymentMethodIds = useAvailablePaymentMethodIds();
	const { formStatus } = useFormStatus();
	const isSinglePaymentMethod = availablePaymentMethodIds.length === 1;

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
			hidden={ ! availablePaymentMethodIds.includes( id ) }
			onChange={ onClick ? () => onClick( id ) : undefined }
			ariaLabel={ ariaLabel }
			label={ label }
			hideRadioButton={ isSinglePaymentMethod }
		>
			{ activeContent && activeContent }
		</RadioButton>
	);
}

interface PaymentMethodProps {
	id: string;
	onClick?: ( id: string ) => void;
	checked: boolean;
	ariaLabel: string;
	activeContent?: ReactNode;
	label?: ReactNode;
	inactiveContent?: ReactNode;
	summary?: boolean;
}
