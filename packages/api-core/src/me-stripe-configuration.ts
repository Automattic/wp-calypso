import { wpcom } from './wpcom-fetcher';

/**
 * Stripe payment processor configuration
 */
export interface StripeConfiguration {
	js_url: string;
	public_key: string;
	processor_id: string;
}

export async function fetchStripeConfiguration( requestArgs?: {
	country?: string;
	payment_partner?: string;
} ): Promise< StripeConfiguration > {
	return await wpcom.req.get( '/me/stripe-configuration', requestArgs );
}
