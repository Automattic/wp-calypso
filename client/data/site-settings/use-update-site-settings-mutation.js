import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

function useUpdateSiteSettingsMutation( siteId, queryOptions = {} ) {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { settings } ) =>
			wp.req.post( '/sites/' + siteId + '/settings', { apiVersion: '1.4' }, settings ),
		...queryOptions,
		onSuccess( ...args ) {
			queryClient.invalidateQueries( {
				queryKey: [ 'site-settings', siteId ],
			} );
			queryOptions.onSuccess?.( ...args );
		},
	} );

	const { mutate } = mutation;

	const updateSiteSettings = useCallback( ( settings ) => mutate( { settings } ), [ mutate ] );

	return { updateSiteSettings, ...mutation };
}

export default useUpdateSiteSettingsMutation;
