import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

export const useDeleteProfileLinkMutation = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { linkSlug }: { linkSlug: string } ) => {
			return wp.req.post( `/me/settings/profile-links/${ linkSlug }/delete` );
		},
		onSuccess: () => {
			queryClient.invalidateQueries( [ 'profile-links' ] );
		},
	} );

	const { mutate } = mutation;

	const deleteProfileLink = useCallback(
		( linkSlug: string ) => {
			mutate( { linkSlug } );
		},
		[ mutate ]
	);

	return { ...mutation, deleteProfileLink };
};
