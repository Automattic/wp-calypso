import { GetStripeConfigurationArgs } from '@automattic/calypso-stripe';
import wp from 'calypso/lib/wp';

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
