/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import {
	Button,
	FormStatus,
	useLineItems,
	useFormStatus,
	registerStore,
	useSelect,
	useDispatch,
} from '@automattic/composite-checkout';
import type { Stripe, StripeConfiguration } from '@automattic/calypso-stripe';
import type { PaymentMethod, ProcessPayment, LineItem } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import styled from '../styled';
import Field from '../field';
import { SummaryLine, SummaryDetails } from '../summary-details';
import { PaymentMethodLogos } from '../payment-method-logos';

const debug = debugFactory( 'wpcom-checkout:giropay-payment-method' );

// Disabling this to make migration easier
/* eslint-disable @typescript-eslint/no-use-before-define */

interface StoreStateValue {
	value: string;
	isTouched: boolean;
}

interface StoreState {
	customerName: StoreStateValue;
}

type StoreAction = { type: string; payload: string };

interface StoreActions {
	changeCustomerName: ( payload: string ) => StoreAction;
}

interface StoreSelectors {
	getCustomerName: ( state: StoreState ) => StoreStateValue;
}

interface GiropayStore extends ReturnType< typeof registerStore > {
	actions: StoreActions;
	selectors: StoreSelectors;
}

export function createGiropayPaymentMethodStore(): GiropayStore {
	debug( 'creating a new giropay payment method store' );
	const actions = {
		changeCustomerName( payload: string ) {
			return { type: 'CUSTOMER_NAME_SET', payload };
		},
	};

	const selectors = {
		getCustomerName( state: StoreState ) {
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

export function createGiropayMethod( {
	store,
	stripe,
	stripeConfiguration,
}: {
	store: GiropayStore;
	stripe: Stripe;
	stripeConfiguration: StripeConfiguration;
} ): PaymentMethod {
	return {
		id: 'giropay',
		label: <GiropayLabel />,
		activeContent: <GiropayFields />,
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

function GiropayFields(): JSX.Element {
	const { __ } = useI18n();

	const customerName = useSelect( ( select ) => select( 'giropay' ).getCustomerName() ) as
		| StoreStateValue
		| undefined;
	const { changeCustomerName } = useDispatch( 'giropay' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	return (
		<GiropayFormWrapper>
			<GiropayField
				id="giropay-cardholder-name"
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

		.rtl & {
			right: 3px;
			left: auto;
		}
	}
`;

const GiropayField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function GiropayPayButton( {
	disabled,
	onClick,
	store,
	stripe,
	stripeConfiguration,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	store: GiropayStore;
	stripe: Stripe;
	stripeConfiguration: StripeConfiguration;
} ): JSX.Element {
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const customerName = useSelect( ( select ) => select( 'giropay' ).getCustomerName() ) as
		| StoreStateValue
		| undefined;

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; GiropayPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting giropay payment' );
					onClick( 'giropay', {
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

function ButtonContents( { formStatus, total }: { formStatus: FormStatus; total: LineItem } ) {
	const { __ } = useI18n();
	if ( formStatus === FormStatus.SUBMITTING ) {
		return <>{ __( 'Processing…' ) }</>;
	}
	if ( formStatus === FormStatus.READY ) {
		/* translators: %s is the total to be paid in localized currency */
		return <>{ sprintf( __( 'Pay %s' ), total.amount.displayValue ) }</>;
	}
	return <>{ __( 'Please wait…' ) }</>;
}

function isFormValid( store: GiropayStore ): boolean {
	const customerName = store.selectors.getCustomerName( store.getState() as StoreState );

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

const GiropayLogo = styled( GiropayLogoImg )`
	width: 64px;
	margin: -10px 0;
`;

function GiropayLogoImg( { className }: { className?: string } ) {
	return <img src="/calypso/images/upgrades/giropay.svg" alt="Giropay" className={ className } />;
}

function GiropaySummary() {
	const customerName = useSelect( ( select ) => select( 'giropay' ).getCustomerName() ) as
		| StoreStateValue
		| undefined;

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}
