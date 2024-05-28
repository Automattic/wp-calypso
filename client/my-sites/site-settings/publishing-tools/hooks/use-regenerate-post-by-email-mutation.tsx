import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import {
	getPostByEmailKeyQueryKey,
	getPostByEmailPath,
} from 'calypso/my-sites/site-settings/publishing-tools/hooks/use-get-post-by-email';
import type {
	PostByEmail,
	PostByEmailResponse,
} from 'calypso/my-sites/site-settings/publishing-tools/types';

export const useRegeneratePostByEmailMutation = ( siteId: number | null ) => {
	const queryClient = useQueryClient();
	const queryKey = getPostByEmailKeyQueryKey( siteId );

	return useMutation( {
		mutationFn: async () => {
			const response: PostByEmailResponse = await wpcom.req.put( {
				method: 'PUT',
				path: getPostByEmailPath( siteId ),
				apiNamespace: 'wpcom/v2',
			} );

			const previousData = queryClient.getQueryData< PostByEmail >( queryKey );

			if ( ! previousData ) {
				return;
			}

			return {
				...previousData,
				email: response.email,
			};
		},
		onSuccess: ( response ) => {
			queryClient.setQueryData< PostByEmail >( queryKey, response );
		},
	} );
};
