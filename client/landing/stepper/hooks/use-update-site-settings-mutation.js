import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import wpcom from 'calypso/lib/wp';

function useUpdateSiteSettingsMutation( queryOptions = {} ) {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { siteIdOrSlug, newSettings } ) =>
			wpcom.req.post(
				`/sites/${ siteIdOrSlug }/settings`,
				{ apiNamespace: 'rest/v1.4' },
				newSettings
			),
		{
			...queryOptions,
			onSuccess( data, variables, context ) {
				queryClient.invalidateQueries( [ 'settings', variables.siteIdOrSlug ] );
				queryOptions.onSuccess?.( data, variables, context );
			},
		}
	);

	const { mutate } = mutation;

	const updateSiteSettings = useCallback(
		( siteIdOrSlug, newSettings ) => mutate( { siteIdOrSlug, newSettings } ),
		[ mutate ]
	);

	return { updateSiteSettings, ...mutation };
}

export default useUpdateSiteSettingsMutation;
