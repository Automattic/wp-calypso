import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wpcom from 'calypso/lib/wp';

interface APIError {
	status: number;
	code: string | null;
	message: string;
	data?: any;
}

interface APIResponse {
	success: true;
}
function restoreSite( siteId: number ) {
	return wpcom.req.post( {
		method: 'put',
		apiNamespace: 'wpcom/v2',
		path: addQueryArgs( '/restore-site', { site_id: siteId } ),
	} );
}

export default function useRestoreSiteMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, number, TContext >
): UseMutationResult< APIResponse, APIError, number, TContext > {
	return useMutation< APIResponse, APIError, number, TContext >( {
		...options,
		mutationFn: ( siteId ) => restoreSite( siteId ),
	} );
}
