import { wpcom } from './wpcom-fetcher';

export interface CreateSetupIntentParams {
	country?: string;
	cartKey?: string;
}

export async function createStripeSetupIntent( params: CreateSetupIntentParams ): Promise< {
	setup_intent_id?: string;
} > {
	return await wpcom.req.post( {
		path: '/me/stripe-setup-intent',
		body: {
			country: params.country,
			cart_key: params.cartKey,
		},
	} );
}
