import { useMutation } from '@tanstack/react-query';
import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

type CSATPayload = {
	jwt: string;
	email: string;
	ticket_id: number;
	score: string;
	comment?: string;
	reason_id?: string;
	test_mode?: boolean;
};

export const useRateChat = () => {
	return useMutation( {
		mutationFn: ( payload: CSATPayload ) => {
			return canAccessWpcomApis()
				? wpcomRequest( {
						path: '/help/csat',
						apiNamespace: 'wpcom/v2',
						method: 'POST',
						body: payload,
				  } )
				: apiFetch( {
						global: true,
						path: '/help-center/zendesk/csat',
						method: 'POST',
						data: payload,
				  } as APIFetchOptions );
		},
	} );
};
