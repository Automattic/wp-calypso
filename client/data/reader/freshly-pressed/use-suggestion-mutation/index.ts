import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { getQueryKey as getEligibilityQueryKey } from '../use-eligibility-query';

type ApiResponse = {
	body: boolean;
};

const request = async ( blogId: number, postId: number ): Promise< ApiResponse > => {
	return ( await wpcom.req.post( {
		path: `/freshly-pressed/suggest/${ blogId }/${ postId }`,
		apiNamespace: 'wpcom/v2',
		body: {
			source: 'reader',
		},
	} ) ) as unknown as ApiResponse;
};

interface Options {
	onSuccess?: () => void;
	onError?: ( error: Error ) => void;
}

interface Params {
	blogId: number | undefined;
	postId: number | undefined;
}

const getMutationOptions = ( params: Params, options?: Options ) => {
	return {
		mutationKey: [ 'freshly-pressed', 'suggest', params.blogId, params.postId ],
		mutationFn: () => request( params.blogId!, params.postId! ),
		enabled: !! params.blogId && !! params.postId,
		onSuccess: options?.onSuccess,
		onError: options?.onError,
	};
};
/**
 * React query hook to suggest a post for freshly pressed
 * @param params - The parameters for the mutation
 * @param options - The options for the mutation
 * @returns The mutation options for the suggestion mutation
 */
export const useSuggestionMutation = ( params: Params, options?: Options ) => {
	const client = useQueryClient();

	const onSuccess = async () => {
		await client.invalidateQueries( { queryKey: getEligibilityQueryKey( params ) } );
		options?.onSuccess?.();
	};

	return useMutation(
		getMutationOptions( params, {
			...options,
			onSuccess,
		} )
	);
};
