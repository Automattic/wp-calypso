import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { APIError, SubmitContactSupportParams } from './types';

interface APIResponse {
	success: boolean;
	ticket_id?: number;
}

function mutationSubmitSupportForm( params: SubmitContactSupportParams ): Promise< APIResponse > {
	let path = '/agency/help/zendesk/create-ticket';

	if ( params.product === 'pressable' && params.contact_type === 'support' ) {
		path = '/agency/help/pressable/support';
	}

	// Create the ticket in Zendesk
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path,
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
