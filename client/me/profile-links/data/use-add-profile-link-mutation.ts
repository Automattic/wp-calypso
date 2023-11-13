import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import type {
	AddProfileLinksMutationOptions,
	AddProfileLinksPayload,
	AddProfileLinksResponse,
	AddProfileLinksVariables,
	ProfileLink,
} from './types';

export const useAddProfileLinkMutation = ( options: AddProfileLinksMutationOptions = {} ) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { links }: AddProfileLinksVariables ): Promise< AddProfileLinksResponse > => {
			return wp.req.post( `/me/settings/profile-links/new`, { apiVersion: '1.2' }, { links } );
		},
		...options,
		onSuccess: ( ...args ) => {
			const [ data ] = args;

			queryClient.setQueryData(
				[ 'profile-links' ],
				( cachedProfileLinks: ProfileLink[] | undefined ) => {
					if ( ! cachedProfileLinks || ! data.added ) {
						return cachedProfileLinks;
					}
					return [ ...cachedProfileLinks, ...data.added ];
				}
			);

			queryClient.invalidateQueries( [ 'profile-links' ] );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate, mutateAsync } = mutation;

	const addProfileLinks = useCallback(
		( links: AddProfileLinksPayload ) => {
			mutate( { links } );
		},
		[ mutate ]
	);

	const addProfileLinksAsync = useCallback(
		( links: AddProfileLinksPayload ) => {
			return mutateAsync( { links } );
		},
		[ mutateAsync ]
	);

	return { ...mutation, addProfileLinks, addProfileLinksAsync };
};
