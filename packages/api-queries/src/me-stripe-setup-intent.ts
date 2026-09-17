import { createStripeSetupIntent } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import type { CreateSetupIntentParams } from '@automattic/api-core';

export const createStripeSetupIntentMutation = () =>
	mutationOptions( {
		meta: { statId: 'stripe-intent-create' },
		mutationFn: ( params: CreateSetupIntentParams ) => createStripeSetupIntent( params ),
	} );
