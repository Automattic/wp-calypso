import { useCallback } from 'react';
import { useMutation } from 'react-query';
import wpcom from 'calypso/lib/wp';

export default function useCreateNewPost( mutationOptions = {} ) {
	const mutation = useMutation(
		async ( { siteId, post } ) => {
			console.log( 'post', post );
			return wpcom.req.post(
				`/sites/${ siteId }/posts`,
				{
					apiNamespace: 'wp/v2',
				},
				{
					status: 'publish',
					...post,
				}
			);
		},
		{
			...mutationOptions,
		}
	);

	const { mutate } = mutation;

	const createNewPost = useCallback( ( siteId, post ) => mutate( { siteId, post } ), [ mutate ] );

	return { createNewPost, ...mutation };
}
