import { getStripeConfiguration } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/get-stripe-configuration';
import type { StripeSetupIntentId } from '@automattic/calypso-stripe';

export async function createStripeSetupIntentForJetpackManage(): Promise< StripeSetupIntentId > {
	const configuration = await getStripeConfiguration( { needs_intent: true } );
	const intentId: string | undefined =
		configuration?.setup_intent_id && typeof configuration.setup_intent_id === 'string'
			? configuration.setup_intent_id
			: undefined;
	if ( ! intentId ) {
		throw new Error(
			'Error loading new payment method intent. Received invalid data from the server.'
		);
	}
	return intentId;
}
