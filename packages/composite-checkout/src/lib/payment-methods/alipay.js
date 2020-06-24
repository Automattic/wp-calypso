/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import debugFactory from 'debug';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import Field from '../../components/field';
import Button from '../../components/button';
import {
	usePaymentProcessor,
	useTransactionStatus,
	useLineItems,
	renderDisplayValueMarkdown,
	useEvents,
} from '../../public-api';
import { useFormStatus } from '../form-status';
import { SummaryLine, SummaryDetails } from '../styled-components/summary-details';
import { registerStore, useSelect, useDispatch } from '../../lib/registry';
import { PaymentMethodLogos } from '../styled-components/payment-method-logos';

const debug = debugFactory( 'composite-checkout:alipay-payment-method' );

export function createAlipayPaymentMethodStore() {
	debug( 'creating a new alipay payment method store' );
	const actions = {
		changeCustomerName( payload ) {
			return { type: 'CUSTOMER_NAME_SET', payload };
		},
	};

	const selectors = {
		getCustomerName( state ) {
			return state.customerName || '';
		},
	};

	const store = registerStore( 'alipay', {
		reducer(
			state = {
				customerName: { value: '', isTouched: false },
			},
			action
		) {
			switch ( action.type ) {
				case 'CUSTOMER_NAME_SET':
					return { ...state, customerName: { value: action.payload, isTouched: true } };
			}
			return state;
		},
		actions,
		selectors,
	} );

	return { ...store, actions, selectors };
}

export function createAlipayMethod( { store, stripe, stripeConfiguration } ) {
	return {
		id: 'alipay',
		label: <AlipayLabel />,
		activeContent: <AlipayFields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />,
		inactiveContent: <AlipaySummary />,
		submitButton: (
			<AlipayPayButton
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
			/>
		),
		getAriaLabel: ( __ ) => __( 'Alipay' ),
	};
}

function AlipayFields() {
	const { __ } = useI18n();

	const customerName = useSelect( ( select ) => select( 'alipay' ).getCustomerName() );
	const { changeCustomerName } = useDispatch( 'alipay' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== 'ready';

	return (
		<AlipayFormWrapper>
			<AlipayField
				id="cardholderName"
				type="Text"
				autoComplete="cc-name"
				label={ __( 'Your name' ) }
				value={ customerName?.value ?? '' }
				onChange={ changeCustomerName }
				isError={ customerName?.isTouched && customerName?.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
		</AlipayFormWrapper>
	);
}

const AlipayFormWrapper = styled.div`
	padding: 16px;
	position: relative;

	:after {
		display: block;
		width: calc( 100% - 6px );
		height: 1px;
		content: '';
		background: ${ ( props ) => props.theme.colors.borderColorLight };
		position: absolute;
		top: 0;
		left: 3px;
	}
`;

const AlipayField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function AlipayPayButton( { disabled, store, stripe, stripeConfiguration } ) {
	const { __ } = useI18n();
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const {
		setTransactionRedirecting,
		setTransactionError,
		setTransactionPending,
	} = useTransactionStatus();
	const submitTransaction = usePaymentProcessor( 'alipay' );
	const onEvent = useEvents();
	const customerName = useSelect( ( select ) => select( 'alipay' ).getCustomerName() );

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting alipay payment' );
					setTransactionPending();
					onEvent( { type: 'REDIRECT_TRANSACTION_BEGIN', payload: { paymentMethodId: 'alipay' } } );
					submitTransaction( {
						stripe,
						name: customerName?.value,
						items,
						total,
						stripeConfiguration,
					} )
						.then( ( stripeResponse ) => {
							if ( ! stripeResponse?.redirect_url ) {
								setTransactionError(
									__(
										'There was an error processing your payment. Please try again or contact support.'
									)
								);
								return;
							}
							debug( 'alipay transaction requires redirect', stripeResponse.redirect_url );
							setTransactionRedirecting( stripeResponse.redirect_url );
						} )
						.catch( ( error ) => {
							setTransactionError( error.message );
						} );
				}
			} }
			buttonType="primary"
			isBusy={ 'submitting' === formStatus }
			fullWidth
		>
			<ButtonContents formStatus={ formStatus } total={ total } />
		</Button>
	);
}

function ButtonContents( { formStatus, total } ) {
	const { __ } = useI18n();
	if ( formStatus === 'submitting' ) {
		return __( 'Processing…' );
	}
	if ( formStatus === 'ready' ) {
		return sprintf( __( 'Pay %s' ), renderDisplayValueMarkdown( total.amount.displayValue ) );
	}
	return __( 'Please wait…' );
}

function isFormValid( store ) {
	const customerName = store.selectors.getCustomerName( store.getState() );

	if ( ! customerName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( store.actions.changeCustomerName( '' ) );
		return false;
	}
	return true;
}

function AlipayLabel() {
	return (
		<React.Fragment>
			<span>Alipay</span>
			<PaymentMethodLogos className="alipay__logo payment-logos">
				<AlipayLogoUI />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

const AlipayLogoUI = styled( AlipayLogo )`
	width: 100px;
	height: 24px;
`;

function AlipayLogo( { className } ) {
	return <img src="/calypso/images/upgrades/alipay.svg" alt="Alipay" className={ className } />;
}

function AlipaySummary() {
	const customerName = useSelect( ( select ) => select( 'alipay' ).getCustomerName() );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}
