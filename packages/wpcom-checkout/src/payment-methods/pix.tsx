import { Button, FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { Fragment, ReactNode } from 'react';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';

export function createPixPaymentMethod( {
	submitButtonContent,
}: {
	submitButtonContent: ReactNode;
} ): PaymentMethod {
	return {
		id: 'pix',
		paymentProcessorId: 'pix',
		label: <PixLabel />,
		submitButton: <PixPayButton submitButtonContent={ submitButtonContent } />,
		getAriaLabel: () => 'Pix',
	};
}

function PixPayButton( {
	disabled,
	onClick,
	submitButtonContent,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	submitButtonContent: ReactNode;
} ) {
	const { formStatus } = useFormStatus();

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; PixPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				onClick( {} );
			} }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			{ submitButtonContent }
		</Button>
	);
}

function PixLabel() {
	return (
		<Fragment>
			<span>Pix</span>
		</Fragment>
	);
}
