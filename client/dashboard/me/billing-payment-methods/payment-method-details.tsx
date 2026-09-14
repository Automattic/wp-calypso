import { isRetiredPaymentMethod } from '@automattic/api-core';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Text } from '../../components/text';
import type { StoredPaymentMethod } from '@automattic/api-core';

export function PaymentMethodDetails( { paymentMethod }: { paymentMethod: StoredPaymentMethod } ) {
	// Retired rows lose their partner-specific top-level fields; the back-end
	// emits `display_label` + `display_detail` so any retired partner renders
	// uniformly without per-partner front-end code. Saved `name` and a generic
	// string are the final title fallbacks if `display_label` is absent.
	if ( isRetiredPaymentMethod( paymentMethod ) ) {
		const { display_label: label, display_detail: detail } = paymentMethod;
		return (
			<HStack>
				<Text>{ label || paymentMethod.name || __( 'Saved payment method' ) }</Text>
				{ detail && <Text>{ detail }</Text> }
			</HStack>
		);
	}

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

	if ( paymentMethod.payment_partner === 'razorpay' && 'razorpay_vpa' in paymentMethod ) {
		return (
			<HStack>
				<Text>{ __( 'Unified Payments Interface (UPI)' ) }</Text>
				<Text>{ paymentMethod.razorpay_vpa }</Text>
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
