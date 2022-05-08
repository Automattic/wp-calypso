import { useMutation } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

type Ticket = {
	subject: string;
	message: string;
	locale: string;
	client: string;
	is_chat_overflow: boolean;
};

// for some reason, useMutation isn't returning mutateAsync, this is a bandage for that
type MutationResult = {
	isLoading: boolean;
	mutateAsync: ( ticket: Ticket ) => Promise< void >;
};

export function useSubmitTicketMutation(): MutationResult {
	return useMutation( ( newTicket: Ticket ) =>
		wpcomRequest( {
			path: '/help/tickets/kayako/new',
			apiVersion: '1.1',
			method: 'POST',
			body: newTicket,
		} )
	) as unknown as MutationResult;
}
