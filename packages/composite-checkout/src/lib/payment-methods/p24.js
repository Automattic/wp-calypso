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

const debug = debugFactory( 'composite-checkout:p24-payment-method' );

export function createP24PaymentMethodStore() {
	debug( 'creating a new p24 payment method store' );
	const actions = {
		changeCustomerName( payload ) {
			return { type: 'CUSTOMER_NAME_SET', payload };
		},
		changeCustomerEmail( payload ) {
			return { type: 'CUSTOMER_EMAIL_SET', payload };
		},
	};

	const selectors = {
		getCustomerName( state ) {
			return state.customerName || '';
		},
		getCustomerEmail( state ) {
			return state.customerEmail || '';
		},
	};

	const store = registerStore( 'p24', {
		reducer(
			state = {
				customerName: { value: '', isTouched: false },
				customerEmail: { value: '', isTouched: false },
			},
			action
		) {
			switch ( action.type ) {
				case 'CUSTOMER_NAME_SET':
					return { ...state, customerName: { value: action.payload, isTouched: true } };
				case 'CUSTOMER_EMAIL_SET':
					return { ...state, customerEmail: { value: action.payload, isTouched: true } };
			}
			return state;
		},
		actions,
		selectors,
	} );

	return { ...store, actions, selectors };
}

export function createP24Method( { store, stripe, stripeConfiguration } ) {
	return {
		id: 'p24',
		label: <P24Label />,
		activeContent: <P24Fields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />,
		inactiveContent: <P24Summary />,
		submitButton: (
			<P24PayButton store={ store } stripe={ stripe } stripeConfiguration={ stripeConfiguration } />
		),
		getAriaLabel: ( __ ) => __( 'P24' ),
	};
}

function P24Fields() {
	const { __ } = useI18n();

	const customerName = useSelect( ( select ) => select( 'p24' ).getCustomerName() );
	const customerEmail = useSelect( ( select ) => select( 'p24' ).getCustomerEmail() );
	const { changeCustomerName, changeCustomerEmail } = useDispatch( 'p24' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== 'ready';

	return (
		<P24FormWrapper>
			<P24Field
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
			<P24Field
				id="cardholderEmail"
				type="Text"
				autoComplete="cc-email"
				label={ __( 'Email address' ) }
				value={ customerEmail?.value ?? '' }
				onChange={ changeCustomerEmail }
				isError={ customerEmail?.isTouched && customerEmail?.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
		</P24FormWrapper>
	);
}

const P24FormWrapper = styled.div`
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

const P24Field = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function P24PayButton( { disabled, store, stripe, stripeConfiguration } ) {
	const { __ } = useI18n();
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const {
		setTransactionRedirecting,
		setTransactionError,
		setTransactionPending,
	} = useTransactionStatus();
	const submitTransaction = usePaymentProcessor( 'p24' );
	const onEvent = useEvents();
	const customerName = useSelect( ( select ) => select( 'p24' ).getCustomerName() );
	const customerEmail = useSelect( ( select ) => select( 'p24' ).getCustomerEmail() );

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting p24 payment' );
					setTransactionPending();
					onEvent( {
						type: 'REDIRECT_TRANSACTION_BEGIN',
						payload: { paymentMethodId: 'p24' },
					} );
					submitTransaction( {
						stripe,
						name: customerName?.value,
						email: customerEmail?.value,
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
							debug( 'p24 transaction requires redirect', stripeResponse.redirect_url );
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
	const customerEmail = store.selectors.getCustomerEmail( store.getState() );

	if ( ! customerName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( store.actions.changeCustomerName( '' ) );
	}
	if ( ! customerEmail?.value.length ) {
		store.dispatch( store.actions.changeCustomerEmail( '' ) );
	}
	if ( ! customerName?.value.length || ! customerEmail?.value.length ) {
		return false;
	}
	return true;
}

function P24Label() {
	return (
		<React.Fragment>
			<span>P24</span>
			<PaymentMethodLogos className="p24__logo payment-logos">
				<P24LogoUI />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

const P24LogoUI = styled( P24Logo )`
	width: 64px;
	margin: -10px 0;
`;

function P24Logo( { className } ) {
	return <img src="/calypso/images/upgrades/p24.svg" alt="P24" className={ className } />;
}

function P24Summary() {
	const customerName = useSelect( ( select ) => select( 'p24' ).getCustomerName() );
	const customerEmail = useSelect( ( select ) => select( 'p24' ).getCustomerEmail() );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
			<SummaryLine>{ customerEmail?.value }</SummaryLine>
		</SummaryDetails>
	);
}
