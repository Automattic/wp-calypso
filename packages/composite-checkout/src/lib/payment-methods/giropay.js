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

const debug = debugFactory( 'composite-checkout:giropay-payment-method' );

export function createGiropayPaymentMethodStore() {
	debug( 'creating a new giropay payment method store' );
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

	const store = registerStore( 'giropay', {
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

export function createGiropayMethod( { store, stripe, stripeConfiguration } ) {
	return {
		id: 'giropay',
		label: <GiropayLabel />,
		activeContent: <GiropayFields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />,
		inactiveContent: <GiropaySummary />,
		submitButton: (
			<GiropayPayButton
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
			/>
		),
		getAriaLabel: ( __ ) => __( 'Giropay' ),
	};
}

function GiropayFields() {
	const { __ } = useI18n();

	const customerName = useSelect( ( select ) => select( 'giropay' ).getCustomerName() );
	const { changeCustomerName } = useDispatch( 'giropay' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== 'ready';

	return (
		<GiropayFormWrapper>
			<GiropayField
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
		</GiropayFormWrapper>
	);
}

const GiropayFormWrapper = styled.div`
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

const GiropayField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function GiropayPayButton( { disabled, store, stripe, stripeConfiguration } ) {
	const { __ } = useI18n();
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const {
		setTransactionRedirecting,
		setTransactionError,
		setTransactionPending,
	} = useTransactionStatus();
	const submitTransaction = usePaymentProcessor( 'giropay' );
	const onEvent = useEvents();
	const customerName = useSelect( ( select ) => select( 'giropay' ).getCustomerName() );

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting giropay payment' );
					setTransactionPending();
					onEvent( {
						type: 'REDIRECT_TRANSACTION_BEGIN',
						payload: { paymentMethodId: 'giropay' },
					} );
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
							debug( 'giropay transaction requires redirect', stripeResponse.redirect_url );
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

function GiropayLabel() {
	return (
		<React.Fragment>
			<span>Giropay</span>
			<PaymentMethodLogos className="giropay__logo payment-logos">
				<GiropayLogo />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

function GiropayLogo() {
	return (
		<svg width="38" height="16" viewBox="0 0 38 16" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g clipPath="url(#clip0)">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M0 2.87078C0 1.28541 1.31941 0 2.94613 0H35.0539C36.6813 0 38 1.28541 38 2.87078V13.1299C38 14.7144 36.6813 16 35.0539 16H2.94613C1.31941 16 0 14.7144 0 13.1299V2.87078Z"
					fill="#000268"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M1.18396 2.96901V13.0326C1.18396 14.0231 1.99147 14.8265 2.98755 14.8265H19.4583V1.17514H2.98755C1.99147 1.17514 1.18396 1.97848 1.18396 2.96901ZM23.7141 7.95055C23.7141 8.59128 23.3972 9.03164 22.8725 9.03164C22.409 9.03164 22.0226 8.59128 22.0226 8.00451C22.0226 7.40224 22.3624 6.95447 22.8725 6.95447C23.4134 6.95447 23.7141 7.41776 23.7141 7.95055ZM20.6334 11.6254H22.0226V9.44025H22.0381C22.3013 9.91907 22.8266 10.0965 23.3129 10.0965C24.5093 10.0965 25.15 9.10854 25.15 7.9195C25.15 6.94706 24.5404 5.88866 23.4282 5.88866C22.7956 5.88866 22.2088 6.14372 21.9302 6.70753H21.9146V5.98203H20.6334V11.6254ZM27.0474 8.73003C27.0474 8.34434 27.4176 8.19817 27.8892 8.19817C28.0975 8.19817 28.2986 8.21277 28.476 8.22111C28.476 8.69181 28.1441 9.17062 27.6187 9.17062C27.2944 9.17062 27.0474 9.0087 27.0474 8.73003ZM29.8497 10.0041C29.7883 9.68789 29.7728 9.37076 29.7728 9.05457V7.55674C29.7728 6.32926 28.8853 5.88866 27.8582 5.88866C27.264 5.88866 26.7468 5.97368 26.2524 6.17475L26.2761 7.11708C26.6608 6.90049 27.1095 6.81548 27.5573 6.81548C28.0583 6.81548 28.4677 6.96258 28.476 7.51089C28.2986 7.47984 28.0509 7.45621 27.8272 7.45621C27.0866 7.45621 25.7507 7.60331 25.7507 8.83057C25.7507 9.70341 26.4607 10.0965 27.2559 10.0965C27.8272 10.0965 28.2135 9.87344 28.53 9.37076H28.5455C28.5455 9.57994 28.5682 9.78749 28.5765 10.0041H29.8497ZM30.4749 11.6254C30.7607 11.6875 31.0461 11.7187 31.3394 11.7187C32.6134 11.7187 32.9141 10.7379 33.3079 9.72633L34.783 5.98203H33.3929L32.5669 8.6068H32.5513L31.6866 5.98203H30.1895L31.8182 10.0965C31.7176 10.4519 31.4554 10.6529 31.1154 10.6529C30.9217 10.6529 30.7526 10.6293 30.5671 10.5679L30.4749 11.6254Z"
					fill="white"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M4.5778 7.95866C4.5778 7.41036 4.84836 6.95447 5.36562 6.95447C5.99084 6.95447 6.25307 7.45621 6.25307 7.90398C6.25307 8.52179 5.85926 8.93852 5.36562 8.93852C4.94889 8.93852 4.5778 8.58387 4.5778 7.95866ZM7.5966 5.98203H6.33808V6.70753H6.32348C6.02928 6.21321 5.55024 5.88867 4.9563 5.88867C3.70587 5.88867 3.14206 6.78513 3.14206 7.98158C3.14206 9.17062 3.82934 10.0041 4.93245 10.0041C5.48909 10.0041 5.95238 9.78749 6.2841 9.3168H6.29962V9.53338C6.29962 10.3205 5.86737 10.6988 5.06495 10.6988C4.4856 10.6988 4.13003 10.5753 3.70587 10.3671L3.63639 11.4637C3.96 11.5797 4.50831 11.7187 5.1729 11.7187C6.79418 11.7187 7.5966 11.1857 7.5966 9.53338V5.98203ZM9.94525 4.30676H8.55538V5.32578H9.94525V4.30676ZM8.55608 10.0041H9.94525V5.98203H8.55608V10.0041ZM13.8147 5.93524C13.6757 5.91253 13.5057 5.88867 13.344 5.88867C12.7417 5.88867 12.3945 6.21321 12.1549 6.72306H12.1394V5.98203H10.8735V10.0041H12.2629V8.30612C12.2629 7.5183 12.6263 7.0476 13.2745 7.0476C13.4371 7.0476 13.5907 7.0476 13.7452 7.09323L13.8147 5.93524ZM16.2074 9.12407C15.5666 9.12407 15.3044 8.59128 15.3044 7.99711C15.3044 7.39483 15.5666 6.86205 16.2074 6.86205C16.8488 6.86205 17.1112 7.39483 17.1112 7.99711C17.1112 8.59128 16.8488 9.12407 16.2074 9.12407ZM16.2074 10.0965C17.5354 10.0965 18.547 9.32514 18.547 7.99711C18.547 6.66098 17.5354 5.88867 16.2074 5.88867C14.8796 5.88867 13.8687 6.66098 13.8687 7.99711C13.8687 9.32514 14.8796 10.0965 16.2074 10.0965Z"
					fill="#FF0007"
				/>
			</g>
			<defs>
				<clipPath id="clip0">
					<rect width="38" height="16" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
}

function GiropaySummary() {
	const customerName = useSelect( ( select ) => select( 'giropay' ).getCustomerName() );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}
