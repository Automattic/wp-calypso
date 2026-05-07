import {
	FormStatus,
	TransactionStatus,
	useTransactionStatus,
	useFormStatus,
	Button,
} from '@automattic/composite-checkout';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useEffect, useState, Fragment } from 'react';
import { PayPalLogo } from 'calypso/dashboard/components/paypal-logo';
import TaxFields from 'calypso/my-sites/checkout/src/components/tax-fields';
import useCountryList from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import { PaymentMethodLogos } from '../components/payment-method-logos';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:paypal-payment-method' );

interface PayPalPaymentMethodStateShape {
	postalCode: string;
	countryCode: string;
	address1: string;
	organization: string;
	city: string;
	state: string;
}

type PayPalPaymentMethodKey = keyof PayPalPaymentMethodStateShape;

type StateSubscriber = () => void;

class PayPalPaymentMethodState {
	data: PayPalPaymentMethodStateShape = {
		postalCode: '',
		countryCode: '',
		address1: '',
		organization: '',
		city: '',
		state: '',
	};

	isTouched: Record< PayPalPaymentMethodKey, boolean > = {
		postalCode: false,
		countryCode: false,
		address1: false,
		organization: false,
		city: false,
		state: false,
	};

	subscribers: StateSubscriber[] = [];

	change = ( field: PayPalPaymentMethodKey, value: string ): void => {
		this.data[ field ] = value;
		this.isTouched[ field ] = true;
		this.notifySubscribers();
	};

	subscribe = ( callback: () => void ): ( () => void ) => {
		this.subscribers.push( callback );
		return () => {
			this.subscribers = this.subscribers.filter( ( subscriber ) => subscriber !== callback );
		};
	};

	notifySubscribers = (): void => {
		this.subscribers.forEach( ( subscriber ) => subscriber() );
	};
}

type PayPalMethodArgs = {
	labelText?: string | null;
	shouldShowTaxFields?: boolean;
};

export function createPayPalMethod( args: PayPalMethodArgs ): PaymentMethod {
	debug( 'creating new paypal payment method' );
	const state = new PayPalPaymentMethodState();

	return {
		id: 'paypal-express',
		paymentProcessorId: 'paypal-express',
		label: (
			<PayPalLabel
				labelText={ args.labelText }
				state={ args.shouldShowTaxFields ? state : undefined }
			/>
		),
		submitButton: <PayPalSubmitButton state={ state } />,
		activeContent: args.shouldShowTaxFields ? <PayPalTaxFields state={ state } /> : undefined,
		inactiveContent: <PayPalSummary />,
		getAriaLabel: () => 'PayPal',
	};
}

function useSubscribeToEventEmitter( state: PayPalPaymentMethodState ) {
	const [ , forceReload ] = useState( 0 );
	useEffect( () => {
		return state.subscribe( () => {
			forceReload( ( val: number ) => val + 1 );
		} );
	}, [ state ] );
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

function PayPalTaxFields( { state }: { state: PayPalPaymentMethodState } ) {
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const countriesList = useCountryList();
	useSubscribeToEventEmitter( state );

	const fields = {
		postalCode: { value: state.data.postalCode, isTouched: state.isTouched.postalCode, errors: [] },
		countryCode: {
			value: state.data.countryCode,
			isTouched: state.isTouched.countryCode,
			errors: [],
		},
		address1: { value: state.data.address1, isTouched: state.isTouched.address1, errors: [] },
		organization: {
			value: state.data.organization,
			isTouched: state.isTouched.organization,
			errors: [],
		},
		city: { value: state.data.city, isTouched: state.isTouched.city, errors: [] },
		state: { value: state.data.state, isTouched: state.isTouched.state, errors: [] },
	};

	const onChangeContactInfo = ( newInfo: ManagedContactDetails ) => {
		state.change( 'countryCode', newInfo.countryCode?.value ?? '' );
		state.change( 'postalCode', newInfo.postalCode?.value ?? '' );
		state.change( 'address1', newInfo.address1?.value ?? '' );
		state.change( 'organization', newInfo.organization?.value ?? '' );
		state.change( 'city', newInfo.city?.value ?? '' );
		state.change( 'state', newInfo.state?.value ?? '' );
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
	state,
}: {
	labelText?: string | null;
	state?: PayPalPaymentMethodState;
} ) {
	return (
		<Fragment>
			<div>
				<span>{ labelText || 'PayPal' }</span>
				{ state && <TaxLabel state={ state } /> }
			</div>
			<PaymentMethodLogos className="paypal__logo payment-logos">
				<PayPalLogo />
			</PaymentMethodLogos>
		</Fragment>
	);
}

function TaxLabel( { state }: { state: PayPalPaymentMethodState } ) {
	useSubscribeToEventEmitter( state );
	const taxString = [ state.data.countryCode, state.data.postalCode ]
		.filter( isValueTruthy )
		.join( ', ' );
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
	state,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	state: PayPalPaymentMethodState;
} ) {
	const { __ } = useI18n();
	const { formStatus } = useFormStatus();
	const { transactionStatus } = useTransactionStatus();
	useSubscribeToEventEmitter( state );

	const handleButtonPress = () => {
		if ( ! onClick ) {
			throw new Error(
				'Missing onClick prop; PayPalSubmitButton must be used as a payment button in CheckoutSubmitButton'
			);
		}
		onClick( {
			postalCode: state.data.postalCode,
			countryCode: state.data.countryCode,
			address: state.data.address1,
			organization: state.data.organization,
			city: state.data.city,
			state: state.data.state,
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
