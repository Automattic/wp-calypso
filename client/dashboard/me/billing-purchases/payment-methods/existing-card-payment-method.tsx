import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, _x, sprintf } from '@wordpress/i18n';
import { formatCreditCardExpiry } from '../../../utils/datetime';
import { PaymentMethodImage } from '../payment-method-image';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';
import type { ReactNode } from 'react';

export function createExistingCardMethod( {
	id,
	cardholderName,
	cardExpiry,
	brand,
	last4,
	storedDetailsId,
	paymentMethodToken,
	paymentPartnerProcessorId,
	submitButtonContent,
}: {
	id: string;
	cardholderName: string;
	cardExpiry: string;
	brand: string;
	last4: string;
	storedDetailsId: string;
	paymentMethodToken: string;
	paymentPartnerProcessorId: string;
	submitButtonContent: ReactNode;
} ): PaymentMethod {
	return {
		id,
		paymentProcessorId:
			paymentPartnerProcessorId === 'ebanx' ? 'existing-card-ebanx' : 'existing-card',
		label: (
			<ExistingCardLabel
				last4={ last4 }
				cardExpiry={ cardExpiry }
				cardholderName={ cardholderName }
				brand={ brand }
			/>
		),
		submitButton: (
			<ExistingCardPayButton
				cardholderName={ cardholderName }
				storedDetailsId={ storedDetailsId }
				paymentMethodToken={ paymentMethodToken }
				paymentPartnerProcessorId={ paymentPartnerProcessorId }
				submitButtonContent={ submitButtonContent }
			/>
		),
		inactiveContent: (
			<ExistingCardSummary
				cardholderName={ cardholderName }
				cardExpiry={ cardExpiry }
				brand={ brand }
				last4={ last4 }
			/>
		),
		getAriaLabel: () => `${ brand } ${ last4 } ${ cardholderName }`,
	};
}

function ExistingCardLabel( {
	last4,
	cardExpiry,
	cardholderName,
	brand,
}: {
	last4: string;
	cardExpiry: string;
	cardholderName: string;
	brand: string;
} ) {
	/* translators: %s is the last 4 digits of the credit card number */
	const maskedCardDetails = sprintf( _x( '**** %s', 'Masked credit card number' ), last4 );

	return (
		<HStack>
			<VStack>
				<Text>{ cardholderName }</Text>
				<HStack>
					<Text>{ maskedCardDetails }</Text>
					<span>{ `${ __( 'Expiry:' ) } ${ formatCreditCardExpiry(
						new Date( cardExpiry )
					) }` }</span>
				</HStack>
			</VStack>
			<PaymentMethodImage paymentMethodType={ brand } />
		</HStack>
	);
}

function ExistingCardPayButton( {
	disabled,
	onClick,
	cardholderName,
	storedDetailsId,
	paymentMethodToken,
	paymentPartnerProcessorId,
	submitButtonContent,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	cardholderName: string;
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
			'Missing onClick prop; ExistingCardPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				onClick( {
					name: cardholderName,
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

function ExistingCardSummary( {
	cardholderName,
	cardExpiry,
	brand,
	last4,
}: {
	cardholderName: string;
	cardExpiry: string;
	brand: string;
	last4: string;
} ) {
	/* translators: %s is the last 4 digits of the credit card number */
	const maskedCardDetails = sprintf( _x( '**** %s', 'Masked credit card number' ), last4 );

	return (
		<HStack>
			<Text>{ cardholderName }</Text>
			<HStack>
				<PaymentMethodImage paymentMethodType={ brand } />
				<Text>{ maskedCardDetails }</Text>
				<span>{ `${ __( 'Expiry:' ) } ${ formatCreditCardExpiry(
					new Date( cardExpiry )
				) }` }</span>
			</HStack>
		</HStack>
	);
}
