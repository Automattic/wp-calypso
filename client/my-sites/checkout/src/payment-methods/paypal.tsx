import {
	FormStatus,
	TransactionStatus,
	useTransactionStatus,
	useFormStatus,
	Button,
} from '@automattic/composite-checkout';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { useSelect, useDispatch, registerStore } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { Fragment, useMemo } from 'react';
import { PayPalLogo } from 'calypso/dashboard/components/paypal-logo';
import TaxFields from 'calypso/my-sites/checkout/src/components/tax-fields';
import useCountryList from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import { PaymentMethodLogos } from '../components/payment-method-logos';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';
import type {
	PaymentMethodStore,
	StoreSelectors,
	StoreActions,
	StoreSelectorsWithState,
	StoreState,
	ManagedContactDetails,
} from '@automattic/wpcom-checkout';
import type { AnyAction } from 'redux';

const debug = debugFactory( 'calypso:paypal-payment-method' );

const storeKey = 'paypal-express';
type NounsInStore = 'postalCode' | 'countryCode' | 'address1' | 'organization' | 'city' | 'state';
type PaypalSelectors = StoreSelectors< NounsInStore >;

type PayPalStore = PaymentMethodStore< NounsInStore >;

const actions: StoreActions< NounsInStore > = {
	changePostalCode( payload ) {
		return { type: 'POSTAL_CODE_SET', payload };
	},
	changeCountryCode( payload ) {
		return { type: 'COUNTRY_CODE_SET', payload };
	},
	changeAddress1( payload ) {
		return { type: 'ADDRESS_SET', payload };
	},
	changeOrganization( payload ) {
		return { type: 'ORGANIZATION_SET', payload };
	},
	changeCity( payload ) {
		return { type: 'CITY_SET', payload };
	},
	changeState( payload ) {
		return { type: 'STATE_SET', payload };
	},
};

const selectors: StoreSelectorsWithState< NounsInStore > = {
	getPostalCode( state ) {
		return state.postalCode || '';
	},
	getCountryCode( state ) {
		return state.countryCode || '';
	},
	getAddress1( state ) {
		return state.address1 || '';
	},
	getOrganization( state ) {
		return state.organization || '';
	},
	getCity( state ) {
		return state.city || '';
	},
	getState( state ) {
		return state.state || '';
	},
};

export function createPayPalStore(): PayPalStore {
	debug( 'creating a new paypal payment method store' );
	const store = registerStore( storeKey, {
		reducer(
			state: StoreState< NounsInStore > = {
				postalCode: { value: '', isTouched: false },
				countryCode: { value: '', isTouched: false },
				address1: { value: '', isTouched: false },
				organization: { value: '', isTouched: false },
				city: { value: '', isTouched: false },
				state: { value: '', isTouched: false },
			},
			action: AnyAction
		): StoreState< NounsInStore > {
			switch ( action.type ) {
				case 'POSTAL_CODE_SET':
					return { ...state, postalCode: { value: action.payload, isTouched: true } };
				case 'COUNTRY_CODE_SET':
					return { ...state, countryCode: { value: action.payload, isTouched: true } };
				case 'ADDRESS_SET':
					return { ...state, address1: { value: action.payload, isTouched: true } };
				case 'ORGANIZATION_SET':
					return { ...state, organization: { value: action.payload, isTouched: true } };
				case 'CITY_SET':
					return { ...state, city: { value: action.payload, isTouched: true } };
				case 'STATE_SET':
					return { ...state, state: { value: action.payload, isTouched: true } };
			}
			return state;
		},
		actions,
		selectors,
	} );

	return store;
}

type PayPalMethodArgs = {
	labelText?: string | null;
	store?: PayPalStore;
	shouldShowTaxFields?: boolean;
};

type PayPalWithTaxesMethodArgs = PayPalMethodArgs & {
	// The store is only required if we need to keep state (tax fields).
	store: PayPalStore;
	shouldShowTaxFields: true;
};

export function createPayPalMethod(
	args: PayPalMethodArgs | PayPalWithTaxesMethodArgs
): PaymentMethod {
	debug( 'creating new paypal payment method' );
	return {
		id: storeKey,
		paymentProcessorId: storeKey,
		label: (
			<PayPalLabel
				labelText={ args.labelText }
				store={ args.shouldShowTaxFields ? args.store : undefined }
			/>
		),
		submitButton: <PayPalSubmitButton />,
		activeContent: args.shouldShowTaxFields ? <PayPalTaxFields /> : undefined,
		inactiveContent: <PayPalSummary />,
		getAriaLabel: () => 'PayPal',
	};
}

