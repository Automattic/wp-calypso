import wp from 'calypso/lib/wp';
import type { GetStripeConfigurationArgs } from '@automattic/calypso-stripe';

export async function getStripeConfiguration(
	requestArgs: GetStripeConfigurationArgs & { needs_intent?: boolean }
) {
	const config = await wp.req.get(
		{
			apiNamespace: 'wpcom/v2',
			path: '/jetpack/stripe/configuration',
		},
		requestArgs
	);
	return config;
}
