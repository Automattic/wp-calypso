import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import {
	getPostByEmailKeyQueryKey,
	getPostByEmailPath,
	parsePostByEmailResponse,
} from 'calypso/my-sites/site-settings/publishing-tools/hooks/use-get-post-by-email';
import type {
	PostByEmail,
	PostByEmailResponse,
} from 'calypso/my-sites/site-settings/publishing-tools/types';

export const useTogglePostByEmailMutation = ( siteId: number | null ) => {
	const queryClient = useQueryClient();
	const queryKey = getPostByEmailKeyQueryKey( siteId );

	return useMutation( {
		mutationFn: async ( shouldEnable: boolean ) => {
			const response: PostByEmailResponse = await wpcom.req.post( {
				method: shouldEnable ? 'POST' : 'DELETE',
				path: getPostByEmailPath( siteId ),
				apiNamespace: 'wpcom/v2',
			} );

			return parsePostByEmailResponse( response );
		},
		onMutate: async ( value: boolean ) => {
			await queryClient.cancelQueries( {
				queryKey,
			} );

			const restoreData = queryClient.getQueryData< PostByEmail >( queryKey );

			queryClient.setQueryData< PostByEmail >( queryKey, () => {
				return {
					isEnabled: value,
					address: undefined,
				};
			} );

			return { restoreData };
		},
		onSuccess: ( response ) => {
			queryClient.setQueryData< PostByEmail >( queryKey, response );
		},
		onError: ( err, value, context ) => {
			const restoreData = context?.restoreData;

			queryClient.setQueryData< PostByEmail >( queryKey, restoreData );
		},
	} );
};