const PayPalFieldsWrapper = styled.div`
	padding: 16px;
	position: relative;
	display: block;
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

function PayPalTaxFields() {
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const countriesList = useCountryList();
	const postalCode = useSelect(
		( select ) => ( select( storeKey ) as PaypalSelectors ).getPostalCode(),
		[]
	);
	const countryCode = useSelect(
		( select ) => ( select( storeKey ) as PaypalSelectors ).getCountryCode(),
		[]
	);
	const address1 = useSelect(
		( select ) => ( select( storeKey ) as PaypalSelectors ).getAddress1(),
		[]
	);
	const organization = useSelect(
		( select ) => ( select( storeKey ) as PaypalSelectors ).getOrganization(),
		[]
	);
	const city = useSelect( ( select ) => ( select( storeKey ) as PaypalSelectors ).getCity(), [] );
	const state = useSelect( ( select ) => ( select( storeKey ) as PaypalSelectors ).getState(), [] );
	const fields = useMemo(
		() => ( {
			postalCode: { ...postalCode, errors: [] },
			countryCode: { ...countryCode, errors: [] },
			address1: { ...address1, errors: [] },
			organization: { ...organization, errors: [] },
			city: { ...city, errors: [] },
			state: { ...state, errors: [] },
		} ),
		[ postalCode, countryCode, address1, organization, city, state ]
	);
	const {
		changePostalCode,
		changeCountryCode,
		changeAddress1,
		changeCity,
		changeState,
		changeOrganization,
	} = useDispatch( storeKey );
	const onChangeContactInfo = ( newInfo: ManagedContactDetails ) => {
		changeCountryCode( newInfo.countryCode?.value ?? '' );
		changePostalCode( newInfo.postalCode?.value ?? '' );
		changeAddress1( newInfo.address1?.value ?? '' );
		changeOrganization( newInfo.organization?.value ?? '' );
		changeCity( newInfo.city?.value ?? '' );
		changeState( newInfo.state?.value ?? '' );
	};
	return (
		<PayPalFieldsWrapper>
			<TaxFields
				section="paypal-payment-method"
				taxInfo={ fields }
				onChange={ onChangeContactInfo }
				countriesList={ countriesList }
				isDisabled={ isDisabled }
			/>
		</PayPalFieldsWrapper>
	);
}

function PayPalLabel( {
	labelText = null,
	store,
}: {
	labelText?: string | null;
	store?: PayPalStore;
} ) {
	return (
		<Fragment>
			<div>
				<span>{ labelText || 'PayPal' }</span>
				{ store && <TaxLabel /> }
			</div>
			<PaymentMethodLogos className="paypal__logo payment-logos">
				<PayPalLogo />
			</PaymentMethodLogos>
		</Fragment>
	);
}

function TaxLabel() {
	const postalCode = useSelect(
		( select ) => ( select( storeKey ) as PaypalSelectors ).getPostalCode(),
		[]
	);
	const countryCode = useSelect(
		( select ) => ( select( storeKey ) as PaypalSelectors ).getCountryCode(),
		[]
	);
	const taxString = [ countryCode.value, postalCode.value ].filter( isValueTruthy ).join( ', ' );
	if ( taxString.length < 1 ) {
		return null;
	}
	return (
		<div>
			<span>{ taxString }</span>
		</div>
	);
}

function PayPalSubmitButton( {
	disabled,
	onClick,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
} ) {
	const { __ } = useI18n();
	const { formStatus } = useFormStatus();
	const { transactionStatus } = useTransactionStatus();
	const postalCode = useSelect(
		( select ) => ( select( storeKey ) as PaypalSelectors ).getPostalCode(),
		[]
	);
	const countryCode = useSelect(
		( select ) => ( select( storeKey ) as PaypalSelectors ).getCountryCode(),
		[]
	);
	const address1 = useSelect(
		( select ) => ( select( storeKey ) as PaypalSelectors ).getAddress1(),
		[]
	);
	const organization = useSelect(
		( select ) => ( select( storeKey ) as PaypalSelectors ).getOrganization(),
		[]
	);
	const city = useSelect( ( select ) => ( select( storeKey ) as PaypalSelectors ).getCity(), [] );
	const state = useSelect( ( select ) => ( select( storeKey ) as PaypalSelectors ).getState(), [] );

	const handleButtonPress = () => {
		if ( ! onClick ) {
			throw new Error(
				'Missing onClick prop; PayPalSubmitButton must be used as a payment button in CheckoutSubmitButton'
			);
		}
		onClick( {
			postalCode: postalCode?.value,
			countryCode: countryCode?.value,
			address: address1?.value,
			organization: organization?.value,
			city: city?.value,
			state: state?.value,
		} );
	};
	return (
		<Button
			disabled={ disabled }
			onClick={ handleButtonPress }
			buttonType="paypal"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
			aria-label={ __( 'Pay with PayPal' ) }
		>
			<PayPalButtonContents formStatus={ formStatus } transactionStatus={ transactionStatus } />
		</Button>
	);
}

const ButtonPayPalIcon = styled( PayPalLogo )`
	transform: translateY( 2px );
`;

function PayPalSummary() {
	return <>PayPal</>;
}

function PayPalButtonContents( {
	formStatus,
	transactionStatus,
}: {
	formStatus: FormStatus;
	transactionStatus: TransactionStatus;
} ) {
	const { __ } = useI18n();
	if ( transactionStatus === TransactionStatus.REDIRECTING ) {
		return <span>{ __( 'Redirecting to PayPal…' ) }</span>;
	}
	if ( formStatus === FormStatus.SUBMITTING ) {
		return <span>{ __( 'Processing…' ) }</span>;
	}
	if ( formStatus === FormStatus.READY ) {
		return <ButtonPayPalIcon />;
	}
	return <span>{ __( 'Please wait…' ) }</span>;
}
