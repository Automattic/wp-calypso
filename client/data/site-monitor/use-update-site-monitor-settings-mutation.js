import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

function useUpdateSiteMonitorSettingsMutation( siteId, queryOptions = {} ) {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { settings } ) => wp.req.post( `/jetpack-blogs/${ siteId }`, settings ),
		...queryOptions,
		onSuccess( ...args ) {
			queryClient.invalidateQueries( {
				queryKey: [ 'site-monitor-settings', siteId ],
			} );
			queryOptions.onSuccess?.( ...args );
		},
	} );

	const { mutate } = mutation;

	const updateSiteMonitorSettings = useCallback(
		( settings ) => mutate( { settings } ),
		[ mutate ]
	);

	return { updateSiteMonitorSettings, ...mutation };
}

export default useUpdateSiteMonitorSettingsMutation;
