import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { GlobalStylesObject } from '../types';

const useUpdateGlobalStylesUserConfig = (
	siteId: number | string,
	stylesheet: string,
	globalStylesId: number
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( globalStylesObject: GlobalStylesObject ) =>
			wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/global-styles/${ globalStylesId }`,
				method: 'POST',
				apiNamespace: 'wpcom/v2',
				body: {
					...globalStylesObject,
					id: globalStylesId,
				},
			} ),
		{
			onSuccess() {
				queryClient.invalidateQueries( [ 'globalStylesUserConfig', siteId, stylesheet ] );
			},
		}
	);

	const { mutate } = mutation;

	const updateGlobalStylesUserConfig = useCallback(
		( globalStylesObject ) => mutate( globalStylesObject ),
		[ mutate ]
	);

	return { updateGlobalStylesUserConfig, ...mutation };
};

export default useUpdateGlobalStylesUserConfig;
