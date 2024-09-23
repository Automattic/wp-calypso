import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface APIResponse {
	status: string;
	message?: string;
}

interface SubscribeEmailParams {
	email_address: string;
	from: string;
	mailing_list_category: string;
}

function mutationSubscribeEmail( params: SubscribeEmailParams ): Promise< APIResponse > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/pigeon',
		body: params,
	} );
}

export default function useSubscribeEmailMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, Error, SubscribeEmailParams, TContext >
): UseMutationResult< APIResponse, Error, SubscribeEmailParams, TContext > {
	return useMutation( {
		...options,
		mutationFn: mutationSubscribeEmail,
	} );
}
