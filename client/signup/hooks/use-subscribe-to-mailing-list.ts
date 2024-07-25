import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface APIResponse {
	status: string;
	message?: string;
}

interface SubscribeToMailingListParams {
	email_address: string;
	from: string;
	mailing_list_category: string;
}

function mutationSubscribeToMailingList(
	params: SubscribeToMailingListParams
): Promise< APIResponse > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/pigeon',
		body: params,
	} );
}

export default function useCreateNewAccountMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, Error, SubscribeToMailingListParams, TContext >
): UseMutationResult< APIResponse, Error, SubscribeToMailingListParams, TContext > {
	return useMutation( {
		...options,
		mutationFn: mutationSubscribeToMailingList,
	} );
}
