import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import type {
	AddProfileLinksMutationOptions,
	AddProfileLinksPayload,
	AddProfileLinksResponse,
	AddProfileLinksVariables,
} from './types';

export const useAddProfileLinkMutation = ( options: AddProfileLinksMutationOptions = {} ) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { links }: AddProfileLinksVariables ): Promise< AddProfileLinksResponse > => {
			return wp.req.post( `/me/settings/profile-links/new`, { apiVersion: '1.2' }, { links } );
		},
		...options,
		onSuccess: ( ...args ) => {
			queryClient.invalidateQueries( [ 'profile-links' ] );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate } = mutation;

	const addProfileLinks = useCallback(
		( links: AddProfileLinksPayload ) => {
			mutate( { links } );
		},
		[ mutate ]
	);

	return { ...mutation, addProfileLinks };
};
