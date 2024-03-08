import { Button, FormStatus, useFormStatus } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useSelect, useDispatch, registerStore } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { Fragment, ReactNode } from 'react';
import Field from '../field';
import { PaymentMethodLogos } from '../payment-method-logos';
import { SummaryLine, SummaryDetails } from '../summary-details';
import type {
	PaymentMethodStore,
	StoreSelectors,
	StoreSelectorsWithState,
	StoreActions,
	StoreState,
} from '../payment-method-store';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';
import type { AnyAction } from 'redux';

const debug = debugFactory( 'wpcom-checkout:ideal-payment-method' );

// Disabling this to make migration easier
/* eslint-disable @typescript-eslint/no-use-before-define */

type NounsInStore = 'customerName' | 'customerBank';
type IdealStore = PaymentMethodStore< NounsInStore >;

const actions: StoreActions< NounsInStore > = {
	changeCustomerName( payload ) {
		return { type: 'CUSTOMER_NAME_SET', payload };
	},
	changeCustomerBank( payload ) {
		return { type: 'CUSTOMER_BANK_SET', payload };
	},
};

const selectors: StoreSelectorsWithState< NounsInStore > = {
	getCustomerName( state ) {
		return state.customerName || '';
	},
	getCustomerBank( state ) {
		return state.customerBank || '';
	},
};

export function createIdealPaymentMethodStore(): IdealStore {
	debug( 'creating a new ideal payment method store' );
	const store = registerStore( 'ideal', {
		reducer(
			state: StoreState< NounsInStore > = {
				customerName: { value: '', isTouched: false },
				customerBank: { value: '', isTouched: false },
			},
			action: AnyAction
		): StoreState< NounsInStore > {
			switch ( action.type ) {
				case 'CUSTOMER_NAME_SET':
					return { ...state, customerName: { value: action.payload, isTouched: true } };
				case 'CUSTOMER_BANK_SET':
					return { ...state, customerBank: { value: action.payload, isTouched: true } };
			}
			return state;
		},
		actions,
		selectors,
	} );

	return store;
}

export function createIdealMethod( {
	store,
	submitButtonContent,
}: {
	store: IdealStore;
	submitButtonContent: ReactNode;
} ): PaymentMethod {
	return {
		id: 'ideal',
		hasRequiredFields: true,
		paymentProcessorId: 'ideal',
		label: <IdealLabel />,
		activeContent: <IdealFields />,
		submitButton: <IdealPayButton store={ store } submitButtonContent={ submitButtonContent } />,
		inactiveContent: <IdealSummary />,
		getAriaLabel: ( __ ) => __( 'iDEAL' ),
	};
}

function useCustomerData() {
	const { customerName, customerBank } = useSelect( ( select ) => {
		const store = select( 'ideal' ) as StoreSelectors< NounsInStore >;
		return {
			customerName: store.getCustomerName(),
			customerBank: store.getCustomerBank(),
		};
	}, [] );

	return {
		customerName,
		customerBank,
	};
}

