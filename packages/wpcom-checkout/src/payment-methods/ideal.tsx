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

type NounsInStore = 'customerName';
type IdealStore = PaymentMethodStore< NounsInStore >;

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

export function createIdealPaymentMethodStore(): IdealStore {
	debug( 'creating a new ideal payment method store' );
	const store = registerStore( 'ideal', {
		reducer(
			state: StoreState< NounsInStore > = {
				customerName: { value: '', isTouched: false },
			},
			action: AnyAction
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
	const { customerName } = useSelect( ( select ) => {
		const store = select( 'ideal' ) as StoreSelectors< NounsInStore >;
		return {
			customerName: store.getCustomerName(),
		};
	}, [] );

	return {
		customerName,
	};
}

function IdealFields() {
	const { __ } = useI18n();

	const { customerName } = useCustomerData();
	const { changeCustomerName } = useDispatch( 'ideal' );
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
		</IdealFormWrapper>
	);
}

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
	const { customerName } = useCustomerData();

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
	const { customerName } = useCustomerData();

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}

function isFormValid( store: IdealStore ) {
	const customerName = selectors.getCustomerName( store.getState() );

	if ( ! customerName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( actions.changeCustomerName( '' ) );
	}
	if ( ! customerName?.value.length ) {
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
