import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import { useMutation } from 'react-query';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

type Ticket = {
	subject: string;
	message: string;
	locale: string;
	client: string;
	is_chat_overflow: boolean;
	source: string;
	blog_url: string;
};

export function useSubmitTicketMutation() {
	return useMutation( ( newTicket: Ticket ) =>
		canAccessWpcomApis()
			? wpcomRequest( {
					path: 'help/ticket/new',
					apiNamespace: 'wpcom/v2/',
					apiVersion: '2',
					method: 'POST',
					body: newTicket,
			  } )
			: apiFetch( {
					global: true,
					path: '/help-center/ticket/new',
					method: 'POST',
					data: newTicket,
			  } as APIFetchOptions )
	);
}
