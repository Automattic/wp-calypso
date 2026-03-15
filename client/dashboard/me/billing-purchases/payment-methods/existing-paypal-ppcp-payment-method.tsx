import { Button, FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { PayPalLogo } from '../../../components/paypal-logo';
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
		<>
			<div>
				<span>PayPal { email }</span>
			</div>
			<div className="payment-logos">
				<PayPalLogo />
			</div>
		</>
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

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; ExistingPayPalPPCPPayButton must be used as a payment button in CheckoutSubmitButton'
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
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			{ submitButtonContent }
		</Button>
	);
}

function ExistingPayPalPPCPSummary( { email }: { email: string } ) {
	return (
		<div>
			<div>
				<PayPalLogo />
			</div>
			<div>{ email }</div>
		</div>
	);
}
