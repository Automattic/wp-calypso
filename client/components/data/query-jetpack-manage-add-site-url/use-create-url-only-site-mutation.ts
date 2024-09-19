import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { APIError } from 'calypso/state/partner-portal/types';

interface MutationVariables {
	url: string;
}

interface MutationResponse {
	blog_id: number;
}

export default function useCreateUrlOnlySiteMutation(
	options: UseMutationOptions< MutationResponse, APIError, MutationVariables > = {}
) {
	return useMutation( {
		mutationFn: async ( { url }: MutationVariables ) =>
			wp.req.post( {
				path: '/jetpack-manage/site',
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				body: { url },
			} ),
		...options,
	} );
}
