/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import debugFactory from 'debug';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import {
	Button,
	FormStatus,
	useLineItems,
	useEvents,
	useFormStatus,
	useTransactionStatus,
	registerStore,
	useSelect,
	useDispatch,
	PaymentProcessorResponseType,
} from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { PaymentMethodLogos } from 'calypso/my-sites/checkout/composite-checkout/components/payment-method-logos';
import Field from 'calypso/my-sites/checkout/composite-checkout/components/field';
import {
	SummaryLine,
	SummaryDetails,
} from 'calypso/my-sites/checkout/composite-checkout/components/summary-details';
import WeChatPaymentQRcodeUnstyled from './wechat-payment-qrcode';

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
	const isDisabled = formStatus !== FormStatus.READY;

	return (
		<WeChatFormWrapper>
			<WeChatField
				id="wechat-cardholder-name"
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

function WeChatPayButton( { disabled, onClick, store, stripe, stripeConfiguration, siteSlug } ) {
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const { resetTransaction } = useTransactionStatus();
	const onEvent = useEvents();
	const customerName = useSelect( ( select ) => select( 'wechat' ).getCustomerName() );
	const { responseCart: cart } = useShoppingCart();
	const [ stripeResponseWithCode, setStripeResponseWithCode ] = useState( null );

	useScrollQRCodeIntoView( !! stripeResponseWithCode );

	if ( stripeResponseWithCode ) {
		return (
			<WeChatPaymentQRcode
				orderId={ stripeResponseWithCode.order_id }
				cart={ cart }
				redirectUrl={ stripeResponseWithCode.redirect_url }
				slug={ siteSlug }
				reset={ () => {
					resetTransaction();
					setStripeResponseWithCode( null );
				} }
			/>
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting wechat payment' );
					onEvent( { type: 'REDIRECT_TRANSACTION_BEGIN', payload: { paymentMethodId: 'wechat' } } );
					onClick( 'wechat', {
						stripe,
						name: customerName?.value,
						items,
						total,
						stripeConfiguration,
					} ).then( ( processorResponse ) => {
						if ( processorResponse?.type === PaymentProcessorResponseType.MANUAL ) {
							setStripeResponseWithCode( processorResponse.payload );
						}
					} );
				}
			} }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			<ButtonContents formStatus={ formStatus } total={ total } />
		</Button>
	);
}

const WeChatPaymentQRcode = styled( WeChatPaymentQRcodeUnstyled )`
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
	if ( formStatus === FormStatus.SUBMITTING ) {
		return __( 'Processing…' );
	}
	if ( formStatus === FormStatus.READY ) {
		return sprintf( __( 'Pay %s' ), total.amount.displayValue );
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
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M5.86667 9.89656C5.7465 9.95479 5.60878 9.9655 5.48105 9.92657C5.35333 9.88763 5.24501 9.80191 5.17776 9.68655L5.14243 9.61196L3.70965 6.48536C3.68662 6.43097 3.68271 6.37038 3.69857 6.31348C3.71443 6.25658 3.74912 6.20675 3.79697 6.17211C3.84482 6.13748 3.90299 6.1201 3.962 6.12281C4.021 6.12552 4.07734 6.14816 4.12182 6.18703L5.79994 7.38232C5.89883 7.44725 6.0113 7.48862 6.12869 7.50325C6.24608 7.51788 6.36527 7.50538 6.47707 7.46672L14.3711 3.9515C12.954 2.28515 10.6282 1.18604 7.99425 1.18604C3.67628 1.18604 0.186577 4.10066 0.186577 7.69439C0.186577 9.65711 1.24644 11.4235 2.88335 12.613C2.95061 12.6615 3.00554 12.7251 3.04372 12.7988C3.0819 12.8724 3.10226 12.954 3.10317 13.0369C3.10231 13.0934 3.09372 13.1495 3.07765 13.2037L2.72437 14.5325C2.70141 14.5957 2.68689 14.6617 2.68119 14.7288C2.6817 14.7984 2.70957 14.8649 2.75879 14.9142C2.808 14.9634 2.8746 14.9912 2.94419 14.9918C2.99792 14.9902 3.05019 14.9739 3.09532 14.9447L4.80484 13.9633C4.92971 13.8871 5.07271 13.8458 5.21897 13.8436C5.29684 13.844 5.37421 13.8559 5.44861 13.8789C6.27826 14.1166 7.13712 14.2368 8.00014 14.2361C12.3181 14.2361 15.8078 11.3215 15.8078 7.72776C15.8036 6.65731 15.4946 5.61022 14.9167 4.70911L5.92163 9.86712L5.86667 9.89656Z"
				fill="#00C800"
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
