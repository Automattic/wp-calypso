import { useMemo } from 'react';
import { createPayPalMethod } from './paypal-payment-method';
import type { PaymentMethod } from '@automattic/composite-checkout';

export function useCreatePayPalExpress( {
	labelText,
}: {
	labelText?: string | null;
} ): PaymentMethod | null {
	const paypalMethod = useMemo( () => createPayPalMethod( { labelText } ), [ labelText ] );
	return paypalMethod;
}
