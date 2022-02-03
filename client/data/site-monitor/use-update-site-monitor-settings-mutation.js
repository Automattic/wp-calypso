import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';

function useUpdateSiteMonitorSettingsMutation( siteId, queryOptions = {} ) {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { settings } ) => wp.req.post( `/jetpack-blogs/${ siteId }`, settings ),
		{
			...queryOptions,
			onSuccess( ...args ) {
				queryClient.invalidateQueries( [ 'site-monitor-settings', siteId ] );
				queryOptions.onSuccess?.( ...args );
			},
		}
	);

	const { mutate } = mutation;

	const updateSiteMonitorSettings = useCallback( ( settings ) => mutate( { settings } ), [
		mutate,
	] );

	return { updateSiteMonitorSettings, ...mutation };
}

export default useUpdateSiteMonitorSettingsMutation;
