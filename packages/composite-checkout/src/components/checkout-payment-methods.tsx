import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useCallback, useContext } from 'react';
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
	useArePaymentMethodsLoading,
} from '../public-api';
import { CheckoutPageErrorCallback, FormStatus } from '../types';
import CheckoutErrorBoundary from './checkout-error-boundary';
import RadioButton from './radio-button';
import type { ReactNode } from 'react';

const debug = debugFactory( 'composite-checkout:checkout-payment-methods' );

const CheckoutPaymentMethodsWrapper = styled.div< { isLoading: boolean } >`
	position: relative;
	padding-top: 4px;
	pointer-events: ${ ( props ) => ( props.isLoading ? 'none' : 'auto' ) };
	> div > div:not( [disabled] ):has( + div:hover )::before,
	> div > div[disabled]:has( + div.is-checked[disabled] )::before {
		border-bottom: none;
	}
`;

const LoadingOverlay = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba( 255, 255, 255, 0.9 );
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
	cursor: not-allowed;
`;

const LoadingSpinner = styled.div`
	border: 3px solid #f3f3f3;
	border-top: 3px solid #3498db;
	border-radius: 50%;
	width: 40px;
	height: 40px;
	animation: spin 1s linear infinite;

	@keyframes spin {
		0% {
			transform: rotate( 0deg );
		}
		100% {
			transform: rotate( 360deg );
		}
	}
`;

const PaymentMethodsContainer = styled.div< { isLoading: boolean } >`
	position: relative;
	min-height: 100px;
	opacity: ${ ( props ) => ( props.isLoading ? 0.3 : 1 ) };
`;

const SinglePaymentMethodWrapper = styled.div`
	position: relative;
	border-radius: 3px;
	box-sizing: border-box;
	width: 100%;
`;

const SinglePaymentMethodLabel = styled.div`
	padding-block: 16px;
	/*
	 * Align the label with the inline padding of the payment method's form
	 * fields below it. That padding differs between surfaces (24px in checkout,
	 * 12px in the Dashboard), so consumers can override this custom property to
	 * match their form.
	 */
	padding-inline: var( --checkout-single-payment-method-label-inline-padding, 24px );
	box-sizing: border-box;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
	justify-content: center;
	align-items: flex-start;
	font-size: 14px;
	min-height: 72px;

	@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 7px;
	}
`;

export default function CheckoutPaymentMethods( {
	summary,
	isComplete,
	className,
	onPageLoadError,
	waitForPaymentMethodIds = [],
}: {
	summary?: boolean;
	isComplete: boolean;
	className?: string;
	onPageLoadError?: CheckoutPageErrorCallback;
	waitForPaymentMethodIds?: string[];
} ) {
	const { __ } = useI18n();
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
	const arePaymentMethodsLoading = useArePaymentMethodsLoading( waitForPaymentMethodIds );

	if ( summary && isComplete && paymentMethod ) {
		debug( 'rendering selected paymentMethod', paymentMethod );
		return (
			<CheckoutPaymentMethodsWrapper
				className={ joinClasses( [ className, 'checkout-payment-methods' ] ) }
				isLoading={ false }
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
			isLoading={ arePaymentMethodsLoading }
		>
			{ arePaymentMethodsLoading && (
				<LoadingOverlay>
					<LoadingSpinner />
				</LoadingOverlay>
			) }
			<PaymentMethodsContainer isLoading={ arePaymentMethodsLoading }>
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
			</PaymentMethodsContainer>
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

	// When there is only a single available payment method and it is already
	// selected, there is nothing to choose between, so render it as a plain
	// container rather than an interactive radio button.
	if ( isSinglePaymentMethod && checked ) {
		return (
			<SinglePaymentMethodWrapper>
				<SinglePaymentMethodLabel>{ label }</SinglePaymentMethodLabel>
				{ activeContent && activeContent }
			</SinglePaymentMethodWrapper>
		);
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
