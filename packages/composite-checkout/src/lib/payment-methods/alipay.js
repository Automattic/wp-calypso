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
import { FormStatus, useLineItems } from '../../public-api';
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
	const isDisabled = formStatus !== FormStatus.READY;

	return (
		<AlipayFormWrapper>
			<AlipayField
				id="alipay-cardholder-name"
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

const AlipayField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function AlipayPayButton( { disabled, onClick, store, stripe, stripeConfiguration } ) {
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const customerName = useSelect( ( select ) => select( 'alipay' ).getCustomerName() );

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting alipay payment' );
					onClick( 'alipay', {
						stripe,
						name: customerName?.value,
						items,
						total,
						stripeConfiguration,
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
				<AlipayLogo />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

function AlipayLogo() {
	return (
		<svg width="58" height="16" viewBox="0 0 58 16" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g clipPath="url(#alipay-logo-clip)">
				<path
					d="M33.3289 4.27654C33.9371 4.27654 34.4302 3.83697 34.4302 3.29473C34.4302 2.7525 33.9371 2.31293 33.3289 2.31293C32.7207 2.31293 32.2276 2.7525 32.2276 3.29473C32.2276 3.83697 32.7207 4.27654 33.3289 4.27654Z"
					fill="#009FE3"
				/>
				<path
					d="M28.5108 3.38902V11.8756H30.5604V2.91229H28.9875C28.7242 2.91229 28.5108 3.12575 28.5108 3.38902V3.38902Z"
					fill="#3D3A39"
				/>
				<path
					d="M32.304 5.77519V11.8757H34.3537V5.29846H32.7808C32.5175 5.29846 32.304 5.51187 32.304 5.77519Z"
					fill="#3D3A39"
				/>
				<path
					d="M39.9061 5.14545C38.9724 5.14545 38.3153 5.62902 38.0248 5.8939V5.29837H36.4519C36.1885 5.29837 35.9751 5.51183 35.9751 5.7751V14.5064H38.0248V11.6103C38.3358 11.8457 38.7567 12.0132 39.3249 12.0132C41.2369 12.0132 42.7053 10.3613 42.7053 8.28099C42.7053 6.20083 41.191 5.14545 39.9061 5.14545V5.14545ZM39.2331 11.3096C38.8125 11.3096 38.367 10.912 38.0248 10.5143V6.98762C38.3439 6.67066 38.8862 6.21614 39.3555 6.21614C40.0591 6.21614 40.7168 7.17978 40.7168 8.587C40.7168 9.99422 40.0744 11.3096 39.2331 11.3096Z"
					fill="#3D3A39"
				/>
				<path
					d="M46.6057 5.14545C44.8007 5.14545 44.2042 5.52784 44.2042 5.52784L44.4184 5.98673C44.4184 5.98673 45.0914 5.742 46.1927 5.742C47.4164 5.742 47.5388 6.39974 47.5388 7.2104V7.58854C47.2767 7.51151 46.7747 7.39394 46.1468 7.39394C45.2138 7.39394 43.5618 7.76103 43.5618 9.67301C43.5618 11.585 45.0303 12.0132 45.9939 12.0132C46.5579 12.0132 47.1463 11.7204 47.5388 11.477V11.8756H49.5885V7.21035C49.5885 5.83375 48.4106 5.14545 46.6057 5.14545V5.14545ZM46.4833 11.1414C45.6267 11.1414 45.0914 10.6366 45.0914 9.70357C45.0914 8.77054 46.0397 8.1893 46.7892 8.1893C47.1666 8.1893 47.3996 8.30929 47.5387 8.42847V10.7094C47.2974 10.919 46.9368 11.1414 46.4833 11.1414V11.1414Z"
					fill="#3D3A39"
				/>
				<path
					d="M57.7217 5.14548H56.3462L54.5009 9.34816L54.45 9.24903L52.3465 5.14484H50.2467L53.4551 11.4057L53.5318 11.5552L53.196 12.3201C52.6781 13.3478 51.1944 13.279 51.1944 13.279V14.1394C51.1944 14.1394 51.833 14.1929 52.2957 14.1394C52.7362 14.0884 53.7177 13.7954 54.1948 12.7823H54.1949L55.175 10.6605V10.6602L57.7219 5.14548H57.7217Z"
					fill="#3D3A39"
				/>
				<path
					d="M23.4448 2.9129H22.5748L21.8681 4.38313L18.263 11.8756H19.6485L20.3622 10.3919H24.6556L25.3443 11.8756H27.605L23.698 3.45803L23.4448 2.9129ZM24.3645 9.7648H20.6639L22.5472 5.8497L24.3645 9.7648Z"
					fill="#3D3A39"
				/>
				<path
					d="M16.0018 2.50912V13.5166C15.9872 14.8914 14.8693 16 13.4927 16H2.50912C1.12331 16 0 14.8767 0 13.4909V2.50912C0 1.12331 1.12331 0 2.50912 0H13.4927C14.8785 0 16.0018 1.12331 16.0018 2.50912V2.50912Z"
					fill="#009FE3"
				/>
				<path
					d="M10.6936 8.99393C11.5159 7.4154 12.061 5.7488 12.061 5.7488H8.88748V4.63099H12.7989V3.95002H8.88748V2.15125H7.06665V3.95002H3.15522V4.63099H7.06665V5.7488H3.77743V6.34719H10.1337C10.1337 6.34719 9.78131 7.43012 9.19031 8.50205C7.48516 7.97525 5.91214 7.60816 4.64927 7.60816C1.62073 7.60816 0.948927 9.12976 1.0921 10.5211C1.20772 11.6316 2.03369 13.2523 4.55753 13.2523C6.8629 13.2523 8.72409 11.9307 9.86945 10.3577C12.0537 11.3635 14.3609 12.6025 16.0018 13.5166V10.8771C14.2673 10.2824 12.441 9.58865 10.6936 8.99393V8.99393ZM4.19039 12.3125C2.05757 12.3125 1.72714 11.1103 1.69043 10.3926C1.65555 9.76486 2.07956 8.58641 4.48772 8.58641C5.38345 8.58641 6.80414 9.04346 8.39916 9.70977C7.49799 10.8937 6.05342 12.3125 4.19039 12.3125V12.3125Z"
					fill="white"
				/>
			</g>
			<defs>
				<clipPath id="alipay-logo-clip">
					<rect width="57.7219" height="16" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
}

function AlipaySummary() {
	const customerName = useSelect( ( select ) => select( 'alipay' ).getCustomerName() );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}