function IdealFields() {
	const { __ } = useI18n();

	const { customerName, customerBank } = useCustomerData();
	const { changeCustomerName, changeCustomerBank } = useDispatch( 'ideal' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	return (
		<IdealFormWrapper>
			<IdealField
				id="ideal-cardholder-name"
				type="Text"
				autoComplete="cc-name"
				label={ __( 'Your name' ) }
				value={ customerName?.value ?? '' }
				onChange={ changeCustomerName }
				isError={ customerName?.isTouched && customerName?.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
			<BankSelector
				id="ideal-bank-selector"
				value={ customerBank?.value ?? '' }
				onChange={ changeCustomerBank }
				label={ __( 'Bank' ) }
				isError={ customerBank?.isTouched && customerBank?.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
		</IdealFormWrapper>
	);
}

function BankSelector( {
	id,
	value,
	onChange,
	label,
	isError,
	errorMessage,
	disabled,
}: {
	id: string;
	value: string;
	onChange: ( newId: string ) => void;
	label: string;
	isError: boolean;
	errorMessage: string | null;
	disabled?: boolean;
} ) {
	const { __ } = useI18n();
	const bankOptions = getBankOptions( __ );
	return (
		<SelectWrapper>
			<IdealBankLabel htmlFor={ id }>{ label }</IdealBankLabel>
			<IdealSelect
				id={ id }
				value={ value }
				onChange={ ( event ) => onChange( event.target.value ) }
				disabled={ disabled }
			>
				{ bankOptions.map( ( bank ) => (
					<BankOption key={ bank.value } value={ bank.value } label={ bank.label } />
				) ) }
			</IdealSelect>
			<ErrorMessage isError={ isError } errorMessage={ errorMessage } />
		</SelectWrapper>
	);
}

function BankOption( { value, label }: { value: string; label: string } ) {
	return <option value={ value }>{ label }</option>;
}

function ErrorMessage( {
	isError,
	errorMessage,
}: {
	isError: boolean;
	errorMessage: string | null;
} ) {
	if ( isError ) {
		return <Description isError={ isError }>{ errorMessage }</Description>;
	}
	return null;
}

const Description = styled.p< { isError: boolean } >`
	margin: 8px 0 0;
	color: ${ ( props ) =>
		props.isError ? props.theme.colors.error : props.theme.colors.textColorLight };
	font-style: italic;
	font-size: 14px;
`;

const IdealFormWrapper = styled.div`
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

const IdealField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;
const IdealBankLabel = styled.label`
	font-size: 14px;
	font-weight: 600;
`;
const IdealSelect = styled.select`
	background: var( --color-surface,  rgb(255, 255, 255))
		url( 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMHB4IiB2aWV3Qm94PSIwIDAgMjAgMjAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6c2tldGNoPSJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMiPiAgICAgICAgPHRpdGxlPmFycm93LWRvd248L3RpdGxlPiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4gICAgPGRlZnM+PC9kZWZzPiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBza2V0Y2g6dHlwZT0iTVNQYWdlIj4gICAgICAgIDxnIGlkPSJhcnJvdy1kb3duIiBza2V0Y2g6dHlwZT0iTVNBcnRib2FyZEdyb3VwIiBmaWxsPSIjQzhEN0UxIj4gICAgICAgICAgICA8cGF0aCBkPSJNMTUuNSw2IEwxNyw3LjUgTDEwLjI1LDE0LjI1IEwzLjUsNy41IEw1LDYgTDEwLjI1LDExLjI1IEwxNS41LDYgWiIgaWQ9IkRvd24tQXJyb3ciIHNrZXRjaDp0eXBlPSJNU1NoYXBlR3JvdXAiPjwvcGF0aD4gICAgICAgIDwvZz4gICAgPC9nPjwvc3ZnPg==' )
		no-repeat right 10px center;
	border-color: var( --color-neutral-10, rgb(195, 196, 199) );
	color: var( --color-neutral-70, rgb(60, 67, 74) );
	cursor: pointer;
	display: inline-block;
	margin: 8px 0 1em;
	overflow: hidden;
	font-size: 1rem;
    font-weight: 400;
	line-height: 1.4em;
	text-overflow: ellipsis;
	box-sizing: border-box;
	padding: 7px 32px 9px 14px; // Aligns the text to the 8px baseline grid and adds padding on right to allow for the arrow.
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;

	// IE: Remove the default arrow
	&::-ms-expand {
		display: none;
	}

	// IE: Remove default background and color styles on focus
	&::-ms-value {
		background: none;
		color: var( --color-neutral-70 );
	}

	// Firefox: Remove the focus outline, see http://stackoverflow.com/questions/3773430/remove-outline-from-select-box-in-ff/18853002#18853002
	&:-moz-focusring {
		color: transparent;
		text-shadow: 0 0 0 var( --color-neutral-70 );
	}
}
`;

const SelectWrapper = styled.div`
	margin-top: 16px;

	select {
		width: 100%;
	}
`;

function IdealPayButton( {
	disabled,
	onClick,
	store,
	submitButtonContent,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	store: IdealStore;
	submitButtonContent: ReactNode;
} ) {
	const { formStatus } = useFormStatus();
	const { customerName, customerBank } = useCustomerData();

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; IdealPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting ideal payment' );
					onClick( {
						name: customerName?.value,
						idealBank: customerBank?.value,
					} );
				}
			} }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			{ submitButtonContent }
		</Button>
	);
}

function IdealSummary() {
	const { customerName, customerBank } = useCustomerData();

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
			<SummaryLine>{ customerBank?.value }</SummaryLine>
		</SummaryDetails>
	);
}

function isFormValid( store: IdealStore ) {
	const customerName = selectors.getCustomerName( store.getState() );
	const customerBank = selectors.getCustomerBank( store.getState() );

	if ( ! customerName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( actions.changeCustomerName( '' ) );
	}
	if ( ! customerBank?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( actions.changeCustomerBank( '' ) );
	}
	if ( ! customerName?.value.length || ! customerBank?.value.length ) {
		return false;
	}
	return true;
}

function IdealLabel() {
	const { __ } = useI18n();
	return (
		<Fragment>
			<span>{ __( 'iDEAL' ) }</span>
			<PaymentMethodLogos className="ideal__logo payment-logos">
				<IdealLogo />
			</PaymentMethodLogos>
		</Fragment>
	);
}

const IdealLogo = styled( IdealLogoSvg )`
	height: 20px;
	transform: translateY( -3px );
`;

function IdealLogoSvg( { className }: { className?: string } ) {
	return (
		<svg
			className={ className }
			enableBackground="new 0 0 52.4 45.4"
			viewBox="0 0 52.4 45.4"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="m5.8 39.2h8.6v-13.6h-8.6zm39.1-34.8c-6.4-4.7-15.1-4.4-15.1-4.4h-29.8v45.4h29.8s9.2.6 16.1-5.1c5.6-4.7 6.5-13.2 6.5-18.1 0-4.8-1.7-13.4-7.5-17.8zm0 32.5c-5.6 5.9-14.4 5.5-14.4 5.5h-27.4v-39.3h27.4s7.5-.3 13 4.4c5.3 4.5 5.8 10.6 5.8 15 .1 4-.5 10.3-4.4 14.4zm-34.8-22.9c-2.6 0-4.6 2.1-4.6 4.6s2.1 4.6 4.6 4.6c2.6 0 4.6-2.1 4.6-4.6s-2-4.6-4.6-4.6z" />
			<path
				clipRule="evenodd"
				d="m34.4 19.5h1.5l-.8-2zm5.9-4.8h2.1v6.5h3.8c-.2-3.4-1.5-8.4-4.8-10.9-4.3-3.4-11-3.8-11-3.8h-12.7v8.2h2.4s2.7.2 2.7 4.1c0 4-2.7 4.1-2.7 4.1h-2.4v16h12.7s7.5 0 12-4.1c2.9-2.7 3.6-8.3 3.8-11.9h-5.8v-8.2zm-9.9 1.7h-4.5v1.4h4.1v1.7h-4.1v1.7h4.5v1.7h-6.2v-8.2h6.2zm6.8 6.5-.6-1.7h-2.8l-.6 1.7h-2.2l3.1-8.2h2.1l3.4 8.2zm-16.4-4.1c0-2.2-1.4-2.4-1.4-2.4h-1.7v4.8h1.7s1.4 0 1.4-2.4z"
				fill="#cc2e74"
				fillRule="evenodd"
			/>
		</svg>
	);
}

function getBankOptions( __: ReturnType< typeof useI18n >[ '__' ] ) {
	// Source https://stripe.com/docs/sources/ideal
	const banks = [
		{ value: 'abn_amro', label: 'ABN AMRO' },
		{ value: 'asn_bank', label: 'ASN Bank' },
		{ value: 'bunq', label: 'Bunq' },
		{ value: 'ing', label: 'ING' },
		{ value: 'knab', label: 'Knab' },
		{ value: 'rabobank', label: 'Rabobank' },
		{ value: 'regiobank', label: 'RegioBank' },
		{ value: 'sns_bank', label: 'SNS Bank' },
		{ value: 'triodos_bank', label: 'Triodos Bank' },
		{ value: 'van_lanschot', label: 'Van Lanschot' },
	];
	return [ { value: '', label: __( 'Please select your bank.' ) }, ...banks ];
}
