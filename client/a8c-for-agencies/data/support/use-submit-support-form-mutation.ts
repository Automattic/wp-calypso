import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { APIError, SubmitContactSupportParams } from './types';

interface APIResponse {
	success: boolean;
}

function mutationSubmitSupportForm( params: SubmitContactSupportParams ): Promise< APIResponse > {
	// Send an email to Pressable support
	if ( params.product === 'pressable' ) {
		// todo: Send the data to the endpoint
		return Promise.resolve( { success: true } );
	}

	// Create the ticket in Zendesk
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/agency/help/zendesk/create-ticket',
		body: params,
	} );
}

export default function useSubmitSupportFormMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, SubmitContactSupportParams, TContext >
): UseMutationResult< APIResponse, APIError, SubmitContactSupportParams, TContext > {
	return useMutation< APIResponse, APIError, SubmitContactSupportParams, TContext >( {
		...options,
		mutationFn: mutationSubmitSupportForm,
	} );
}
