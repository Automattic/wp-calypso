import { wpcom } from '../wpcom-fetcher';
import type { StoredPaymentMethod, PaymentMethodRequestType } from './types';

export async function fetchUserPaymentMethods(
	type: PaymentMethodRequestType,
	expired: boolean
): Promise< StoredPaymentMethod[] > {
	return await wpcom.req.get( '/me/payment-methods', {
		type,
		expired: expired ? 'include' : 'exclude',
		apiVersion: '1.2',
	} );
}
