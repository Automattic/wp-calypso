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
