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

const debug = debugFactory( 'composite-checkout:bancontact-payment-method' );

export function createBancontactPaymentMethodStore() {
	debug( 'creating a new bancontact payment method store' );
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

	const store = registerStore( 'bancontact', {
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

export function createBancontactMethod( { store, stripe, stripeConfiguration } ) {
	return {
		id: 'bancontact',
		label: <BancontactLabel />,
		activeContent: (
			<BancontactFields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />
		),
		inactiveContent: <BancontactSummary />,
		submitButton: (
			<BancontactPayButton
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
			/>
		),
		getAriaLabel: ( __ ) => __( 'Bancontact' ),
	};
}

function BancontactFields() {
	const { __ } = useI18n();

	const customerName = useSelect( ( select ) => select( 'bancontact' ).getCustomerName() );
	const { changeCustomerName } = useDispatch( 'bancontact' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== 'ready';

	return (
		<BancontactFormWrapper>
			<BancontactField
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
		</BancontactFormWrapper>
	);
}

const BancontactFormWrapper = styled.div`
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

const BancontactField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function BancontactPayButton( { disabled, store, stripe, stripeConfiguration } ) {
	const { __ } = useI18n();
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const {
		setTransactionRedirecting,
		setTransactionError,
		setTransactionPending,
	} = useTransactionStatus();
	const submitTransaction = usePaymentProcessor( 'bancontact' );
	const onEvent = useEvents();
	const customerName = useSelect( ( select ) => select( 'bancontact' ).getCustomerName() );

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting bancontact payment' );
					setTransactionPending();
					onEvent( { type: 'BANCONTACT_TRANSACTION_BEGIN' } );
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
							debug( 'bancontact transaction requires redirect', stripeResponse.redirect_url );
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

function BancontactLabel() {
	return (
		<React.Fragment>
			<span>Bancontact</span>
			<PaymentMethodLogos className="bancontact__logo payment-logos">
				<BancontactLogoUI />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

const BancontactLogoUI = styled( BancontactLogo )`
	width: 123px;
`;

function BancontactLogo( { className } ) {
	return (
		<svg
			className={ className }
			enableBackground="new 0 0 476.9 123.4"
			viewBox="0 0 476.9 123.4"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="m477.1 103.6c0 10.9-8.9 19.8-19.8 19.8h-437.3c-10.9 0-19.8-8.9-19.8-19.8v-83.8c0-10.9 8.9-19.8 19.8-19.8h437.3c10.9 0 19.8 8.9 19.8 19.8z"
				fill="#fff"
			/>
			<path
				d="m147.6 50.2h-5.8-26.9-5.8l-3.9 4.4-12.7 14.3-3.9 4.4h-6-26.4-5.8l3.9-4.5 1.8-2.1 3.9-4.5h-5.8-7.6-4.2c-3.2 0-5.8 2.7-5.8 6v11.5 1.1c0 3.3 2.6 6 5.8 6h1.6 61.1 4.4c3.2 0 7.6-2 9.7-4.4l10.2-11.6z"
				fill="#005498"
			/>
			<path
				d="m155.3 36.8c3.2 0 5.8 2.7 5.8 6v12.6c0 3.3-2.6 6-5.8 6h-3.2-8.5-5.8l3.9-4.4 1.9-2.2 3.9-4.4h-38.6l-20.6 23.2h-38.3l27.5-31.1 1-1.2c2.2-2.4 6.5-4.4 9.7-4.4h1.4 65.7z"
				fill="#ffd800"
			/>
			<path
				d="m440.7 85.6v-3.8c0-.5-.3-.8-1-.8h-2.4c-.7 0-1.2-.1-1.3-.4-.2-.3-.2-.9-.2-1.9v-14h3.9c.3 0 .5-.1.7-.3s.3-.4.3-.7v-3.9c0-.3-.1-.5-.3-.7s-.4-.3-.7-.3h-3.9v-5c0-.3-.1-.5-.2-.6-.2-.1-.4-.2-.6-.2h-.1l-5.8 1c-.3.1-.5.2-.7.3-.2.2-.3.4-.3.6v3.9h-3.9c-.3 0-.5.1-.7.3s-.3.4-.3.7v3.2c0 .3.1.5.3.6.2.2.4.3.7.4l3.9.6v14c0 1.7.2 3.1.5 4.2.4 1.1.9 1.9 1.5 2.5.7.6 1.5 1 2.5 1.2s2.2.3 3.5.3c.7 0 1.3 0 1.9-.1.5-.1 1.2-.2 1.9-.3.5 0 .8-.3.8-.8m-20.8-.5v-4.3c0-.3-.1-.5-.3-.6s-.4-.2-.7-.2h-.1c-.9.1-1.8.2-2.6.2-.8.1-1.9.1-3.3.1-.5 0-1.1-.1-1.5-.3-.5-.2-.9-.5-1.3-.9s-.6-1-.8-1.7-.3-1.6-.3-2.7v-4c0-1.1.1-2 .3-2.7s.5-1.3.8-1.7c.4-.4.8-.7 1.3-.9s1-.3 1.5-.3c1.4 0 2.5 0 3.3.1s1.7.1 2.6.2h.1c.3 0 .5-.1.7-.2s.3-.3.3-.6v-4.3c0-.4-.1-.6-.2-.7-.2-.1-.4-.3-.8-.4-.7-.2-1.6-.3-2.6-.5-1.1-.2-2.3-.2-3.8-.2-3.4 0-6.1 1-8.2 3.1-2 2.1-3.1 5.1-3.1 9.1v4c0 3.9 1 7 3.1 9.1 2 2.1 4.8 3.1 8.2 3.1 1.4 0 2.7-.1 3.8-.2 1.1-.2 2-.3 2.6-.5.4-.1.6-.2.8-.4.1-.1.2-.4.2-.7m-31.3-5.1c-.6.3-1.2.5-1.9.7s-1.4.3-2.1.3c-1 0-1.8-.1-2.3-.4s-.7-.9-.7-2v-.4c0-.6.1-1.1.2-1.5s.4-.8.7-1.1.8-.5 1.3-.7c.5-.1 1.2-.2 2.1-.2h2.7zm7.6-11.7c0-1.8-.3-3.3-.8-4.5s-1.3-2.2-2.2-3c-1-.8-2.1-1.4-3.5-1.7-1.4-.4-3-.6-4.7-.6-1.6 0-3.2.1-4.7.3s-2.7.4-3.6.7c-.6.2-.9.5-.9 1.1v3.9c0 .3.1.5.2.7.2.1.4.2.6.2h.2c.4 0 .9-.1 1.4-.1.6 0 1.2-.1 2-.1.7 0 1.5-.1 2.3-.1s1.6 0 2.3 0c1.1 0 2 .2 2.6.6s1 1.3 1 2.7v1.7h-2.6c-4.1 0-7.2.6-9 1.9s-2.8 3.4-2.8 6.2v.4c0 1.6.2 2.9.7 3.9.5 1.1 1.1 1.9 1.9 2.6.8.6 1.6 1.1 2.6 1.4s2 .4 3.1.4c1.4 0 2.7-.2 3.7-.6s2-.9 3-1.6v.8c0 .3.1.5.3.7s.4.3.7.3h5.4c.3 0 .5-.1.7-.3s.3-.4.3-.7v-17.2zm-25.7 17.3v-3.8c0-.5-.3-.8-1-.8h-2.4c-.7 0-1.2-.1-1.3-.4-.2-.3-.2-.9-.2-1.9v-14h3.9c.3 0 .5-.1.7-.3s.3-.4.3-.7v-3.9c0-.3-.1-.5-.3-.7s-.4-.3-.7-.3h-3.9v-5c0-.3-.1-.5-.2-.6-.2-.1-.4-.2-.6-.2h-.1l-5.8 1c-.3.1-.5.2-.7.3-.2.2-.3.4-.3.6v3.9h-3.9c-.3 0-.5.1-.7.3s-.3.4-.3.7v3.2c0 .3.1.5.3.6.2.2.4.3.7.4l3.9.6v14c0 1.7.2 3.1.5 4.2.4 1.1.9 1.9 1.5 2.5.7.6 1.5 1 2.5 1.2s2.2.3 3.5.3c.7 0 1.3 0 1.9-.1.5-.1 1.2-.2 1.9-.3.5 0 .8-.3.8-.8m-21-.1v-16c0-1.5-.1-2.9-.4-4.3-.2-1.3-.7-2.5-1.3-3.5s-1.5-1.8-2.6-2.3c-1.1-.6-2.5-.9-4.3-.9-1.5 0-2.9.2-4.1.6s-2.4 1-3.8 2v-1.3c0-.3-.1-.5-.3-.7s-.4-.3-.7-.3h-5.4c-.3 0-.5.1-.7.3s-.3.4-.3.7v25.6c0 .3.1.5.3.7s.4.3.7.3h5.8c.3 0 .5-.1.7-.3s.3-.4.3-.7v-18.9c.8-.4 1.6-.8 2.4-1.1.7-.3 1.5-.4 2.2-.4s1.3.1 1.8.2.8.4 1.1.7c.3.4.4.8.5 1.4s.1 1.3.1 2.1v16c0 .3.1.5.3.7s.4.3.7.3h5.8c.3 0 .5-.1.7-.3.4-.2.5-.4.5-.6m-36.4-11.1c0 3.9-1.4 5.9-4.3 5.9-1.4 0-2.5-.5-3.2-1.5s-1.1-2.5-1.1-4.4v-3.4c0-2 .4-3.4 1.1-4.4s1.8-1.5 3.2-1.5c2.8 0 4.3 2 4.3 5.9zm7.8-3.4c0-1.9-.3-3.7-.8-5.2s-1.3-2.8-2.3-3.9-2.3-1.9-3.8-2.5-3.2-.9-5.2-.9-3.7.3-5.2.9-2.8 1.4-3.8 2.5-1.8 2.4-2.3 3.9-.8 3.3-.8 5.2v3.4c0 1.9.3 3.7.8 5.2s1.3 2.8 2.3 3.9 2.3 1.9 3.8 2.5 3.2.9 5.2.9 3.7-.3 5.2-.9 2.8-1.4 3.8-2.5 1.8-2.4 2.3-3.9.8-3.3.8-5.2zm-26.8 14.1v-4.3c0-.3-.1-.5-.3-.6s-.4-.2-.7-.2h-.1c-.9.1-1.8.2-2.6.2s-1.9.1-3.3.1c-.5 0-1.1-.1-1.5-.3-.5-.2-.9-.5-1.3-.9s-.6-1-.8-1.7-.3-1.6-.3-2.7v-4c0-1.1.1-2 .3-2.7s.5-1.3.8-1.7c.4-.4.8-.7 1.3-.9s1-.3 1.5-.3c1.4 0 2.5 0 3.3.1s1.7.1 2.6.2h.1c.3 0 .5-.1.7-.2s.3-.3.3-.6v-4.3c0-.4-.1-.6-.2-.7-.2-.1-.4-.3-.8-.4-.7-.2-1.5-.3-2.6-.5s-2.3-.2-3.8-.2c-3.4 0-6.1 1-8.2 3.1-2 2.1-3.1 5.1-3.1 9.1v4c0 3.9 1 7 3.1 9.1 2 2.1 4.8 3.1 8.2 3.1 1.4 0 2.7-.1 3.8-.2 1.1-.2 1.9-.3 2.6-.5.4-.1.6-.2.8-.4.1-.1.2-.4.2-.7m-23.7.4v-16c0-1.5-.1-2.9-.4-4.3s-.7-2.5-1.3-3.5-1.5-1.8-2.6-2.3c-1.1-.6-2.5-.9-4.3-.9-1.5 0-2.9.2-4.1.6s-2.4 1-3.8 2v-1.3c0-.3-.1-.5-.3-.7s-.4-.3-.7-.3h-5.4c-.3 0-.5.1-.7.3s-.3.4-.3.7v25.6c0 .3.1.5.3.7s.4.3.7.3h5.8c.3 0 .5-.1.7-.3s.3-.4.3-.7v-18.9c.8-.4 1.6-.8 2.4-1.1.7-.3 1.5-.4 2.2-.4s1.3.1 1.8.2.8.4 1.1.7c.3.4.4.8.5 1.4s.1 1.3.1 2.1v16c0 .3.1.5.3.7s.4.3.7.3h5.8c.3 0 .5-.1.7-.3.4-.2.5-.4.5-.6m-37.1-5.5c-.6.3-1.2.5-1.9.7s-1.4.3-2.1.3c-1 0-1.8-.1-2.3-.4s-.7-.9-.7-2v-.4c0-.6.1-1.1.2-1.5s.4-.8.7-1.1.8-.5 1.3-.7c.5-.1 1.2-.2 2.1-.2h2.7zm7.7-11.7c0-1.8-.3-3.3-.8-4.5s-1.3-2.2-2.2-3c-1-.8-2.1-1.4-3.5-1.7-1.4-.4-3-.6-4.7-.6-1.6 0-3.2.1-4.7.3s-2.7.4-3.6.7c-.6.2-.9.5-.9 1.1v3.9c0 .3.1.5.2.7.2.1.4.2.6.2h.2c.4 0 .9-.1 1.4-.1.6 0 1.2-.1 2-.1.7 0 1.5-.1 2.3-.1s1.6 0 2.3 0c1.1 0 2 .2 2.6.6s1 1.3 1 2.7v1.7h-2.6c-4.1 0-7.2.6-9 1.9s-2.8 3.4-2.8 6.2v.4c0 1.6.2 2.9.7 3.9.5 1.1 1.1 1.9 1.9 2.6.8.6 1.6 1.1 2.6 1.4s2 .4 3.1.4c1.4 0 2.7-.2 3.7-.6s2-.9 3-1.6v.8c0 .3.1.5.3.7s.4.3.7.3h5.4c.3 0 .5-.1.7-.3s.3-.4.3-.7v-17.2zm-34.4 7.6c0 1.3-.5 2.4-1.4 3.1s-2.7 1.1-5.1 1.1h-.8c-.4 0-.8 0-1.2 0s-.8 0-1.2 0h-.8v-9h5.4c1.9 0 3.3.4 4 1.3s1.1 1.9 1.1 3zm-.2-14.3c0 .5-.1 1-.2 1.5-.2.5-.4.9-.8 1.2s-.9.6-1.5.8-1.4.3-2.4.3h-5.4v-8.3h.7 1.1 1.1.8c2.5 0 4.2.3 5.2.9s1.5 1.6 1.5 2.9v.7zm8.2 13.8c0-1.7-.4-3.1-1.2-4.3s-1.8-2.2-3.1-2.8c1.3-.6 2.3-1.6 3-2.8.7-1.3 1.1-2.7 1.1-4.2v-.9c0-1.9-.4-3.5-1.1-4.8s-1.8-2.3-3.1-3.1-2.9-1.3-4.8-1.7c-1.9-.3-3.9-.5-6.2-.5-.8 0-1.6 0-2.4 0s-1.6.1-2.4.1-1.5.1-2.2.2-1.2.1-1.6.2c-.9.2-1.6.5-2 .9s-.6 1.2-.6 2.3v29.3c0 1.1.2 1.8.6 2.3.4.4 1.1.7 2 .9.5.1 1.1.2 1.7.2.7.1 1.4.1 2.2.2.8 0 1.6.1 2.4.1s1.7 0 2.5 0c2.1 0 4.1-.2 5.9-.5s3.4-.9 4.8-1.7 2.4-1.9 3.3-3.3c.8-1.4 1.2-3.2 1.2-5.3z"
				fill="#005498"
			/>
		</svg>
	);
}

function BancontactSummary() {
	const customerName = useSelect( ( select ) => select( 'bancontact' ).getCustomerName() );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}
