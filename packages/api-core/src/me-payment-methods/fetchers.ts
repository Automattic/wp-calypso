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

export async function setPaymentMethodBackup(
	paymentMethodId: string,
	useAsBackup: boolean
): Promise< void > {
	return await wpcom.req.post( {
		path: `/me/payment-methods/${ paymentMethodId }/is-backup`,
		body: { is_backup: useAsBackup },
	} );
}

export async function requestPaymentMethodDeletion( paymentMethodId: string ) {
	return await wpcom.req.post( { path: `/me/stored-cards/${ paymentMethodId }/delete` } );
}
