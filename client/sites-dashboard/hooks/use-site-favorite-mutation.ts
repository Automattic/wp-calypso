import { useMutation, UseMutationOptions, useIsMutating } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const ADD_SITE_FAVORITE = 'add-site-favorite-key';
export const DELETE_SITE_FAVORITE = 'delete-site-favorite-key';

export const useAddSiteFavorite = (
	siteId: number,
	options: UseMutationOptions< MutationResponse, MutationError >
) => {
	const mutation = useMutation( {
		mutationFn: async () =>
			wp.req.post( {
				path: `/sites/${ siteId }/site-favorite`,
				apiNamespace: 'wpcom/v2',
			} ),
		...options,
		mutationKey: [ ADD_SITE_FAVORITE, siteId ],
		onSuccess: options.onSuccess,
	} );

	const { mutate } = mutation;

	// isMutating is returning a number. Greater than 0 means we have some pending mutations for
	// the provided key. This is preserved across different pages, while isLoading it's not.
	// TODO: Remove that when react-query v5 is out. They seem to have added isPending variable for this.
	const isLoading = useIsMutating( { mutationKey: [ ADD_SITE_FAVORITE, siteId ] } ) > 0;

	return { addSiteFavorite: mutate, isLoading };
};

export const useDeleteSiteFavorite = (
	siteId: number,
	options: UseMutationOptions< MutationResponse, MutationError >
) => {
	const mutation = useMutation( {
		mutationFn: async () =>
			wp.req.post( {
				method: 'DELETE',
				path: `/sites/${ siteId }/site-favorite`,
				apiNamespace: 'wpcom/v2',
			} ),
		...options,
		mutationKey: [ DELETE_SITE_FAVORITE, siteId ],
		onSuccess: options.onSuccess,
	} );

	const { mutate } = mutation;

	// isMutating is returning a number. Greater than 0 means we have some pending mutations for
	// the provided key. This is preserved across different pages, while isLoading it's not.
	// TODO: Remove that when react-query v5 is out. They seem to have added isPending variable for this.
	const isLoading = useIsMutating( { mutationKey: [ DELETE_SITE_FAVORITE, siteId ] } ) > 0;

	return { deleteSiteFavorite: mutate, isLoading };
};
