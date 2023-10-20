import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';

const SET_SITE_INTERFACE_MUTATION_KEY = 'set-site-interface-mutation-key';

export const useSiteInterfaceMutation = ( siteId: number ) => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const queryKey = [ SET_SITE_INTERFACE_MUTATION_KEY, siteId ];
	const mutation = useMutation( {
		mutationFn: async ( selectedInterface: string ) => {
			wp.req.post(
				{
					path: `/sites/${ siteId }/hosting/admin-interface`,
					apiNamespace: 'wpcom/v2',
				},
				{
					interface: selectedInterface,
				}
			);
		},
		mutationKey: queryKey,
		onError( _err, _newActive, prevValue ) {
			// Revert to previous settings on failure
			queryClient.setQueryData( queryKey, Boolean( prevValue ) );
		},
		onSettled: () => {
			dispatch( requestSite( siteId ) );
		},
	} );

	const { mutate } = mutation;

	const setSiteInterface = useCallback( mutate, [ mutate ] );

	return setSiteInterface;
};
