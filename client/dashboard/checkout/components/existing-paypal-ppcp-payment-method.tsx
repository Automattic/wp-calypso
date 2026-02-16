/**
 * Existing (saved) PayPal PPCP payment method for Dashboard checkout.
 * Shown when the user has a saved PayPal account on their profile.
 */
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { PayPalLogo } from '../../components/paypal-logo';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';
import type { ReactNode } from 'react';

export function createExistingPayPalPPCPMethod( {
	id,
	email,
	storedDetailsId,
	paymentMethodToken,
	paymentPartnerProcessorId,
	submitButtonContent,
}: {
	id: string;
	email: string;
	storedDetailsId: string;
	paymentMethodToken: string;
	paymentPartnerProcessorId: string;
	submitButtonContent: ReactNode;
} ): PaymentMethod {
	return {
		id,
		paymentProcessorId: 'existing-paypal-ppcp',
		label: <ExistingPayPalPPCPLabel email={ email } />,
		submitButton: (
			<ExistingPayPalPPCPPayButton
				email={ email }
				storedDetailsId={ storedDetailsId }
				paymentMethodToken={ paymentMethodToken }
				paymentPartnerProcessorId={ paymentPartnerProcessorId }
				submitButtonContent={ submitButtonContent }
			/>
		),
		inactiveContent: <ExistingPayPalPPCPSummary email={ email } />,
		getAriaLabel: () => `PayPal ${ email }`,
	};
}

function ExistingPayPalPPCPLabel( { email }: { email: string } ) {
	return (
		<HStack justify="space-between">
			<Text>PayPal { email }</Text>
			<PayPalLogo />
		</HStack>
	);
}

function ExistingPayPalPPCPPayButton( {
	disabled,
	onClick,
	email,
	storedDetailsId,
	paymentMethodToken,
	paymentPartnerProcessorId,
	submitButtonContent,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	email: string;
	storedDetailsId: string;
	paymentMethodToken: string;
	paymentPartnerProcessorId: string;
	submitButtonContent: ReactNode;
} ) {
	const { formStatus } = useFormStatus();

	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; ExistingPayPalPPCPPayButton must be used inside CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				onClick( {
					email,
					storedDetailsId,
					paymentMethodToken,
					paymentPartnerProcessorId,
				} );
			} }
			variant="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
		>
			{ submitButtonContent }
		</Button>
	);
}

function ExistingPayPalPPCPSummary( { email }: { email: string } ) {
	return (
		<HStack>
			<PayPalLogo />
			<Text>{ email }</Text>
		</HStack>
	);
}
