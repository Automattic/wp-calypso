import { UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { type ProfileLink } from './types';

type DeleteProfileLinkMutationOptions = UseMutationOptions<
	unknown,
	Error,
	{ linkSlug: string },
	unknown
>;

export const useDeleteProfileLinkMutation = ( options: DeleteProfileLinkMutationOptions = {} ) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { linkSlug }: { linkSlug: string } ) => {
			return wp.req.post( `/me/settings/profile-links/${ linkSlug }/delete` );
		},
		onSuccess: ( ...args ) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const [ _data, { linkSlug } ] = args;
			queryClient.setQueryData(
				[ 'profile-links' ],
				( oldProfileLinks: ProfileLink[] | undefined ) =>
					oldProfileLinks?.filter( ( link ) => link.link_slug !== linkSlug )
			);
			options.onSuccess?.( ...args );
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
