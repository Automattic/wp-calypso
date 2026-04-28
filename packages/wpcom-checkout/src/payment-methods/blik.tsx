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
import type { AnyAction } from '../types';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';

const debug = debugFactory( 'wpcom-checkout:blik-payment-method' );

// Disabling this to make migration easier
/* eslint-disable @typescript-eslint/no-use-before-define */

type NounsInStore = 'customerName' | 'blikCode';
type BlikStore = PaymentMethodStore< NounsInStore >;

const BLIK_CODE_PATTERN = /^\d{6}$/;

const actions: StoreActions< NounsInStore > = {
	changeCustomerName( payload ) {
		return { type: 'CUSTOMER_NAME_SET', payload };
	},
	changeBlikCode( payload ) {
		return { type: 'BLIK_CODE_SET', payload };
	},
};

const selectors: StoreSelectorsWithState< NounsInStore > = {
	getCustomerName( state ) {
		return state.customerName || '';
	},
	getBlikCode( state ) {
		return state.blikCode || '';
	},
};

export function createBlikPaymentMethodStore(): BlikStore {
	debug( 'creating a new blik payment method store' );
	const store = registerStore( 'blik', {
		reducer(
			state: StoreState< NounsInStore > = {
				customerName: { value: '', isTouched: false },
				blikCode: { value: '', isTouched: false },
			},
			action: AnyAction
		): StoreState< NounsInStore > {
			switch ( action.type ) {
				case 'CUSTOMER_NAME_SET':
					return { ...state, customerName: { value: action.payload, isTouched: true } };
				case 'BLIK_CODE_SET':
					// Strip non-digit characters as the user types — BLIK codes are always numeric.
					return {
						...state,
						blikCode: { value: action.payload.replace( /\D/g, '' ).slice( 0, 6 ), isTouched: true },
					};
			}
			return state;
		},
		actions,
		selectors,
	} );

	return store;
}

export function createBlikMethod( {
	store,
	submitButtonContent,
}: {
	store: BlikStore;
	submitButtonContent: ReactNode;
} ): PaymentMethod {
	return {
		id: 'stripe-blik',
		hasRequiredFields: true,
		paymentProcessorId: 'stripe-blik',
		label: <BlikLabel />,
		activeContent: <BlikFields />,
		submitButton: <BlikPayButton store={ store } submitButtonContent={ submitButtonContent } />,
		inactiveContent: <BlikSummary />,
		getAriaLabel: ( __ ) => __( 'BLIK' ),
	};
}

function useBlikData() {
	const { customerName, blikCode } = useSelect( ( select ) => {
		const store = select( 'blik' ) as StoreSelectors< NounsInStore >;
		return {
			customerName: store.getCustomerName(),
			blikCode: store.getBlikCode(),
		};
	}, [] );

	return {
		customerName,
		blikCode,
	};
}

function BlikFields() {
	const { __ } = useI18n();

	const { customerName, blikCode } = useBlikData();
	const { changeCustomerName, changeBlikCode } = useDispatch( 'blik' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	const blikCodeError =
		blikCode?.isTouched && ! BLIK_CODE_PATTERN.test( blikCode.value )
			? blikCode.value.length === 0
				? __( 'Please enter the 6-digit BLIK code from your banking app.' )
				: __( 'BLIK code must be 6 digits.' )
			: undefined;

	return (
		<BlikFormWrapper>
			<BlikField
				id="blik-cardholder-name"
				type="Text"
				autoComplete="cc-name"
				label={ __( 'Your name' ) }
				value={ customerName?.value ?? '' }
				onChange={ changeCustomerName }
				isError={ customerName?.isTouched && customerName?.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
			<BlikField
				id="blik-code"
				type="Text"
				autoComplete="off"
				label={ __( 'BLIK code' ) }
				description={ __(
					'Open your banking app, find the BLIK option, and enter the 6-digit code that appears here.'
				) }
				value={ blikCode?.value ?? '' }
				onChange={ changeBlikCode }
				isError={ Boolean( blikCodeError ) }
				errorMessage={ blikCodeError }
				disabled={ isDisabled }
			/>
		</BlikFormWrapper>
	);
}

const BlikFormWrapper = styled.div`
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

const BlikField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function BlikPayButton( {
	disabled,
	onClick,
	store,
	submitButtonContent,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	store: BlikStore;
	submitButtonContent: ReactNode;
} ) {
	const { formStatus } = useFormStatus();
	const { customerName, blikCode } = useBlikData();

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; BlikPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting blik payment' );
					onClick( {
						name: customerName?.value,
						code: blikCode?.value,
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

function BlikSummary() {
	const { customerName } = useBlikData();

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}

function isFormValid( store: BlikStore ) {
	const customerName = selectors.getCustomerName( store.getState() );
	const blikCode = selectors.getBlikCode( store.getState() );

	let valid = true;

	if ( ! customerName?.value.length ) {
		// Touch the field so it displays a validation error.
		store.dispatch( actions.changeCustomerName( '' ) );
		valid = false;
	}
	if ( ! blikCode?.value || ! BLIK_CODE_PATTERN.test( blikCode.value ) ) {
		// Touch the field so it displays a validation error. Re-dispatch the
		// current value (sanitised by the reducer) so the touched flag flips on.
		store.dispatch( actions.changeBlikCode( blikCode?.value ?? '' ) );
		valid = false;
	}

	return valid;
}

function BlikLabel() {
	const { __ } = useI18n();
	return (
		<Fragment>
			<span>{ __( 'BLIK' ) }</span>
			<PaymentMethodLogos className="blik__logo payment-logos">
				<BlikLogo />
			</PaymentMethodLogos>
		</Fragment>
	);
}

// Placeholder logo: BLIK's brand mark in their primary pink. Swap for the
// official SVG asset once it's been added to the repo.
const BlikLogo = styled.span`
	display: inline-block;
	padding: 2px 8px;
	border-radius: 4px;
	background: #e60074;
	color: #ffffff;
	font-weight: 700;
	font-size: 12px;
	letter-spacing: 0.5px;
	line-height: 1.4;

	&::before {
		content: 'BLIK';
	}
`;
