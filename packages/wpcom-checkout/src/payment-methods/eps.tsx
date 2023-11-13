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

const debug = debugFactory( 'wpcom-checkout:eps-payment-method' );

// Disabling this to make migration easier
/* eslint-disable @typescript-eslint/no-use-before-define */

type NounsInStore = 'customerName';
type EpsStore = PaymentMethodStore< NounsInStore >;

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

export function createEpsPaymentMethodStore(): EpsStore {
	debug( 'creating a new eps payment method store' );
	const store = registerStore( 'eps', {
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

export function createEpsMethod( {
	store,
	submitButtonContent,
}: {
	store: EpsStore;
	submitButtonContent: ReactNode;
} ): PaymentMethod {
	return {
		id: 'eps',
		hasRequiredFields: true,
		paymentProcessorId: 'eps',
		label: <EpsLabel />,
		activeContent: <EpsFields />,
		submitButton: <EpsPayButton store={ store } submitButtonContent={ submitButtonContent } />,
		inactiveContent: <EpsSummary />,
		getAriaLabel: ( __ ) => __( 'EPS e-Pay' ),
	};
}

function useCustomerName() {
	const { customerName } = useSelect( ( select ) => {
		const store = select( 'eps' ) as StoreSelectors< NounsInStore >;
		return {
			customerName: store.getCustomerName(),
		};
	}, [] );

	return customerName;
}

function EpsFields() {
	const { __ } = useI18n();

	const customerName = useCustomerName();
	const { changeCustomerName } = useDispatch( 'eps' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	return (
		<EpsFormWrapper>
			<EpsField
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
		</EpsFormWrapper>
	);
}

const EpsFormWrapper = styled.div`
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

const EpsField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function EpsPayButton( {
	disabled,
	onClick,
	store,
	submitButtonContent,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	store: EpsStore;
	submitButtonContent: ReactNode;
} ) {
	const { formStatus } = useFormStatus();
	const customerName = useCustomerName();

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; EpsPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting eps payment' );
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

function EpsSummary() {
	const customerName = useCustomerName();

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}

function isFormValid( store: EpsStore ): boolean {
	const customerName = selectors.getCustomerName( store.getState() );

	if ( ! customerName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( actions.changeCustomerName( '' ) );
		return false;
	}

	return true;
}

function EpsLabel() {
	const { __ } = useI18n();
	return (
		<Fragment>
			<span>{ __( 'EPS e-Pay' ) }</span>
			<PaymentMethodLogos className="eps__logo payment-logos">
				<EpsLogo />
			</PaymentMethodLogos>
		</Fragment>
	);
}

const EpsLogo = styled( EpsLogoImg )`
	width: 28px;
`;

function EpsLogoImg( { className }: { className?: string } ) {
	return <img src="/calypso/images/upgrades/eps.svg" alt="EPS e-Pay" className={ className } />;
}
