import { useMutation } from '@tanstack/react-query';
import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

type Ticket = {
	subject: string;
	message: string;
	locale: string;
	client: string;
	is_chat_overflow: boolean;
	source: string;
	blog_url: string;
	ai_chat_id?: string;
	ai_message?: string;
};

export function useSubmitTicketMutation() {
	return useMutation( {
		mutationFn: ( newTicket: Ticket ) =>
			canAccessWpcomApis()
				? wpcomRequest( {
						path: '/help/ticket/new',
						apiNamespace: 'wpcom/v2',
						method: 'POST',
						body: newTicket,
				  } )
				: apiFetch( {
						global: true,
						path: '/help-center/ticket/new',
						method: 'POST',
						data: newTicket,
				  } as APIFetchOptions ),
	} );
}
