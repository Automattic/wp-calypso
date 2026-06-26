/**
 * External dependencies
 */
import { useMutation } from '@tanstack/react-query';
import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
/**
 * Internal dependencies
 */
import type { UserFields } from './types';

interface UseUpdateZendeskUserFieldsOptions {
	throwOnError?: boolean;
}

export function useUpdateZendeskUserFields( {
	throwOnError = true,
}: UseUpdateZendeskUserFieldsOptions = {} ) {
	return useMutation( {
		throwOnError,
		mutationFn: ( userFields: UserFields ) => {
			return canAccessWpcomApis()
				? wpcomRequest( {
						path: '/help/zendesk/update-user-fields',
						apiNamespace: 'wpcom/v2',
						method: 'POST',
						body: { fields: userFields },
				  } )
				: apiFetch( {
						global: true,
						path: '/help-center/zendesk/user-fields',
						method: 'POST',
						data: { fields: userFields },
				  } as APIFetchOptions );
		},
	} );
}
