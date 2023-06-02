import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

interface TempSiteToSourceOption {
	targetBlogId: number;
	sourceBlogId: number;
}

function useAddTempSiteToSourceOptionMutation() {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { targetBlogId, sourceBlogId }: TempSiteToSourceOption ) =>
			wp.req.post(
				`/migrations/from-source/${ sourceBlogId }`,
				{
					apiNamespace: 'wpcom/v2',
				},
				{ target_blog_id: targetBlogId }
			),
		onSuccess( data, { sourceBlogId } ) {
			queryClient.setQueryData( [ 'temp-target-site', sourceBlogId ], data );
		},
	} );

	const { mutate } = mutation;
	const addTempSiteToSourceOption = useCallback(
		( targetBlogId: number, sourceBlogId: number ) => mutate( { targetBlogId, sourceBlogId } ),
		[ mutate ]
	);

	return { addTempSiteToSourceOption, ...mutation };
}

export default useAddTempSiteToSourceOptionMutation;
