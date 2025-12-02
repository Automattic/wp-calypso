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

interface TaxInfoForServer {
	tax_postal_code?: string;
	tax_country_code?: string;
	tax_subdivision_code?: string;
	tax_city?: string;
	tax_organization?: string;
	tax_address?: string;
}

function transformPaymentMethodTaxInfoForEndpoint(
	paymentMethodTaxInfo: StoredPaymentMethod[ 'tax_location' ]
): TaxInfoForServer {
	return {
		tax_postal_code: paymentMethodTaxInfo?.postal_code,
		tax_country_code: paymentMethodTaxInfo?.country_code,
		tax_subdivision_code: paymentMethodTaxInfo?.subdivision_code,
		tax_city: paymentMethodTaxInfo?.city,
		tax_organization: paymentMethodTaxInfo?.organization,
		tax_address: paymentMethodTaxInfo?.address,
	};
}

export async function setPaymentMethodTaxInfo(
	paymentMethodId: string,
	taxInfo: StoredPaymentMethod[ 'tax_location' ]
): Promise< void > {
	return await wpcom.req.post( {
		path: `/me/payment-methods/${ paymentMethodId }/tax-location`,
		body: transformPaymentMethodTaxInfoForEndpoint( taxInfo ),
	} );
}
