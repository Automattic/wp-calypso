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
				<GiropayLogoUI />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

const GiropayLogoUI = styled( GiropayLogo )`
	width: 64px;
`;

function GiropayLogo( { className } ) {
	return (
		<svg className={ className } viewBox="0 0 110 64" xmlns="http://www.w3.org/2000/svg">
			<g fill="none" fillRule="evenodd" transform="translate(9.833774 12.447711)">
				<path
					d="m.07383513 7.0105353c0-3.86377933 3.16697782-6.9964941 7.07160235-6.9964941h77.06836802c3.9063027 0 7.0715661 3.13271477 7.0715661 6.9964941v25.0029571c0 3.861531-3.1652634 6.9948251-7.0715661 6.9948251h-77.06836802c-3.90462453 0-7.07160235-3.1332941-7.07160235-6.9948251z"
					fill="#000268"
				/>
				<path
					d="m2.97618967 7.24993139v24.52645011c0 2.4140187 1.97954813 4.3719153 4.42135685 4.3719153h40.37684178v-33.27028109h-40.37684178c-2.44180872 0-4.42135685 1.95786064-4.42135685 4.37191568zm55.23084013 12.14071611c0 1.5615512-.7768675 2.6347712-2.0630611 2.6347712-1.1362787 0-2.0834931-1.07322-2.0834931-2.5032488 0-1.4678241.8330539-2.5591069 2.0834931-2.5591069 1.3259618 0 2.0630611 1.129115 2.0630611 2.4275845zm-7.5519953 8.9560589h3.4054411v-5.3254364h.0380538c.6450852 1.1669461 1.9329933 1.5993823 3.1249476 1.5993823 2.9330012 0 4.5037021-2.4078162 4.5037021-5.3056691 0-2.3699841-1.4945933-4.9494397-4.2209102-4.9494397-1.5508168 0-2.9892237.6215949-3.6723626 1.9956918h-.0380538v-1.7681574h-3.140818zm15.7234642-7.0563432c0-.9399921.9074461-1.2962205 2.0636089-1.2962205.5105304 0 1.0034382.0355831 1.4384078.055896 0 1.1471778-.8137534 2.3140891-2.1016622 2.3140891-.7950003 0-1.4003545-.3946051-1.4003545-1.0737646zm6.8694415 3.1050396c-.1504998-.7706018-.1885525-1.5434873-.1885525-2.3140891v-3.6504267c0-2.9915441-2.1754714-4.0653435-4.6933501-4.0653435-1.4565771 0-2.7246017.2071857-3.9364392.6972223l.0579381 2.2966057c.9432006-.5278678 2.0431396-.7350545 3.1408176-.7350545 1.2282918 0 2.23173.3585142 2.2521613 1.6948159-.4349696-.0756642-1.0420381-.1332647-1.5905845-.1332647-1.8154413 0-5.0903037.3585143-5.0903037 3.3495138 0 2.1272512 1.740501 3.0852703 3.6899491 3.0852703 1.4003546 0 2.3475329-.5436467 3.1232323-1.7687368h.038054c0 .5098039.0556387 1.0156185.0761067 1.5434873zm1.532611 3.9513036c.7007238.1513275 1.4003539.2275354 2.1192475.2275354 3.123269 0 3.8603325-2.3903328 4.8257167-4.8557495l3.6161401-9.1254144h-3.4077395l-2.0250083 6.3969529h-.038054l-2.1198314-6.3969529h-3.6700645l3.9926257 10.0275744c-.2464545.8660333-.8892775 1.35607-1.7228791 1.35607-.4747386 0-.8892762-.0576004-1.3441307-.2071867z"
					fill="#fff"
				/>
				<path
					d="m11.2959318 19.4104157c0-1.3363016.6632548-2.4473527 1.9312799-2.4473527 1.5326831 0 2.1755071 1.2228052 2.1755071 2.3140891 0 1.5056921-.9653841 2.5213116-2.1755071 2.5213116-1.0215705 0-1.9312799-.8643289-1.9312799-2.388048zm7.4003659-4.8173378h-3.0851793v1.7681574h-.0357916c-.7211918-1.2047424-1.8955232-1.9956918-3.3515169-1.9956918-3.06533135 0-4.44747966 2.1848147-4.44747966 5.1007314 0 2.8978529 1.68482527 4.9291279 4.38899486 4.9291279 1.3645625 0 2.5002934-.5278688 3.3134642-1.6750108h.0380528v.5278319c0 1.91836-1.0596233 2.8402894-3.0266937 2.8402894-1.4202381 0-2.2918937-.3009139-3.33166985-.8084329l-.17034687 2.6725665c.79332274.2828499 2.13745332.6215949 3.76663992.6215949 3.9744558 0 5.9415261-1.29905 5.9415261-5.3260179zm5.757535-4.0828629h-3.4071566v2.4834806h3.4071566zm-3.4054422 13.8851878h3.4054422v-9.8023249h-3.4054422zm12.8910156-9.9163639c-.3407308-.0553514-.7575312-.1134954-1.1539007-.1134954-1.4764245 0-2.3276482.7909494-2.9148324 2.033524h-.0380538v-1.8059896h-3.1033481v9.8023249h3.406025v-4.1381784c0-1.9200286.8909919-3.0672074 2.4798625-3.0672074.3986317 0 .775116 0 1.1539006.1112105zm5.8654926 7.7716293c-1.5707019 0-2.2135249-1.2984695-2.2135249-2.7465622 0-1.467824.642823-2.7662936 2.2135249-2.7662936 1.5724153 0 2.2157861 1.2984696 2.2157861 2.7662936 0 1.4480927-.6433708 2.7465622-2.2157861 2.7465622zm0 2.3699841c3.2555252 0 5.7353877-1.8799474 5.7353877-5.1165463 0-3.2563292-2.4798625-5.1385625-5.7353877-5.1385625-3.2549794 0-5.7331265 1.8822333-5.7331265 5.1385625 0 3.2365989 2.4781471 5.1165463 5.7331265 5.1165463z"
					fill="#ff0007"
				/>
			</g>
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
