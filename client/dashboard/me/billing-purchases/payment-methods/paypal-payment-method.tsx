import {
	FormStatus,
	TransactionStatus,
	useTransactionStatus,
	useFormStatus,
	Button,
} from '@automattic/composite-checkout';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Fragment, useState } from 'react';
import { PayPalLogo } from '../../../components/paypal-logo';
import { TaxLocationForm, defaultTaxLocation } from '../../../components/tax-location-form';
import type { StoredPaymentMethodTaxLocation } from '@automattic/api-core';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';

const processorId = 'paypal-express';

export function createPayPalMethod( { labelText }: { labelText?: string | null } ): PaymentMethod {
	let sharedTaxData = defaultTaxLocation;

	return {
		id: processorId,
		paymentProcessorId: processorId,
		label: <PayPalLabel labelText={ labelText } />,
		submitButton: <PayPalSubmitButton getTaxData={ () => sharedTaxData } />,
		activeContent: <PayPalFields onDataChange={ ( data ) => ( sharedTaxData = data ) } />,
		inactiveContent: <PayPalSummary />,
		getAriaLabel: () => 'PayPal',
	};
}

function PayPalLabel( { labelText = null }: { labelText?: string | null } ) {
	return (
		<Fragment>
			<div>
				<span>{ labelText || 'PayPal' }</span>
			</div>
			<PayPalLogo />
		</Fragment>
	);
}

function PayPalSubmitButton( {
	disabled,
	onClick,
	getTaxData,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	getTaxData: () => StoredPaymentMethodTaxLocation;
} ) {
	const { formStatus } = useFormStatus();
	const { transactionStatus } = useTransactionStatus();

	const handleButtonPress = () => {
		if ( ! onClick ) {
			throw new Error(
				'Missing onClick prop; PayPalSubmitButton must be used as a payment button in CheckoutSubmitButton'
			);
		}
		const taxData = getTaxData();
		onClick( {
			countryCode: taxData.country_code,
			postalCode: taxData.postal_code,
			address: taxData.address,
			organization: taxData.organization,
			city: taxData.city,
			state: taxData.subdivision_code,
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

function PayPalSummary() {
	return <>PayPal</>;
}

function PayPalFields( {
	onDataChange,
}: {
	onDataChange: ( data: StoredPaymentMethodTaxLocation ) => void;
} ) {
	const [ taxLocationData, setTaxLocationData ] =
		useState< StoredPaymentMethodTaxLocation >( defaultTaxLocation );

	return (
		<VStack className="paypal-fields">
			<TaxLocationForm
				data={ taxLocationData }
				onChange={ ( updated ) => {
					const newData = { ...taxLocationData, ...updated };
					setTaxLocationData( newData );
					onDataChange( newData );
				} }
			/>
		</VStack>
	);
}

function PayPalButtonContents( {
	formStatus,
	transactionStatus,
}: {
	formStatus: FormStatus;
	transactionStatus: TransactionStatus;
} ) {
	if ( transactionStatus === TransactionStatus.REDIRECTING ) {
		return <span>{ __( 'Redirecting to PayPal…' ) }</span>;
	}
	if ( formStatus === FormStatus.SUBMITTING ) {
		return <span>{ __( 'Processing…' ) }</span>;
	}
	if ( formStatus === FormStatus.READY ) {
		return <PayPalLogo />;
	}
	return <span>{ __( 'Please wait…' ) }</span>;
}
