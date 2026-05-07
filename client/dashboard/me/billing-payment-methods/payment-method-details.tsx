import { getRazorpayVpa } from '@automattic/api-core';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Text } from '../../components/text';
import type { StoredPaymentMethod } from '@automattic/api-core';

export function PaymentMethodDetails( { paymentMethod }: { paymentMethod: StoredPaymentMethod } ) {
	if ( 'card_type' in paymentMethod && paymentMethod.card_type ) {
		return (
			<HStack justify="flex-start">
				<CardName cardType={ paymentMethod.card_type } />
				<Text>****{ paymentMethod.card_last_4 }</Text>
			</HStack>
		);
	}

	if ( paymentMethod.payment_partner.startsWith( 'paypal' ) ) {
		return (
			<HStack>
				<Text>{ paymentMethod.email }</Text>
			</HStack>
		);
	}

	const razorpayVpa = getRazorpayVpa( paymentMethod );
	if ( razorpayVpa ) {
		return (
			<HStack>
				<Text>{ __( 'Unified Payments Interface (UPI)' ) }</Text>
				<Text>{ razorpayVpa }</Text>
			</HStack>
		);
	}

	// Generic catchall for retired rows whose partner doesn't match a
	// dedicated branch above. After back-end retirement, the partner-specific
	// top-level fields are gone (replaced by `display_meta`), so the prior
	// branches (card / paypal / razorpay) wouldn't match. Falling through to
	// `null` would render a blank cell in the payment-methods list. Showing
	// the user's saved name keeps the row identifiable.
	if ( 'retired' in paymentMethod && paymentMethod.retired ) {
		return (
			<HStack>
				<Text>{ paymentMethod.name || __( 'Saved payment method' ) }</Text>
			</HStack>
		);
	}

	return null;
}

function CardName( { cardType }: { cardType: string } ) {
	switch ( cardType ) {
		case 'american express':
		case 'amex':
			return __( 'American Express' );
		case 'cartes_bancaires':
			return __( 'Cartes Bancaires' );
		case 'diners':
			return __( 'Diners Club' );
		case 'discover':
			// translators: This is the name of the credit card provider: Discover
			return __( 'Discover' );
		case 'jcb':
			return __( 'JCB' );
		case 'mastercard':
			return __( 'Mastercard' );
		case 'unionpay':
			return __( 'UnionPay' );
		case 'visa':
			return __( 'VISA' );
		default:
			return cardType;
	}
}
