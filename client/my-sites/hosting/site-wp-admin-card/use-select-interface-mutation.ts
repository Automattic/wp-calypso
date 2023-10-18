import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';

const TOGGLE_SITE_INTERFACE_MUTATION_KEY = 'set-site-interface-mutation-key';
const interfaceName = 'wp-admin';

export const useSiteInterfaceMutation = ( siteId: number ) => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const queryKey = [ TOGGLE_SITE_INTERFACE_MUTATION_KEY, siteId ];
	const mutation = useMutation( {
		mutationFn: async ( enabled: boolean ) => {
			const selectedInterface = enabled ? 'wp-admin' : 'calypso';
			return wp.req.post( {
				path: `/sites/${ siteId }/hosting/admin-interface?interface=${ selectedInterface }`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		mutationKey: queryKey,
		onMutate: async () => {
			await queryClient.cancelQueries( queryKey );
			const previousData = queryClient.getQueryData( queryKey );
			queryClient.setQueryData( queryKey, interfaceName );
			dispatch( requestSite( siteId ) );
			return previousData;
		},
		onError( _err, _newActive, prevValue ) {
			// Revert to previous settings on failure
			queryClient.setQueryData( queryKey, Boolean( prevValue ) );
		},
		onSettled: () => {
			// Refetch settings regardless
			queryClient.invalidateQueries( queryKey );
		},
	} );

	const { mutate } = mutation;

	const toggleSiteInterface = useCallback( mutate, [ mutate ] );

	return toggleSiteInterface;
};
