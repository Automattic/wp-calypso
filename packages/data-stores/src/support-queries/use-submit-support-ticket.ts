import { useMutation } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

type Ticket = {
	subject: string;
	message: string;
	locale: string;
	client: string;
	is_chat_overflow: boolean;
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
