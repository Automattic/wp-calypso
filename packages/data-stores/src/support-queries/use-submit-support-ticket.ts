import { useMutation } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

type Ticket = {
	subject: string;
	message: string;
	locale: string;
	client: string;
	is_chat_overflow: boolean;
	is_help_center: boolean;
	blog_url: string;
};

export function useSubmitTicketMutation() {
	return useMutation( ( newTicket: Ticket ) =>
		wpcomRequest( {
			path: '/help/tickets/kayako/new',
			apiVersion: '1.1',
			method: 'POST',
			body: newTicket,
		} )
	);
}
