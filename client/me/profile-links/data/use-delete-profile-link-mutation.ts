import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { type ProfileLink } from './types';

export const useDeleteProfileLinkMutation = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { linkSlug }: { linkSlug: string } ) => {
			return wp.req.post( `/me/settings/profile-links/${ linkSlug }/delete` );
		},
		onSuccess: ( data, { linkSlug } ) => {
			queryClient.setQueryData(
				[ 'profile-links' ],
				( oldProfileLinks: ProfileLink[] | undefined ) =>
					oldProfileLinks?.filter( ( link ) => link.link_slug !== linkSlug )
			);
		},
		onSettled: () => {
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
