/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import debugFactory from 'debug';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import {
	Button,
	usePaymentProcessor,
	useTransactionStatus,
	useLineItems,
	renderDisplayValueMarkdown,
	useEvents,
	useFormStatus,
	registerStore,
	useSelect,
	useDispatch,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { PaymentMethodLogos } from 'my-sites/checkout/composite-checkout/wpcom/components/payment-method-logos';
import Field from 'my-sites/checkout/composite-checkout/wpcom/components/field';
import {
	SummaryLine,
	SummaryDetails,
} from 'my-sites/checkout/composite-checkout/wpcom/components/summary-details';
import WeChatPaymentQRcode from 'my-sites/checkout/checkout/wechat-payment-qrcode';
import { useCart } from 'my-sites/checkout/composite-checkout/cart-provider';
import userAgent from 'lib/user-agent';

const debug = debugFactory( 'calypso:composite-checkout:wechat-payment-method' );

export function createWeChatPaymentMethodStore() {
	debug( 'creating a new wechat payment method store' );
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

	const store = registerStore( 'wechat', {
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

export function createWeChatMethod( { store, stripe, stripeConfiguration, siteSlug } ) {
	return {
		id: 'wechat',
		label: <WeChatLabel />,
		activeContent: <WeChatFields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />,
		submitButton: (
			<WeChatPayButton
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
				siteSlug={ siteSlug }
			/>
		),
		inactiveContent: <WeChatSummary />,
		getAriaLabel: () => 'WeChat Pay',
	};
}

function WeChatFields() {
	const { __ } = useI18n();

	const customerName = useSelect( ( select ) => select( 'wechat' ).getCustomerName() );
	const { changeCustomerName } = useDispatch( 'wechat' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== 'ready';

	return (
		<WeChatFormWrapper>
			<WeChatField
				id="cardholderName"
				type="Text"
				autoComplete="cc-name"
				label={ __( 'Your name' ) }
				value={ customerName?.value ?? '' }
				onChange={ changeCustomerName }
				isError={ customerName?.isTouched && customerName?.value.length < 3 }
				errorMessage={ __( 'Your name must contain at least 3 characters' ) }
				disabled={ isDisabled }
			/>
		</WeChatFormWrapper>
	);
}

const WeChatFormWrapper = styled.div`
	padding: 16px;
	position: relative;

	::after {
		display: block;
		width: calc( 100% - 6px );
		height: 1px;
		content: '';
		background: ${ ( props ) => props.theme.colors.borderColorLight };
		position: absolute;
		top: 0;
		left: 3px;

		.rtl & {
			right: 3px;
			left: auto;
		}
	}
`;

const WeChatField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function WeChatPayButton( { disabled, store, stripe, stripeConfiguration, siteSlug } ) {
	const { __ } = useI18n();
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const {
		setTransactionRedirecting,
		setTransactionAuthorizing,
		setTransactionError,
		setTransactionPending,
		transactionStatus,
		transactionLastResponse,
		resetTransaction,
	} = useTransactionStatus();
	const submitTransaction = usePaymentProcessor( 'wechat' );
	const onEvent = useEvents();
	const customerName = useSelect( ( select ) => select( 'wechat' ).getCustomerName() );
	const cart = useCart();

	useScrollQRCodeIntoView( transactionStatus === 'authorizing' );

	if ( transactionStatus === 'authorizing' ) {
		return (
			<WeChatPaymentQRcodeUI
				orderId={ transactionLastResponse.order_id }
				cart={ cart }
				redirectUrl={ transactionLastResponse.redirect_url }
				slug={ siteSlug }
				reset={ resetTransaction }
			/>
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting wechat payment' );
					setTransactionPending();
					onEvent( { type: 'REDIRECT_TRANSACTION_BEGIN', payload: { paymentMethodId: 'wechat' } } );
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
							debug( 'wechat transaction requires redirect', stripeResponse.redirect_url );
							// The WeChat payment type should only redirect when on mobile as redirect urls
							// are mobile app urls: e.g. weixin://wxpay/bizpayurl?pr=RaXzhu4
							if ( userAgent.isMobile ) {
								setTransactionRedirecting( stripeResponse.redirect_url );
								return;
							}

							// For desktop, display the QR code
							setTransactionAuthorizing( stripeResponse );
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

const WeChatPaymentQRcodeUI = styled( WeChatPaymentQRcode )`
	background-color: #fff;
	margin: -24px;
	padding: 24px;

	& .checkout__wechat-qrcode {
		text-align: center;
		margin-bottom: 12px;
	}

	& .checkout__wechat-qrcode-redirect {
		color: var( --color-text-subtle );
		border-top: 1px solid var( --color-neutral-10 );
		border-bottom: 1px solid var( --color-neutral-10 );
		font-size: small;
		margin: 12px;
		padding: 15px 0;
	}
`;

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

function WeChatSummary() {
	const customerName = useSelect( ( select ) => select( 'wechat' ).getCustomerName() );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}

function isFormValid( store ) {
	const customerName = store.selectors.getCustomerName( store.getState() );

	if ( ! customerName?.value.length || customerName?.value.length < 3 ) {
		// Touch the field so it displays a validation error
		store.dispatch( store.actions.changeCustomerName( '' ) );
		return false;
	}
	return true;
}

function WeChatLabel() {
	return (
		<React.Fragment>
			<span>WeChat Pay</span>
			<PaymentMethodLogos className="wechat__logo payment-logos">
				<WeChatLogo />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

function WeChatLogo() {
	return (
		<svg height="28" viewBox="0 0 150 150" width="28" xmlns="http://www.w3.org/2000/svg">
			<path
				d="m55 92.780547a4.9681182 4.9681182 0 0 1 -6.458554-1.968848l-.331207-.699216-13.432321-29.311894a2.4472583 2.4472583 0 0 1 3.864093-2.796867l15.732371 11.205867a7.249772 7.249772 0 0 0 6.348153.791218l74.006545-32.955184c-13.28511-15.62197-35.089628-25.926215-59.783007-25.926215-40.480962 0-73.1969389 27.324648-73.1969389 61.015851 0 18.400434 9.9362349 34.960831 25.2822019 46.111501a4.9681182 4.9681182 0 0 1 2.060846 3.97449 5.8145381 5.8145381 0 0 1 -.239205 1.56405l-3.312078 12.45708a7.1761707 7.1761707 0 0 0 -.404809 1.84006 2.484059 2.484059 0 0 0 2.465658 2.46564 2.7600657 2.7600657 0 0 0 1.416832-.44161l16.026783-9.20022a7.6729824 7.6729824 0 0 1 3.882494-1.12242 7.4521771 7.4521771 0 0 1 2.152849.3312 86.592457 86.592457 0 0 0 23.920568 3.3489c40.480966 0 73.196966-27.32467 73.196966-61.015867a52.809254 52.809254 0 0 0 -8.35383-28.299872l-84.329196 48.35635z"
				fill="#00c800"
				strokeWidth="1.840044"
			/>
		</svg>
	);
}

function useScrollQRCodeIntoView( shouldScroll ) {
	useEffect( () => {
		if ( shouldScroll && typeof window === 'object' ) {
			window.document.querySelector( '.checkout__wechat-qrcode' )?.scrollIntoView?.();
		}
	}, [ shouldScroll ] );
}
