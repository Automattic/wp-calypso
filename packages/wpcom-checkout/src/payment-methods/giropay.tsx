import { Button, FormStatus, useLineItems, useFormStatus } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useSelect, useDispatch, registerStore } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { Fragment } from 'react';
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
import type { PaymentMethod, ProcessPayment, LineItem } from '@automattic/composite-checkout';

const debug = debugFactory( 'wpcom-checkout:giropay-payment-method' );

// Disabling this to make migration easier
/* eslint-disable @typescript-eslint/no-use-before-define */

type StoreKey = 'giropay';
type NounsInStore = 'customerName';
type GiropayStore = PaymentMethodStore< NounsInStore >;

declare module '@wordpress/data' {
	function select( key: StoreKey ): StoreSelectors< NounsInStore >;
	function dispatch( key: StoreKey ): StoreActions< NounsInStore >;
}

const actions: StoreActions< NounsInStore > = {
	changeCustomerName( payload ) {
		return { type: 'CUSTOMER_NAME_SET', payload };
	},
};

const selectors: StoreSelectorsWithState< NounsInStore > = {
	getCustomerName( state ) {
		return state.customerName;
	},
};

export function createGiropayPaymentMethodStore(): GiropayStore {
	debug( 'creating a new giropay payment method store' );

	const store = registerStore( 'giropay', {
		reducer(
			state: StoreState< NounsInStore > = {
				customerName: { value: '', isTouched: false },
			},
			action
		): StoreState< NounsInStore > {
			switch ( action.type ) {
				case 'CUSTOMER_NAME_SET':
					return { ...state, customerName: { value: action.payload, isTouched: true } };
			}
			return state;
		},
		actions,
		selectors,
	} );

	return store;
}

export function createGiropayMethod( { store }: { store: GiropayStore } ): PaymentMethod {
	return {
		id: 'giropay',
		label: <GiropayLabel />,
		activeContent: <GiropayFields />,
		inactiveContent: <GiropaySummary />,
		submitButton: <GiropayPayButton store={ store } />,
		getAriaLabel: () => 'Giropay',
	};
}

function GiropayFields(): JSX.Element {
	const { __ } = useI18n();

	const customerName = useSelect( ( select ) => select( 'giropay' ).getCustomerName() );
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
				value={ customerName.value }
				onChange={ changeCustomerName }
				isError={ customerName.isTouched && customerName.value.length === 0 }
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
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	store: GiropayStore;
} ): JSX.Element {
	const [ , total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const customerName = useSelect( ( select ) => select( 'giropay' ).getCustomerName() );

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
						name: customerName.value,
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
	const customerName = selectors.getCustomerName( store.getState() );

	if ( ! customerName.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( actions.changeCustomerName( '' ) );
		return false;
	}
	return true;
}

function GiropayLabel() {
	return (
		<Fragment>
			<span>Giropay</span>
			<PaymentMethodLogos className="giropay__logo payment-logos">
				<GiropayLogo />
			</PaymentMethodLogos>
		</Fragment>
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
	const customerName = useSelect( ( select ) => select( 'giropay' ).getCustomerName() );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName.value }</SummaryLine>
		</SummaryDetails>
	);
}
