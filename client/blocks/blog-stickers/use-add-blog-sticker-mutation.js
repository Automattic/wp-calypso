import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';

export const useAddBlogStickerMutation = ( options = {} ) => {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { blogId, stickerName } ) =>
			wp.req.post( `/sites/${ blogId }/blog-stickers/add/${ stickerName }` ),
		{
			...options,
			onSuccess( ...args ) {
				const [ , { blogId } ] = args;
				queryClient.invalidateQueries( [ `blog-stickers`, blogId ] );
				options.onSuccess?.( ...args );
			},
		}
	);

	const { mutate } = mutation;

	const addBlogSticker = useCallback(
		( blogId, stickerName ) => mutate( { blogId, stickerName } ),
		[ mutate ]
	);

	return { addBlogSticker, ...mutation };
};
