import { useMutation } from '@tanstack/react-query';
import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

type ZendeskUserFields = {
	messaging_initial_message?: string;
	messaging_plan?: string;
	messaging_source?: string;
	messaging_url?: string;
};

export function useUpdateZendeskUserFieldsMutation() {
	return useMutation( {
		mutationFn: ( userFields: ZendeskUserFields ) => {
			return canAccessWpcomApis()
				? wpcomRequest( {
						path: 'help/zendesk/update-user-fields',
						apiNamespace: 'wpcom/v2/',
						apiVersion: '2',
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
