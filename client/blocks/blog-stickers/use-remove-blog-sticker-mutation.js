import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

export const useRemoveBlogStickerMutation = ( options = {} ) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( { blogId, stickerName } ) => {
			const response = await wp.req.post(
				`/sites/${ blogId }/blog-stickers/remove/${ stickerName }`
			);

			if ( ! response.success ) {
				throw new Error( 'Blog sticker removal was unsuccessful on the server', response );
			}

			return response;
		},
		...options,
		onSuccess( ...args ) {
			const [ , { blogId } ] = args;
			queryClient.invalidateQueries( {
				queryKey: [ `blog-stickers`, blogId ],
			} );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate } = mutation;

	const removeBlogSticker = useCallback(
		( blogId, stickerName ) => mutate( { blogId, stickerName } ),
		[ mutate ]
	);

	return { removeBlogSticker, ...mutation };
};
