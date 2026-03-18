import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';

export interface SiteResetAPIResponse {
	success: boolean;
}

export interface APIError {
	status: number;
	code: string | null;
	message: string;
	data?: any;
}

export const useSiteResetMutation = <
	TData = SiteResetAPIResponse | APIError,
	TError = APIError,
	TContext = unknown,
>(
	options: UseMutationOptions< TData, TError, { siteId: number }, TContext > = {}
) => {
	const { mutate, ...rest } = useMutation( {
		mutationFn: ( { siteId } ) =>
			wpcomRequest( {
				path: `/sites/${ siteId }/reset-site`,
				apiNamespace: 'wpcom/v2',
				method: 'POST',
			} ),
		...options,
	} );

	const resetSite = useCallback( ( siteId: number ) => mutate( { siteId } ), [ mutate ] );

	return {
		resetSite,
		...rest,
	};
};
