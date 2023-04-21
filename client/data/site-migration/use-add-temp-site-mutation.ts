import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';

interface TempSiteToSourceOption {
	targetBlogId: number;
	sourceBlogId: number;
}

function useAddTempSiteToSourceOptionMutation() {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { targetBlogId, sourceBlogId }: TempSiteToSourceOption ) =>
			wp.req.post(
				`/migrations/from-source/${ sourceBlogId }`,
				{
					apiNamespace: 'wpcom/v2',
				},
				{ target_blog_id: targetBlogId }
			),
		{
			onSuccess( data, { sourceBlogId } ) {
				queryClient.setQueryData( [ 'temp-target-site', sourceBlogId ], data );
			},
		}
	);

	const { mutate } = mutation;
	const addTempSiteToSourceOption = useCallback(
		( targetBlogId: number, sourceBlogId: number ) => mutate( { targetBlogId, sourceBlogId } ),
		[ mutate ]
	);

	return { addTempSiteToSourceOption, ...mutation };
}

export default useAddTempSiteToSourceOptionMutation;
