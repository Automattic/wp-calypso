import {
	Button,
	FormStatus,
	useLineItems,
	useFormStatus,
	registerStore,
	useSelect,
	useDispatch,
} from '@automattic/composite-checkout';
import styled from '@emotion/styled';
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

const debug = debugFactory( 'wpcom-checkout:sofort-payment-method' );

// Disabling this to make migration easier
/* eslint-disable @typescript-eslint/no-use-before-define */

type StoreKey = 'sofort';
type NounsInStore = 'customerName';
type SofortStore = PaymentMethodStore< NounsInStore >;

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
		return state.customerName || '';
	},
};

export function createSofortPaymentMethodStore(): SofortStore {
	debug( 'creating a new sofort payment method store' );
	const store = registerStore( 'sofort', {
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

export function createSofortMethod( { store }: { store: SofortStore } ): PaymentMethod {
	return {
		id: 'sofort',
		label: <SofortLabel />,
		activeContent: <SofortFields />,
		submitButton: <SofortPayButton store={ store } />,
		inactiveContent: <SofortSummary />,
		getAriaLabel: () => 'Sofort',
	};
}

function SofortFields() {
	const { __ } = useI18n();

	const customerName = useSelect( ( select ) => select( 'sofort' ).getCustomerName() );
	const { changeCustomerName } = useDispatch( 'sofort' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	return (
		<SofortFormWrapper>
			<SofortField
				id="sofort-cardholder-name"
				type="Text"
				autoComplete="cc-name"
				label={ __( 'Your name' ) }
				value={ customerName?.value ?? '' }
				onChange={ changeCustomerName }
				isError={ customerName?.isTouched && customerName?.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
		</SofortFormWrapper>
	);
}

const SofortFormWrapper = styled.div`
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
			left: auto;
			right: 3px;
		}
	}
`;

const SofortField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function SofortPayButton( {
	disabled,
	onClick,
	store,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	store: SofortStore;
} ) {
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const customerName = useSelect( ( select ) => select( 'sofort' ).getCustomerName() );

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; SofortPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting sofort payment' );
					onClick( 'sofort', {
						name: customerName?.value,
						items,
						total,
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

function SofortSummary() {
	const customerName = useSelect( ( select ) => select( 'sofort' ).getCustomerName() );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}

function isFormValid( store: SofortStore ): boolean {
	const customerName = selectors.getCustomerName( store.getState() );

	if ( ! customerName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( actions.changeCustomerName( '' ) );
		return false;
	}
	return true;
}

function SofortLabel() {
	const { __ } = useI18n();
	return (
		<Fragment>
			<span>{ __( 'Sofort' ) }</span>
			<PaymentMethodLogos className="sofort__logo payment-logos">
				<SofortLogo />
			</PaymentMethodLogos>
		</Fragment>
	);
}

const SofortLogo = styled( SofortLogoImg )`
	width: 64px;
`;

function SofortLogoImg( { className }: { className?: string } ) {
	return <img src="/calypso/images/upgrades/sofort.svg" alt="Sofort" className={ className } />;
}
