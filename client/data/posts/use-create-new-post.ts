import { Post } from '@wordpress/core-data';
import { useCallback } from 'react';
import { useMutation } from 'react-query';
import wpcom from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';

export default function useCreateNewPost( mutationOptions = {} ) {
	const mutation = useMutation(
		async ( { siteId, post }: { siteId: SiteId; post: Post } ) =>
			wpcom.req.post(
				`/sites/${ siteId }/posts`,
				{
					apiNamespace: 'wp/v2',
				},
				{
					...post,
					status: 'publish',
				}
			),
		{
			...mutationOptions,
		}
	);

	const { mutate } = mutation;

	const createNewPost = useCallback(
		( siteId: SiteId, post: Post ) => mutate( { siteId, post } ),
		[ mutate ]
	);

	return { createNewPost, ...mutation };
}
