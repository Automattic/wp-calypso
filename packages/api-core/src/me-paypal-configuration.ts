import { wpcom } from './wpcom-fetcher';

/**
 * Named for the wire shape: `@automattic/calypso-paypal` exports its own
 * `PayPalConfiguration`, which is this data after camelCasing.
 */
export interface PayPalConfigurationResponse {
	client_id: string | undefined;
}

export async function fetchPayPalConfiguration(): Promise< PayPalConfigurationResponse > {
	return await wpcom.req.get( '/me/paypal-configuration' );
}
