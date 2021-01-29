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
		getAriaLabel: () => 'Przelewy24',
	};
}

function P24Fields() {
	const { __ } = useI18n();

	const customerName = useSelect( ( select ) => select( 'p24' ).getCustomerName() );
	const customerEmail = useSelect( ( select ) => select( 'p24' ).getCustomerEmail() );
	const { changeCustomerName, changeCustomerEmail } = useDispatch( 'p24' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	return (
		<P24FormWrapper>
			<P24Field
				id="p24-cardholder-name"
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
				id="p24-cardholder-email"
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

const P24Field = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function P24PayButton( { disabled, onClick, store, stripe, stripeConfiguration } ) {
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const customerName = useSelect( ( select ) => select( 'p24' ).getCustomerName() );
	const customerEmail = useSelect( ( select ) => select( 'p24' ).getCustomerEmail() );

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting p24 payment' );
					onClick( 'p24', {
						stripe,
						name: customerName?.value,
						email: customerEmail?.value,
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
		/* translators: %s is the total to be paid in localized currency */
		return sprintf( __( 'Pay %s' ), total.amount.displayValue );
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
			<span>Przelewy24</span>
			<PaymentMethodLogos className="p24__logo payment-logos">
				<P24Logo />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

function P24Logo() {
	return (
		<svg width="48" height="16" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M9.93852 9.22449L13.8563 9.21913L13.713 10.1106L10.4371 13.2384L13.1858 13.2329L13.0261 14.1956L8.97795 14.1963L9.14712 13.2035L12.2874 10.1962L9.78222 10.196L9.93852 9.22449Z"
				fill="#D32536"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M4.83215 8.91647C4.83112 8.92789 4.73757 9.48231 4.61112 10.1381C4.56275 10.389 4.37109 10.5237 4.14995 10.5704C3.78492 10.6475 3.39205 10.6334 3.39205 10.6334L1.66371 10.629L2.04319 8.33846L3.60927 8.34279C3.60927 8.34279 3.71523 8.34058 3.86324 8.34289C4.03143 8.34549 4.25388 8.35393 4.43672 8.37802C4.5933 8.39863 4.7208 8.43073 4.76024 8.4805C4.81227 8.54618 4.83375 8.63002 4.84096 8.70664C4.85125 8.81556 4.8327 8.90986 4.83215 8.91647ZM5.65563 7.69985C5.56976 7.6092 5.44862 7.53929 5.31173 7.48536C5.16978 7.42944 5.01088 7.39071 4.85686 7.36391C4.66063 7.32976 4.47228 7.31499 4.33684 7.30865C4.21224 7.30282 4.13242 7.30415 4.13242 7.30415L2.41986 7.30392L1.14543 7.30374L0 14.196L1.06646 14.1971L1.48801 11.6423L3.55571 11.6513C3.55571 11.6513 4.36078 11.6829 4.93241 11.3805C5.50394 11.0779 5.65527 10.3898 5.65527 10.3898C5.65527 10.3898 5.71815 10.1346 5.76948 9.8229C5.82589 9.48064 5.88366 9.06964 5.91366 8.85082C5.9268 8.75479 5.93462 8.69575 5.93462 8.69575C5.93462 8.69575 5.94849 8.62478 5.94979 8.51476C5.95162 8.36084 5.92886 8.13045 5.80904 7.91095C5.76938 7.83834 5.71913 7.7669 5.65563 7.69985"
				fill="#D32536"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M19.1657 7.30265L20.1915 7.30182L19.0422 14.1976L18.0138 14.1959L19.1657 7.30265Z"
				fill="#D32536"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M24.6458 9.22339L25.6296 9.22256L25.9772 12.7213L27.4906 9.21623L28.705 9.21953L29.0638 12.7357L30.5775 9.22284L31.5981 9.22188L29.4289 14.1933L28.217 14.1934L27.8677 10.7123L26.3365 14.1935L25.1451 14.1969L24.6458 9.22339Z"
				fill="#D32536"
			/>
			<path
				d="M17.0474 11.0779L14.7562 11.0754L14.8474 10.7117C14.8474 10.7117 14.9269 10.4274 15.0858 10.3059C15.2448 10.1845 15.448 10.1639 15.6393 10.1454C15.8307 10.1267 16.3373 10.091 16.7509 10.1763C16.8882 10.2045 17.0188 10.2817 17.0527 10.396C17.133 10.666 17.0474 11.0779 17.0474 11.0779V11.0779ZM17.2701 9.26532C16.9826 9.17157 16.4833 9.15301 16.0619 9.15825C15.6534 9.16333 15.4661 9.18244 15.3137 9.21529C15.3137 9.21529 14.587 9.31945 14.1747 9.83033C13.7624 10.3412 13.6394 11.4591 13.6394 11.4591C13.6394 11.4591 13.3946 12.6945 13.4662 13.1062C13.5377 13.5178 13.666 13.8993 14.1325 14.0784C14.5991 14.2575 14.9948 14.2495 14.9948 14.2495C14.9948 14.2495 15.8262 14.3148 16.4526 14.1666C17.0791 14.0188 17.4094 13.5777 17.4094 13.5777C17.4094 13.5777 17.5563 13.3881 17.6623 13.1615C17.7684 12.9349 17.7994 12.7777 17.8041 12.7583L17.8698 12.4914L16.8048 12.4928C16.8048 12.4928 16.7461 13.1956 16.1718 13.2605C15.5978 13.3252 15.2896 13.3008 15.1786 13.2966C15.0692 13.2926 14.4523 13.318 14.5023 12.8037C14.5026 12.7968 14.503 12.7866 14.5037 12.7722C14.5323 12.1856 14.5975 12.0336 14.5975 12.0336L17.9407 12.0242L18.0834 11.1984C18.2457 10.259 18.1265 9.54458 17.2701 9.26532"
				fill="#D32536"
			/>
			<path
				d="M14.505 12.7803C14.5039 12.7883 14.5031 12.796 14.5023 12.8037C14.5008 12.8428 14.5053 12.7782 14.505 12.7803Z"
				fill="#D32536"
			/>
			<path
				d="M20.8116 12.7815C20.8105 12.7894 20.8097 12.7972 20.8089 12.8049C20.8074 12.844 20.8119 12.7793 20.8116 12.7815Z"
				fill="#D32536"
			/>
			<path
				d="M23.345 11.0765L21.054 11.0742L21.1451 10.7103C21.1451 10.7103 21.2247 10.4259 21.3836 10.3046C21.5425 10.1833 21.7456 10.1625 21.9371 10.144C22.1285 10.1255 22.635 10.0897 23.0487 10.175C23.1859 10.2031 23.3164 10.2803 23.3505 10.3948C23.4308 10.6647 23.345 11.0765 23.345 11.0765ZM23.5769 9.26641C23.2892 9.17266 22.7899 9.15411 22.3685 9.15941C21.96 9.16442 21.7727 9.18353 21.6203 9.21638C21.6203 9.21638 20.8936 9.32069 20.4813 9.83143C20.069 10.3424 19.946 11.4602 19.946 11.4602C19.946 11.4602 19.7012 12.6958 19.7728 13.1074C19.8444 13.519 19.9726 13.9004 20.4392 14.0796C20.9057 14.2587 21.3014 14.2508 21.3014 14.2508C21.3014 14.2508 22.1329 14.3159 22.7593 14.1679C23.3857 14.0199 23.716 13.5788 23.716 13.5788C23.716 13.5788 23.8629 13.3891 23.9689 13.1626C24.075 12.9361 24.106 12.7788 24.1109 12.7594L24.1765 12.4925L23.1114 12.4939C23.1114 12.4939 23.0527 13.1968 22.4785 13.2615C21.9044 13.3263 21.5962 13.302 21.4853 13.2979C21.3759 13.2938 20.759 13.3192 20.8089 12.8049C20.8092 12.7979 20.8096 12.7877 20.8103 12.7733C20.8389 12.1867 20.9041 12.0347 20.9041 12.0347L24.2473 12.0253L24.39 11.1996C24.5525 10.2602 24.4331 9.54582 23.5769 9.26641"
				fill="#D32536"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M32.7812 9.22386L33.439 12.8585L35.3007 9.22008L36.3478 9.22902L33.6656 14.4259C33.6656 14.4259 33.1803 15.3662 32.8791 15.6048C32.5781 15.8437 32.3943 15.9505 32.148 15.9748C31.9018 15.9993 31.8029 16.0164 31.5668 15.9748L31.3171 15.931L31.4734 15.003C31.4734 15.003 31.888 15.081 32.1349 14.9836C32.3818 14.8859 32.5816 14.4653 32.5816 14.4653L32.7061 14.2549L31.7368 9.22244L32.7812 9.22386Z"
				fill="#D32536"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M36.7255 9.71788L37.8054 9.71936L37.8693 9.30059C37.8693 9.30059 37.9848 8.54509 38.2419 8.39912C38.3243 8.35238 38.4566 8.30787 38.6092 8.28131C38.8912 8.23241 39.2513 8.22671 39.5424 8.23722C39.9917 8.25341 40.1599 8.25739 40.6166 8.3093C41.0734 8.36132 40.9569 8.80224 40.9569 8.80224L40.8675 9.45976C40.8675 9.45976 40.8285 9.7543 40.7232 9.93832C40.6299 10.1011 40.3756 10.2105 40.2285 10.2586C39.8729 10.3746 38.6562 10.6838 38.6562 10.6838L37.6985 10.9599C37.6985 10.9599 37.1113 11.1302 36.7811 11.4944C36.4513 11.8588 36.3215 12.2731 36.2763 12.4894C36.2313 12.7056 35.9786 14.1949 35.9786 14.1949L41.1415 14.1971L41.3138 13.165L37.2301 13.1696L37.3037 12.7491C37.3037 12.7491 37.351 12.3154 37.5267 12.174C37.5818 12.1292 37.6094 12.07 37.9354 11.9537C38.1301 11.8843 38.7964 11.7069 38.7964 11.7069L40.3371 11.2866C40.3371 11.2866 41.1776 11.0702 41.5088 10.6116C41.84 10.1533 41.9674 9.27449 41.9674 9.27449C41.9674 9.27449 42.0563 8.4214 41.9884 8.15392C41.9208 7.88648 41.6676 7.56527 41.3606 7.42837C41.0536 7.29148 40.732 7.21136 39.8021 7.22407C38.8725 7.23691 38.4134 7.28033 37.9429 7.45338C37.4724 7.62628 37.2002 7.94198 37.0273 8.38688C36.8363 8.80705 36.7255 9.71788 36.7255 9.71788Z"
				fill="#B1AFAD"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M45.3786 11.6373L43.1214 11.6338L45.8688 8.70704L45.3786 11.6373ZM46.4451 11.6364L47.1683 7.30053L45.8873 7.29974L41.8955 11.5869L41.7141 12.6725L45.2052 12.6721L44.9497 14.1955L46.0206 14.1969L46.2734 12.6723L47.2626 12.6743L47.4413 11.6351L46.4451 11.6364Z"
				fill="#B1AFAD"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M7.91883 7.86877H11.2059C11.2059 7.86877 11.9432 7.27296 12.4658 6.89088C12.9883 6.50872 13.9395 5.9053 13.9395 5.9053L12.0829 5.03652C12.0829 5.03652 10.5138 6.00836 9.84765 6.46688C9.19991 6.88938 7.91883 7.86877 7.91883 7.86877Z"
				fill="#B1AFAD"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M14.9852 5.29092L13.4604 4.26438C13.4604 4.26438 14.8405 3.48056 16.6746 2.74911C18.5088 2.01752 19.4869 1.71322 19.4869 1.71322L19.7966 3.16734C19.7966 3.16734 18.0307 3.75778 17.0188 4.23593C15.9737 4.68166 14.9852 5.29092 14.9852 5.29092V5.29092Z"
				fill="#B1AFAD"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M20.9244 2.84818L20.66 1.35807C20.66 1.35807 22.5421 0.857629 24.2667 0.536697C25.9912 0.215764 28.2788 0.0641246 28.2788 0.0641246L27.5219 2.36591C27.5219 2.36591 25.51 2.0913 23.6225 2.34763C22.1509 2.52286 20.9244 2.84818 20.9244 2.84818V2.84818Z"
				fill="#B1AFAD"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M28.716 2.56024L29.9893 0.0027504C29.9893 0.0027504 32.7767 -0.0513851 35.18 0.319551C37.5833 0.690638 39.7818 1.26227 39.7339 1.28728L33.6383 4.47522C33.6383 4.47522 32.2148 3.57332 30.446 3.01997C29.4442 2.72778 28.716 2.56024 28.716 2.56024V2.56024Z"
				fill="#B1AFAD"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M34.7312 5.17077L36.0715 6.1864H47.0809C47.0809 6.1864 47.0586 5.82993 46.7652 5.32512C46.5817 5.00874 46.2493 4.67434 45.9009 4.32673C45.7741 4.20044 45.2664 3.80474 44.8875 3.55905C43.9154 2.92909 43.3725 2.6855 42.3644 2.22608L34.7312 5.17077Z"
				fill="#B1AFAD"
			/>
			<path
				d="M8.63131 9.21915C8.21805 9.21915 7.82774 9.38215 7.49418 9.56479L7.55268 9.21915H6.45757L5.58066 14.1701H6.67657L7.16241 11.4272C7.26362 10.8706 7.6778 10.1836 8.49058 10.1836L9.05713 10.1813L9.22755 9.21915H8.63131Z"
				fill="#D32536"
			/>
		</svg>
	);
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
