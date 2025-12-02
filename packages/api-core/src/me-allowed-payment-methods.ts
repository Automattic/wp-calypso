import { wpcom } from './wpcom-fetcher';

export async function fetchAllowedPaymentMethods(): Promise< string[] > {
	return await wpcom.req.get( '/me/allowed-payment-methods' );
}
