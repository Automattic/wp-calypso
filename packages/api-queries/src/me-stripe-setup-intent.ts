import { createStripeSetupIntent } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import type { CreateSetupIntentParams } from '@automattic/api-core';

export const createStripeSetupIntentMutation = () =>
	mutationOptions( {
		mutationFn: ( params: CreateSetupIntentParams ) => createStripeSetupIntent( params ),
	} );
