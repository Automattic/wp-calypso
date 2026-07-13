import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { APIError, SubmitContactSupportParams } from './types';

interface APIResponse {
	success: boolean;
	ticket_id?: number;
}

function getMutationFn( isSignup: boolean ) {
	return function mutationSubmitSupportForm(
		params: SubmitContactSupportParams
	): Promise< APIResponse > {
		let path = '/agency/help/zendesk/create-ticket';

		if ( isSignup ) {
			// Public endpoint used before the user has an agency, e.g. when the
			// signup flow is blocked by a duplicate-agency check.
			path = '/agency/signup/contact-support';
		} else if ( params.product === 'pressable' && params.contact_type === 'support' ) {
			path = '/agency/help/pressable/support';
		}

		return wpcom.req.post( {
			apiNamespace: 'wpcom/v2',
			path,
			body: params,
		} );
	};
}

type MutationOptions< TContext > = UseMutationOptions<
	APIResponse,
	APIError,
	SubmitContactSupportParams,
	TContext
> & {
	isSignup?: boolean;
};

export default function useSubmitSupportFormMutation< TContext = unknown >(
	options?: MutationOptions< TContext >
): UseMutationResult< APIResponse, APIError, SubmitContactSupportParams, TContext > {
	const { isSignup = false, ...mutationOptions } = options ?? {};

	return useMutation< APIResponse, APIError, SubmitContactSupportParams, TContext >( {
		...mutationOptions,
		mutationFn: getMutationFn( isSignup ),
	} );
}
